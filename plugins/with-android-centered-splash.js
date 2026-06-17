const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const CENTERED_SPLASH_DRAWABLE = `<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@color/splashscreen_background"/>
  <item>
    <bitmap android:gravity="center" android:src="@drawable/splashscreen_logo"/>
  </item>
</layer-list>
`;

function withAndroidCenteredSplash(config) {
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const resRoot = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
      );
      const drawableRoot = path.join(resRoot, 'drawable');
      const stylesV31Path = path.join(resRoot, 'values-v31', 'styles.xml');

      fs.mkdirSync(drawableRoot, { recursive: true });
      fs.writeFileSync(
        path.join(drawableRoot, 'splashscreen.xml'),
        CENTERED_SPLASH_DRAWABLE,
      );

      if (fs.existsSync(stylesV31Path)) {
        const styles = fs.readFileSync(stylesV31Path, 'utf8');
        fs.writeFileSync(
          stylesV31Path,
          styles.replace(
            /<item name="android:windowBackground">@drawable\/splashscreen_logo<\/item>/,
            '<item name="android:windowBackground">@drawable/splashscreen</item>',
          ),
        );
      }

      return modConfig;
    },
  ]);
}

module.exports = withAndroidCenteredSplash;
