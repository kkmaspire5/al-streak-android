# A/L Streak: Android app (builds in the cloud)

This is a real Android app (a Kotlin shell around the A/L Streak screens). It has its own icon, opens with no browser, and works fully offline. Nothing big is downloaded on your laptop: GitHub builds the APK on its own computers.

## 1. Put it on GitHub (browser only)
1. Unzip this folder.
2. On github.com click New repository, name it `al-streak-android`, set it Public, create it.
3. Click "uploading an existing file" and drag in EVERYTHING from the unzipped folder (the `app` folder, the `.github` folder, and all loose files). Click Commit changes.
   - If the `.github` folder does not come across, click Add file > Create new file, type `.github/workflows/build.yml` as the name, and paste the contents of that file.
4. Open the Actions tab. If it asks, click "I understand my workflows, enable them". The build starts by itself and takes about 5 to 8 minutes.

## 2. Get the APK
When the build shows a green tick, open the repo's Releases page (right-hand side). Download `al-streak.apk`. It is only a few MB.

## 3. Install on an Android phone
Open the downloaded APK. Android will ask you to allow installing from this source (once). Then tap Install. The icon appears on the home screen.

## Updating the app or questions
Edit `app/src/main/assets/questions.js` (add questions; see CONTENT-GUIDE.md), `app.js` or `style.css` right on GitHub (pencil icon), then Commit. A new build runs and replaces the file under Releases. Friends install it over the old one and keep their progress.

## If the build shows a red cross
Open the failed run, click the red step, and copy the last 30 lines of the log to Claude.

## Notes
- Accounts and progress live on each phone. Uninstalling the app erases them.
- Google is changing sideloading rules (developer verification). If installs get blocked later, check the Android Developer Console for the free limited-distribution account.

## Your logo
Replace `app/src/main/assets/logo.png` (square PNG, 512x512 or bigger) on GitHub. The build makes the phone icons from it automatically and the sign-in screen shows it too.
