import { StyleSheet, View } from 'react-native';
import { Num } from './ui';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf } from './Leaf';
import { C } from '../theme';

/** App wordmark: green leaf badge + "Nutri AI". */
export function Brand({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 1.35 : size === 'sm' ? 0.85 : 1;
  return (
    <View style={[st.row, { direction: 'ltr' }]}>
      <LinearGradient colors={['#6af5ad', C.green, '#169a55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[st.badge, { width: 34 * s, height: 34 * s, borderRadius: 11 * s }]}>
        <Leaf size={20 * s} color="#03140b" />
      </LinearGradient>
      <Num style={[st.word, { fontSize: 22 * s }]}>
        Nutri<Num style={{ color: C.green, fontSize: 22 * s, fontWeight: '900' }}> AI</Num>
      </Num>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  badge: { alignItems: 'center', justifyContent: 'center', shadowColor: C.green, shadowOpacity: 0.6, shadowRadius: 12, elevation: 6 },
  word: { color: '#fff', fontWeight: '900' },
});
