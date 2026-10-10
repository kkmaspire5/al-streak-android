plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.alstreak.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.alstreak.app"
        minSdk = 24
        targetSdk = 34
        versionCode = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()
        versionName = "1.0"
    }

    signingConfigs {
        create("shared") {
            storeFile = file("shared.keystore")
            storePassword = "android"
            keyAlias = "alstreak"
            keyPassword = "android"
        }
    }

    buildTypes {
        getByName("debug") { signingConfig = signingConfigs.getByName("shared") }
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("shared")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.webkit:webkit:1.11.0")
}
