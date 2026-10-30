import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C } from '../theme';

/** Calorie ring; optional macro segments (kcal from P, C, F). */
export function Ring({ size, value, max, stroke = 14, segments, children }: {
  size: number; value: number; max: number; stroke?: number;
  segments?: number[]; children?: React.ReactNode;
}) {
  const r = size / 2 - stroke / 2 - 2;
  const L = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, max ? value / max : 0));
  const cols = [C.green, C.green2, '#ffffff'];
  const tot = segments?.reduce((a, b) => a + b, 0) || 0;
  let off = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        {segments && tot > 0
          ? segments.map((v, i) => {
              const len = (v / tot) * p * L;
              const el = (
                <Circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={cols[i]} strokeWidth={stroke} fill="none"
                  strokeDasharray={`${Math.max(0, len - 3)} ${L}`} strokeDashoffset={-off} strokeLinecap="round" />
              );
              off += len;
              return el;
            })
          : p > 0 && (
              <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.green} strokeWidth={stroke} fill="none"
                strokeDasharray={`${p * L} ${L}`} strokeLinecap="round" />
            )}
      </Svg>
      {children}
    </View>
  );
}
