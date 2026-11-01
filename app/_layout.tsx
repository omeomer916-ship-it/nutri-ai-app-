import { useEffect, useState } from 'react';
import { Pressable, Text, View, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useApp } from '../src/store';
import { C, FONTS, applyTheme, themeVersion } from '../src/theme';
import { Toast } from '../src/components/Toast';

// Show any startup error on screen instead of closing the app.
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', padding: 24, paddingTop: 80 }}>
      <Text style={{ color: '#39E68C', fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Nutri AI</Text>
      <Text style={{ color: '#fff', fontSize: 16, marginBottom: 12 }}>حدث خطأ. صوّر هذه الشاشة وأرسلها.</Text>
      <Text selectable style={{ color: '#ff8080', fontSize: 13 }}>{String(error?.message || error)}</Text>
      <Text selectable style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 10 }}>{String(error?.stack || '').slice(0, 1200)}</Text>
      <Pressable onPress={() => retry()} style={{ marginTop: 24, backgroundColor: '#39E68C', borderRadius: 16, padding: 16, alignItems: 'center' }}>
        <Text style={{ fontWeight: '800' }}>Retry</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const [hydrated, setReady] = useState(useApp.persist.hasHydrated());
  const [fontsOk, fontErr] = useFonts(FONTS);
  const [late, setLate] = useState(false);
  useEffect(() => { const id = setTimeout(() => setLate(true), 4000); return () => clearTimeout(id); }, []);
  const ready = hydrated && (fontsOk || !!fontErr || late);
  // Light / dark: the user's choice, or follow the phone when set to Auto.
  const sys = useColorScheme();
  const pref = useApp((s) => s.theme);
  applyTheme(pref === 'system' ? (sys === 'light' ? 'light' : 'dark') : pref);
  const tv = themeVersion();
  useEffect(() => {
    const unsub = useApp.persist.onFinishHydration(() => setReady(true));
    if (useApp.persist.hasHydrated()) setReady(true);
    return unsub;
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style={C.mode === 'light' ? 'dark' : 'light'} />
      {ready ? (
        <View key={tv} style={{ flex: 1, backgroundColor: C.bg }}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'fade' }}>
            <Stack.Screen name="food" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="barcode" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="fasting" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="pro" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
            <Stack.Screen name="voice" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="share" options={{ animation: 'slide_from_bottom' }} />
            {['report', 'challenges', 'body', 'health', 'recipes', 'ai', 'tool', 'score', 'checkin', 'bodystats', 'supps'].map((n) => <Stack.Screen key={n} name={n} options={{ animation: 'slide_from_right' }} />)}
          </Stack>
          <Toast />
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: C.bg }} />
      )}
    </SafeAreaProvider>
  );
}
