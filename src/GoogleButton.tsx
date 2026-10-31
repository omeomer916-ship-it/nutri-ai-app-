import { Alert, Platform } from 'react-native';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { Btn } from './components/ui';

/**
 * Native Google Sign-In (Android).
 * Google matches the app by its package name (com.nutriai.app) and the SHA-1 of
 * the signing key, registered as an Android OAuth client in the Google Cloud
 * project "Nutri AI". No client ID is needed in the code for basic profile info.
 */
let configured = false;
function setup() {
  if (configured) return;
  try {
    GoogleSignin.configure({ scopes: ['profile', 'email'] });
    configured = true;
  } catch {}
}

export const googleReady = Platform.OS === 'android';

type GUser = { name: string; email?: string; photo?: string };

export function GoogleButton({ title, icon, onUser, failMsg }: {
  title: string; icon: React.ReactNode; onUser: (u: GUser) => void; failMsg: string;
}) {
  const go = async () => {
    try {
      setup();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const res = await GoogleSignin.signIn();
      if (res.type !== 'success') return; // user closed the Google window
      const u = res.data.user;
      onUser({ name: u.name || u.givenName || u.email, email: u.email, photo: u.photo ?? undefined });
    } catch (e) {
      const code = isErrorWithCode(e) ? String(e.code) : '';
      if (code === statusCodes.IN_PROGRESS) return;
      Alert.alert('Google', `${failMsg}${code ? ` (${code})` : ''}`);
    }
  };
  return <Btn kind="white" title={title} icon={icon} onPress={go} />;
}

export async function googleSignOut() {
  try { setup(); await GoogleSignin.signOut(); } catch {}
}
