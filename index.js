// App entry. Installs an error catcher first, so any startup error is shown
// on screen (instead of the app silently closing), then starts Expo Router.
const { Alert } = require('react-native');

const EU = global.ErrorUtils;
if (EU && EU.setGlobalHandler) {
  const prev = EU.getGlobalHandler && EU.getGlobalHandler();
  EU.setGlobalHandler((e, isFatal) => {
    try {
      const msg = String((e && (e.message || e)) || 'unknown');
      const stack = String((e && e.stack) || '').slice(0, 900);
      Alert.alert(isFatal ? 'Nutri AI – startup error' : 'Nutri AI – error', `${msg}\n\n${stack}`);
    } catch (_) {}
    if (!isFatal && prev) prev(e, isFatal);
  });
}

require('expo-router/entry');
