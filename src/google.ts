import { useEffect, useRef } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const ids = {
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};
const configured = !!(ids.androidClientId || ids.iosClientId || ids.webClientId);

type GUser = { name: string; email?: string; photo?: string };

/**
 * Real Google sign-in through expo-auth-session.
 * Works once the client IDs are set in .env (see README).
 */
export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ids.androidClientId || 'unset',
    iosClientId: ids.iosClientId || 'unset',
    webClientId: ids.webClientId || 'unset',
  });
  const waiter = useRef<((u: GUser | null) => void) | null>(null);

  useEffect(() => {
    if (!response || !waiter.current) return;
    const resolve = waiter.current;
    waiter.current = null;
    if (response.type !== 'success') return resolve(null);
    const token = response.authentication?.accessToken;
    if (!token) return resolve(null);
    fetch('https://www.googleapis.com/userinfo/v2/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((u) => resolve({ name: u.name || u.given_name || 'User', email: u.email, photo: u.picture }))
      .catch(() => resolve(null));
  }, [response]);

  return {
    available: configured && !!request,
    signIn: () =>
      new Promise<GUser | null>((res) => {
        waiter.current = res;
        promptAsync().catch(() => {
          waiter.current = null;
          res(null);
        });
      }),
  };
}
