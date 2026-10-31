import { useEffect } from 'react';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Btn } from './components/ui';

WebBrowser.maybeCompleteAuthSession();

export const GOOGLE_IDS = {
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
};
/** True only when real client IDs were set at build time (eas.json env). */
export const googleReady = !!GOOGLE_IDS.androidClientId;

type GUser = { name: string; email?: string; photo?: string };

/**
 * Real Google sign-in. This component is only mounted when googleReady is true,
 * so the auth hook never runs without valid IDs (that used to crash on start).
 */
export function GoogleButton({ title, icon, onUser, failMsg }: {
  title: string; icon: React.ReactNode; onUser: (u: GUser) => void; failMsg: string;
}) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_IDS.androidClientId,
    webClientId: GOOGLE_IDS.webClientId || GOOGLE_IDS.androidClientId,
    iosClientId: GOOGLE_IDS.iosClientId || GOOGLE_IDS.androidClientId,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type !== 'success') {
      if (response.type === 'error') Alert.alert('Google', failMsg);
      return;
    }
    const token = response.authentication?.accessToken;
    if (!token) return Alert.alert('Google', failMsg);
    fetch('https://www.googleapis.com/userinfo/v2/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((u) => onUser({ name: u.name || u.given_name || 'User', email: u.email, photo: u.picture }))
      .catch(() => Alert.alert('Google', failMsg));
  }, [response]);

  return <Btn kind="white" title={title} icon={icon} disabled={!request} onPress={() => promptAsync().catch(() => Alert.alert('Google', failMsg))} />;
}
