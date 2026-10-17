# A/L Streak: Android app (builds in the cloud)

A Kotlin shell around the A/L Streak screens. It has its own icon, opens with no browser, and lessons work fully offline. GitHub builds the APK on its own computers, so nothing big is installed on your laptop.

## 1. Put it on GitHub (browser only)
1. Unzip this folder.
2. On github.com open your repo (or create one named `al-streak-android`, **Public**).
3. **Add file > Upload files**, drag in EVERYTHING from inside the unzipped folder (`app`, `tools`, `content`, and the loose files, including `whatsnew.md`). Commit.
4. The `.github` folder may not upload. Open `.github/workflows/build.yml` in the repo, click the pencil and paste in the contents of the new file from this zip.
5. Open the **Actions** tab. The build takes about 5 to 8 minutes.

## 2. Get the APK
When the build shows a green tick, open **Releases** and download `al-streak.apk`. Install it over the old one; progress is kept.

## 3. Shipping an update later
1. Change what you want (questions, code, logo).
2. Edit `whatsnew.md`: one line starting with `- ` for each change. This is what students see in the update pop-up.
3. Commit. The new build appears under Releases, and installed apps show **Update available** with the list, an **Update now** button and a **Skip** button.
4. Update now downloads the file from GitHub and Android asks to install it.

Android will ask once to allow installs from this app. If a student taps Skip, the update stays available under Profile > Updates.

## Adding questions without a new build
Questions placed in `content/packs.json` are downloaded by the app (Profile > Question packs > Sync, and automatically at start-up). Committing a change in `content/` does not trigger an app build. See `CONTENT-GUIDE.md` for the format.

## Your logo
Replace `app/src/main/assets/logo.png` (square PNG, 512x512 or bigger). The build makes the phone icons from it, and the sign-in screen shows it too.

## If the build shows a red cross
Open the failed run, click the red step, and copy the last 30 lines of the log to Claude.

## Notes
- Accounts and progress live on each phone. Uninstalling erases them.
- The app now uses the internet permission only to look for updates and new question packs.
- Icons are from Lucide (ISC licence, see `LICENSE-lucide.txt`).
- Google is changing sideloading rules (developer verification). If installs get blocked later, check the Android Developer Console for the free limited-distribution account.
