import { StyleSheet, View } from 'react-native';
import { C, themed } from '../theme';
import { Row, Txt } from './ui';

/** Very small markdown: **bold**, bullet lines (-, *, •, 1.), headings (#). */
export function Rich({ text, color }: { text: string; color: string }) {
  const lines = text.replace(/\r/g, '').split('\n').map((l) => l.trimEnd());
  const out: React.ReactNode[] = [];
  lines.forEach((raw, i) => {
    if (!raw.trim()) { out.push(<View key={i} style={{ height: 6 }} />); return; }
    let l = raw.replace(/^#{1,6}\s*/, '');
    const head = l !== raw;
    const bullet = /^\s*([-*•]|\d+[.)])\s+/.exec(l);
    if (bullet) l = l.slice(bullet[0].length);
    const parts = l.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((p, j) =>
      p.startsWith('**') && p.endsWith('**')
        ? <Txt key={j} style={{ color, fontWeight: '800', fontSize: 15 }}>{p.slice(2, -2)}</Txt>
        : p.replace(/\*/g, ''),
    );
    const body = <Txt style={{ color, fontSize: 15, lineHeight: 24, fontWeight: head ? '800' : '400', flex: bullet ? 1 : undefined }}>{parts}</Txt>;
    out.push(bullet
      ? <Row key={i} style={{ alignItems: 'flex-start', gap: 8 }}><View style={st.bul} />{body}</Row>
      : <View key={i}>{body}</View>);
  });
  return <View style={{ gap: 2 }}>{out}</View>;
}

const st = themed(() => StyleSheet.create({
  bul: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green, marginTop: 10 },
}));
