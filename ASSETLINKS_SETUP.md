# Android App Links certificate fingerprints

The source project tells Android to verify:

`https://link.crownempire.publicvm.com/p/...`

Android retrieves:

`https://link.crownempire.publicvm.com/.well-known/assetlinks.json`

The two fingerprints in `public/.well-known/assetlinks.json` MUST match the certificates that sign the APK/AAB you install.

For the current Gradle config, release uses the package `com.crownempire.app` and debug uses `com.crownempire.app.debug`. A Play Store build will normally use the Google Play App Signing certificate for the production association.

Get fingerprints in Android Studio with the Gradle `signingReport` task, and for Play production use the SHA-256 certificate fingerprint shown in Google Play Console for **App signing key certificate**. Replace the placeholders exactly, keeping uppercase/lowercase or colon formatting as accepted by Android asset links tooling.
