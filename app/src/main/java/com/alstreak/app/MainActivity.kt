package com.alstreak.app

import android.annotation.SuppressLint
import android.app.Activity
import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader

class MainActivity : Activity() {
    private lateinit var web: WebView
    private var downloadId: Long = -1L

    // When the update file has finished downloading, open the Android installer for it.
    private val onDownloaded = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L)
            if (id == -1L || id != downloadId) return
            val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val uri = dm.getUriForDownloadedFile(id) ?: return
            val install = Intent(Intent.ACTION_VIEW)
                .setDataAndType(uri, "application/vnd.android.package-archive")
                .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
            try { startActivity(install) } catch (e: Exception) { /* the notification still opens it */ }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.parseColor("#7B63E8")
        window.navigationBarColor = Color.parseColor("#F1EEFF")

        // Serves the app files from inside the APK over a secure https address,
        // so saving progress and sign-in hashing work offline.
        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        web = WebView(this)
        web.setBackgroundColor(Color.parseColor("#F1EEFF"))
        setContentView(web)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.allowFileAccess = false
        web.settings.textZoom = 100   // keep the layout the same even with a large system font
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = loader.shouldInterceptRequest(request.url)

            // Anything that is not the app itself (the update link) never replaces the app screen.
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                if (request.url.host == "appassets.androidplatform.net") return false
                downloadUpdate(request.url.toString())
                return true
            }
        }
        web.setDownloadListener { url, _, _, _, _ -> downloadUpdate(url) }

        val filter = IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
        if (Build.VERSION.SDK_INT >= 33) {
            registerReceiver(onDownloaded, filter, Context.RECEIVER_EXPORTED)
        } else {
            registerReceiver(onDownloaded, filter)
        }
        web.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    // Only files from GitHub are downloaded. The system shows its own download notification.
    private fun downloadUpdate(url: String) {
        if (!url.startsWith("https://github.com/")) return
        try {
            val request = DownloadManager.Request(Uri.parse(url))
                .setTitle("A/L Streak update")
                .setDescription("Tap to install when finished")
                .setMimeType("application/vnd.android.package-archive")
                .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                .setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, "al-streak-update.apk")
            val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            downloadId = dm.enqueue(request)
        } catch (e: Exception) {
            // Fall back to the browser if the download manager is unavailable.
            try { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) } catch (e2: Exception) { }
        }
    }

    // The app handles Back itself (close a lesson, go to Home...). It only
    // exits when the page says there is nothing left to go back to.
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        web.evaluateJavascript("(function(){return window.onBack?window.onBack():false})()") { handled ->
            if (handled != "true") finish()
        }
    }

    override fun onDestroy() {
        try { unregisterReceiver(onDownloaded) } catch (e: Exception) { }
        super.onDestroy()
    }
}
