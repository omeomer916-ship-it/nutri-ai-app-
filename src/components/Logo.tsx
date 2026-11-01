import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { C } from '../theme';

/** Nutri AI mark: scanner brackets around a green leaf, with a small AI spark. */
export function Logo({ size = 40, frame }: { size?: number; frame?: string }) {
  const f = frame ?? C.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="nl" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#8CFBC0" />
          <Stop offset="0.5" stopColor="#39E68C" />
          <Stop offset="1" stopColor="#119A55" />
        </LinearGradient>
      </Defs>
      <G fill="none" stroke={f} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M96 170V128a32 32 0 0 1 32-32h42" />
        <Path d="M342 96h42a32 32 0 0 1 32 32v42" />
        <Path d="M416 342v42a32 32 0 0 1-32 32h-42" />
        <Path d="M170 416h-42a32 32 0 0 1-32-32v-42" />
      </G>
      <G transform="translate(-10 22)">
        <Path d="M168 352c-10-96 44-176 184-192 6 120-52 196-150 202-14 1-26-2-34-10z" fill="url(#nl)" />
        <Path d="M186 344c34-50 76-92 136-150" fill="none" stroke="#03140b" strokeWidth={16} strokeLinecap="round" opacity={0.85} />
      </G>
      <Path d="M352 140l7 17 17 7-17 7-7 17-7-17-17-7 17-7z" fill="#39E68C" />
    </Svg>
  );
}
