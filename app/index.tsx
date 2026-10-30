import { Redirect } from 'expo-router';
import { useApp } from '../src/store';

export default function Index() {
  const { seenIntro, profile } = useApp();
  if (!seenIntro) return <Redirect href="/intro" />;
  if (!profile) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)/today" />;
}
