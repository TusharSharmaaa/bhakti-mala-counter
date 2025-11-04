# Google Play Store Setup Guide

This guide will help you prepare and publish your Radha Jap Counter app to Google Play Store.

## Prerequisites

1. **Google Play Console Account**: Create one at https://play.google.com/console (one-time $25 registration fee)
2. **Development Environment**: 
   - Node.js installed
   - Android Studio installed (for Android builds)
   - Git installed

## Step 1: Export and Setup Local Development

1. Export your project to GitHub using the "Export to Github" button in Lovable
2. Clone the repository to your local machine:
   ```bash
   git clone YOUR_GITHUB_URL
   cd bhakti-mala-counter
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Step 2: Configure AdMob

1. **Create AdMob Account**: Visit https://admob.google.com and create an account

2. **Create App in AdMob**:
   - Go to Apps → Add App
   - App name: "Radha Jap Counter"
   - Platform: Android
   - App ID: `com.tusharsharmaaa.radha`

3. **Create Ad Units**:
   Create the following ad units in AdMob:
   - **Banner Ad**: For persistent bottom banner
   - **Interstitial Ad**: For full-screen ads after malas
   - **Rewarded Ad**: For optional ads before sharing
   - **Native Ad** (optional): For content feeds

4. **Update Ad Unit IDs**:
   Open `src/services/admob.ts` and replace the test IDs with your production IDs:
   ```typescript
   export const AD_UNITS = {
     banner: 'ca-app-pub-XXXXX/XXXXX', // Your banner ID
     interstitial: 'ca-app-pub-XXXXX/XXXXX', // Your interstitial ID
     rewarded: 'ca-app-pub-XXXXX/XXXXX', // Your rewarded ID
     native: 'ca-app-pub-XXXXX/XXXXX', // Your native ID (optional)
   };
   ```

## Step 3: Initialize Capacitor

1. Add Android platform:
   ```bash
   npx cap add android
   ```

2. Update Capacitor dependencies:
   ```bash
   npx cap update android
   ```

3. Build the web assets:
   ```bash
   npm run build
   ```

4. Sync the project:
   ```bash
   npx cap sync android
   ```

## Step 4: Configure Android Project

1. Open Android Studio:
   ```bash
   npx cap open android
   ```

2. **Update `AndroidManifest.xml`** (located at `android/app/src/main/AndroidManifest.xml`):
   
   Add AdMob App ID inside `<application>` tag:
   ```xml
   <meta-data
       android:name="com.google.android.gms.ads.APPLICATION_ID"
       android:value="ca-app-pub-XXXXX~XXXXX"/>
   ```

3. **Configure App Details** in `android/app/build.gradle`:
   - Update `versionCode` (increment for each release)
   - Update `versionName` (e.g., "1.0.0")

4. **Generate App Icon**:
   - Use Android Studio's Image Asset Studio
   - Or use: https://icon.kitchen/
   - Required sizes: 48x48, 72x72, 96x96, 144x144, 192x192

5. **Generate Signing Key**:
   ```bash
   keytool -genkey -v -keystore radha-jap-release-key.keystore -alias radha-jap -keyalg RSA -keysize 2048 -validity 10000
   ```
   
   Save the keystore file securely and remember the passwords!

6. **Configure Signing** in `android/app/build.gradle`:
   ```gradle
   signingConfigs {
       release {
           storeFile file('path/to/radha-jap-release-key.keystore')
           storePassword 'YOUR_KEYSTORE_PASSWORD'
           keyAlias 'radha-jap'
           keyPassword 'YOUR_KEY_PASSWORD'
       }
   }
   
   buildTypes {
       release {
           signingConfig signingConfigs.release
           minifyEnabled true
           proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
       }
   }
   ```

## Step 5: Test the App

1. **Test on Device/Emulator**:
   ```bash
   npx cap run android
   ```

2. **Test AdMob Integration**:
   - Open app and go to Settings → Ad Testing
   - Test each ad type (Banner, Interstitial, Rewarded)
   - Verify frequency caps work correctly
   - Check that ads don't interfere with core functionality

3. **Test Core Features**:
   - Counter increment and persistence
   - Mala completion tracking
   - Stats and streaks
   - Timer functionality
   - Settings persistence
   - WhatsApp sharing

## Step 6: Build Release APK/AAB

1. **Build App Bundle (AAB)** - Recommended for Play Store:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   
   Output: `android/app/build/outputs/bundle/release/app-release.aab`

2. **Or Build APK** - For testing:
   ```bash
   ./gradlew assembleRelease
   ```
   
   Output: `android/app/build/outputs/apk/release/app-release.apk`

## Step 7: Prepare Play Store Listing

Create the following assets:

1. **Screenshots** (Required):
   - Phone: At least 2 screenshots (1080x1920 or 1920x1080)
   - 7-inch tablet: At least 2 screenshots (optional but recommended)
   - 10-inch tablet: At least 2 screenshots (optional but recommended)

2. **Feature Graphic** (Required):
   - Size: 1024x500 px
   - Design a banner showcasing the app

3. **App Icon** (Required):
   - Size: 512x512 px
   - High-resolution icon

4. **Short Description** (80 characters max):
   ```
   Daily Radha naam japa counter with meditation timer and devotional content
   ```

5. **Full Description** (4000 characters max):
   ```
   Radha Jap Counter - Your Spiritual Companion
   
   Transform your spiritual practice with Radha Jap Counter, a beautiful and intuitive app designed for devotees practicing Radha naam japa.
   
   ✨ KEY FEATURES:
   
   📿 TAP COUNTER
   • Elegant circular counter with progress visualization
   • Automatic mala completion tracking (108 counts)
   • Tap anywhere on screen to count
   • Offline support - works without internet
   
   🔥 STREAK TRACKING
   • Daily streak monitoring
   • Calendar view of your progress
   • Share your achievements
   
   📊 DETAILED STATISTICS
   • Total count and malas completed
   • Daily progress tracking
   • Lifetime statistics
   • Visual progress indicators
   
   ⏱️ MEDITATION TIMER
   • Customizable duration
   • Peaceful background sounds (Om chanting, temple bells, nature sounds)
   • Completion notifications
   
   📖 SPIRITUAL CONTENT
   • Daily inspirational quotes
   • Bhagavad Gita shlokas with translations
   • Devotional stories
   • WhatsApp sharing with app link
   
   🎨 BEAUTIFUL DESIGN
   • Peaceful gradient backgrounds
   • Smooth animations
   • Dark mode support
   • Responsive layout for all devices
   
   🔊 SOUND FEEDBACK
   • "Radha" audio on each count
   • Temple bell sounds
   • Customizable meditation audio
   
   ⚙️ CUSTOMIZATION
   • Adjustable settings
   • Sound preferences
   • Notification options
   
   🌟 WHY CHOOSE RADHA JAP COUNTER?
   
   Whether you're a seasoned practitioner or just beginning your spiritual journey, Radha Jap Counter provides the perfect companion for your daily sadhana. The app combines traditional devotional practices with modern technology, making it easier than ever to maintain consistency in your japa practice.
   
   Our mission is to support your spiritual growth by providing a distraction-free, beautiful environment for your daily practices. With features like automatic mala tracking, streak monitoring, and peaceful meditation timers, you can focus on what matters most - your connection with the divine.
   
   🙏 PERFECT FOR:
   • Daily naam japa practitioners
   • Meditation enthusiasts
   • Spiritual seekers
   • Devotees of Radha-Krishna
   • Anyone seeking peace and mindfulness
   
   Download Radha Jap Counter today and take your spiritual practice to the next level!
   
   Radhe Radhe! 🙏
   ```

6. **Category**: Lifestyle
7. **Content Rating**: Complete questionnaire (likely Everyone)
8. **Privacy Policy URL**: Add your privacy policy URL (from `/privacy-policy` page of your app)

## Step 8: Submit to Play Store

1. **Create App in Play Console**:
   - Go to https://play.google.com/console
   - Create Application → Select "Radha Jap Counter"

2. **Complete App Content**:
   - App access: All functionality available
   - Ads: Yes, contains ads (AdMob)
   - Content rating: Complete questionnaire
   - Target audience: Select appropriate age groups
   - Privacy policy: Add URL

3. **Upload AAB**:
   - Go to Production → Create new release
   - Upload the AAB file
   - Add release notes

4. **Set Pricing**:
   - Free (with ads)

5. **Select Countries**:
   - Choose countries where you want to distribute

6. **Review and Publish**:
   - Review all information
   - Submit for review

## Step 9: Post-Launch

1. **Monitor Performance**:
   - Check Google Play Console for crash reports
   - Monitor AdMob earnings
   - Track user reviews and ratings

2. **Update Regularly**:
   - Increment version codes for each update
   - Sync changes: `npx cap sync android`
   - Rebuild and upload new AAB

3. **Respond to Reviews**:
   - Engage with users
   - Address issues promptly

## AdMob Best Practices

1. **Ad Frequency**:
   - Current config: Max 6 interstitials per day, 3-minute cooldown
   - Adjust in `src/services/admob.ts` if needed

2. **User Experience**:
   - Ads never interrupt active counting or meditation
   - Banner hidden during meditation timer
   - Interstitials only after mala completions

3. **Testing**:
   - Use test mode during development
   - Switch to production IDs for release

## Troubleshooting

### Build Errors
- Clean build: `cd android && ./gradlew clean`
- Invalidate Android Studio cache: File → Invalidate Caches
- Check Gradle version compatibility

### AdMob Not Working
- Verify App ID in AndroidManifest.xml
- Check ad unit IDs in admob.ts
- Enable test mode and verify test ads work
- Wait 24 hours after AdMob account creation

### App Crashes
- Check logcat in Android Studio
- Review crash reports in Play Console
- Test on multiple device types

## Support Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **AdMob Docs**: https://developers.google.com/admob
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Lovable Community**: https://discord.gg/lovable

## Important Notes

1. **Never commit keystore file to Git** - Keep it secure!
2. **Test thoroughly before release** - Use internal testing track
3. **Comply with Play Store policies** - Review regularly
4. **Update AdMob IDs** - Don't use test IDs in production
5. **Privacy Policy** - Required for apps with ads

Good luck with your app launch! 🚀
