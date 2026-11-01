import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C, fa } from '../theme';

/** Progress ring; optional coloured segments (e.g. kcal from protein, carbs, fat). */
export function Ring({ size, value, max, stroke = 14, color = C.green, segments, segColors, track, children }: {
  size: number; value: number; max: number; stroke?: number; color?: string;
  segments?: number[]; segColors?: string[]; track?: string; children?: React.ReactNode;
}) {
  track = track ?? fa(0.07);
  const r = size / 2 - stroke / 2 - 1;
  const L = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, max ? value / max : 0));
  const cols = segColors ?? [C.pro, C.carb, C.fat];
  const tot = segments?.reduce((a, b) => a + b, 0) || 0;
  let off = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {segments && tot > 0
          ? segments.map((v, i) => {
              const len = (v / tot) * p * L;
              const el = (
                <Circle key={i} cx={size / 2} cy={size / 2} r={r} stroke={cols[i]} strokeWidth={stroke} fill="none"
                  strokeDasharray={`${Math.max(0, len - stroke * 0.6)} ${L}`} strokeDashoffset={-off} strokeLinecap="round" />
              );
              off += len;
              return el;
            })
          : p > 0 && (
              <Circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
                strokeDasharray={`${p * L} ${L}`} strokeLinecap="round" />
            )}
      </Svg>
      {children}
    </View>
  );
}
