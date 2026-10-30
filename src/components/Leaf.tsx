import Svg, { Path } from 'react-native-svg';
import { C } from '../theme';

export function Leaf({ size = 18, color = C.green }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 19c0-8 5-14 15-14 0 9-5 15-13 15M5 19c3-5 6-8 10-10" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

