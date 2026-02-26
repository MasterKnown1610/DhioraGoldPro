# Keystore Transfer Guide

## Files to Copy

Copy these files from your current system to the new system:

### 1. Keystore Files
- `android/app/release.keystore` - **CRITICAL: Keep this secure!**
- `android/app/debug.keystore` - Optional (can be regenerated)

### 2. Configuration Files
- `android/keystore.properties` - Contains keystore passwords and paths

## Transfer Steps

### Step 1: Copy Files to New System

On your **current system**, copy these files:
```
android/app/release.keystore
android/app/debug.keystore (optional)
android/keystore.properties
```

### Step 2: Place Files on New System

On your **new system**, place the files in the same locations:
```
YourProject/android/app/release.keystore
YourProject/android/app/debug.keystore (optional)
YourProject/android/keystore.properties
```

### Step 3: Verify File Permissions

Make sure the keystore files are readable (but keep them secure):
- Windows: Files should be accessible
- Mac/Linux: `chmod 600 android/app/release.keystore` (optional, for security)

### Step 4: Verify Configuration

Check that `android/app/build.gradle` has the correct signing configuration:

```gradle
signingConfigs {
    release {
        storeFile file("${rootDir}/app/release.keystore")
        storePassword "goldapplive123"
        keyAlias "goldapplive-key"
        keyPassword "goldapplive123"
    }
}
```

## Current Keystore Information

Based on your current setup:

- **Keystore File**: `android/app/release.keystore`
- **Store Password**: `goldapplive123`
- **Key Alias**: `goldapplive-key`
- **Key Password**: `goldapplive123`

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit keystore files to Git (they should be in `.gitignore`)
- Keep backup copies in a secure location
- If you lose the keystore file, you cannot update your app on Google Play Store
- Consider using environment variables or secure storage for passwords

## Verification

After transferring, test the build:

```bash
cd android
gradlew.bat bundleRelease
```

If the build succeeds, your keystore is correctly configured!

## Alternative: Using keystore.properties (Recommended)

Your `build.gradle` already supports `keystore.properties`. Make sure it contains:

```properties
storePassword=goldapplive123
keyPassword=goldapplive123
keyAlias=goldapplive-key
storeFile=app/release.keystore
```

This way, you can keep passwords out of `build.gradle` (though currently both are present).

