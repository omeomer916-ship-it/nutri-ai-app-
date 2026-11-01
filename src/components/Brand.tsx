import { StyleSheet, View } from 'react-native';
import { Num } from './ui';
import { Logo } from './Logo';
import { C, themed } from '../theme';

/** App wordmark: the Nutri AI mark + "Nutri AI". */
export function Brand({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 1.35 : size === 'sm' ? 0.85 : 1;
  return (
    <View style={[st.row, { direction: 'ltr' }]}>
      <Logo size={36 * s} />
      <Num style={[st.word, { fontSize: 22 * s }]}>
        Nutri<Num style={{ color: C.green, fontSize: 22 * s, fontWeight: '900' }}> AI</Num>
      </Num>
    </View>
  );
}

const st = themed(() => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  word: { color: C.text, fontWeight: '900', letterSpacing: -0.3 },
}));
