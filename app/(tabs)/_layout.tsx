import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useT } from '../../src/i18n';
import { C } from '../../src/theme';

const icons: Record<string, string[]> = {
  today: ['M4 11l8-7 8 7v9H4z'],
  scan: ['M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4', 'M8 12h8'],
  coach: ['M4 5h16v11H9l-5 4z'],
  progress: ['M5 20V10M12 20V4M19 20v-7'],
};

function Icon({ name, color }: { name: string; color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {name === 'profile' ? (
        <>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </>
      ) : (
        icons[name].map((d, i) => <Path key={i} d={d} />)
      )}
    </Svg>
  );
}

export default function TabsLayout() {
  const { t, rtl } = useT();
  const tabs = [
    ['today', t('tToday')], ['scan', t('tScan')], ['coach', t('tCoach')], ['progress', t('tProgress')], ['profile', t('tProfile')],
  ] as const;
  const ordered = rtl ? [...tabs].reverse() : tabs;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.green,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          position: 'absolute', backgroundColor: 'rgba(8,16,11,0.97)', borderTopColor: C.line, borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 70, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 26 : 10,
        },
        sceneStyle: { backgroundColor: C.bg },
      }}
    >
      {ordered.map(([name, title]) => (
        <Tabs.Screen key={name} name={name} options={{ title, tabBarIcon: ({ color }) => <Icon name={name} color={color} /> }} />
      ))}
    </Tabs>
  );
}
