import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { C } from '../theme';

/** Nutri AI mark: a plate ring with a fresh leaf rising out of it. */
export function Logo({ size = 40, frame }: { size?: number; frame?: string }) {
  const f = frame ?? C.text;
  return (
    <Svg width={size} height={size} viewBox="72 72 368 368">
      <Defs>
        <LinearGradient id="nl" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#0E9A52" />
          <Stop offset="0.55" stopColor="#39E68C" />
          <Stop offset="1" stopColor="#A6FFD0" />
        </LinearGradient>
      </Defs>
      <Path d="M370 196 A150 150 0 1 1 316 142" fill="none" stroke={f} strokeWidth={36} strokeLinecap="round" />
      <Path d="M236 276 Q361 233 404 108 Q279 151 236 276Z" fill="url(#nl)" />
      <Path d="M262 250 L370 142" stroke="#03140b" strokeOpacity={0.6} strokeWidth={10} strokeLinecap="round" />
    </Svg>
  );
}
