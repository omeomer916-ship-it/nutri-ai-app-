import { C } from '../theme';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'flame' | 'wheat' | 'drumstick' | 'avocado' | 'drop' | 'camera' | 'image' | 'plus' | 'minus' | 'chevron'
  | 'send' | 'sparkle' | 'home' | 'chart' | 'user' | 'chat' | 'globe' | 'refresh' | 'logout' | 'trash'
  | 'target' | 'scale' | 'check' | 'x' | 'bolt' | 'sun' | 'moon' | 'bowl' | 'cookie' | 'cake' | 'cup' | 'scan' | 'info' | 'search' | 'crown' | 'share' | 'star' | 'edit' | 'copy' | 'lock' | 'trophy' | 'barcode' | 'bell' | 'run' | 'meat' | 'bread'
  | 'mic' | 'heart' | 'shield' | 'book' | 'compare' | 'calendar' | 'alert' | 'clock' | 'medal';

const P: Record<IconName, (c: string) => React.ReactNode> = {
  mic: () => (<><Rect x={9} y={2} width={6} height={12} rx={3} /><Path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" /></>),
  heart: () => <Path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z" />,
  shield: () => (<><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><Path d="M9 12l2 2 4-4" /></>),
  book: () => (<><Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" /><Path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></>),
  compare: () => (<><Rect x={3} y={4} width={7} height={16} rx={2} /><Rect x={14} y={4} width={7} height={16} rx={2} /><Path d="M12 2v20" /></>),
  calendar: () => (<><Rect x={3} y={4} width={18} height={18} rx={3} /><Path d="M16 2v4M8 2v4M3 10h18" /></>),
  alert: () => (<><Path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><Path d="M12 9v4M12 17h.01" /></>),
  clock: () => (<><Circle cx={12} cy={12} r={9} /><Path d="M12 7v5l3 2" /></>),
  medal: () => (<><Circle cx={12} cy={15} r={6} /><Path d="M8.5 10.5L5 2h4l3 6M15.5 10.5L19 2h-4l-2.2 4.5" /><Path d="M12 12.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3z" /></>),
  flame: () => <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z" />,
  wheat: () => (
    <>
      <Path d="M12 22V8" />
      <Path d="M12 14c-2.2 0-4-1.6-4-4 2.2 0 4 1.6 4 4zM12 14c2.2 0 4-1.6 4-4-2.2 0-4 1.6-4 4z" />
      <Path d="M12 9c-2.2 0-4-1.6-4-4 2.2 0 4 1.6 4 4zM12 9c2.2 0 4-1.6 4-4-2.2 0-4 1.6-4 4z" />
    </>
  ),
  drumstick: () => (
    <>
      <Path d="M15.4 15.63a7.88 6 135 1 1 6.23-6.23 4.3 3.43 135 0 0-6.23 6.23" />
      <Path d="m8.29 12.71-2.6 2.6a2.5 2.5 0 1 0-1.65 4.65A2.5 2.5 0 1 0 8.7 18.3l2.59-2.59" />
    </>
  ),
  avocado: () => (
    <>
      <Path d="M12 2.5c-3.6 0-6.5 5.2-6.5 10.5a6.5 6.5 0 0 0 13 0c0-5.3-2.9-10.5-6.5-10.5z" />
      <Circle cx={12} cy={14.5} r={2.6} />
    </>
  ),
  drop: () => <Path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />,
  camera: () => (
    <>
      <Path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
      <Circle cx={12} cy={13} r={3.5} />
    </>
  ),
  image: () => (
    <>
      <Rect x={3} y={3} width={18} height={18} rx={3} />
      <Circle cx={9} cy={9} r={2} />
      <Path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
    </>
  ),
  plus: () => <Path d="M12 5v14M5 12h14" />,
  minus: () => <Path d="M5 12h14" />,
  chevron: () => <Path d="m9 18 6-6-6-6" />,
  send: () => <Path d="M5 12h14M13 6l6 6-6 6" />,
  sparkle: () => <Path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />,
  home: () => <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  chart: () => <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  user: () => (
    <>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>
  ),
  chat: () => <Path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z" />,
  globe: () => (
    <>
      <Circle cx={12} cy={12} r={9.5} />
      <Path d="M2.5 12h19M12 2.5c2.6 2.8 3.9 6 3.9 9.5s-1.3 6.7-3.9 9.5c-2.6-2.8-3.9-6-3.9-9.5s1.3-6.7 3.9-9.5z" />
    </>
  ),
  refresh: () => <Path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5" />,
  logout: () => <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />,
  trash: () => <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />,
  target: () => (
    <>
      <Circle cx={12} cy={12} r={9.5} />
      <Circle cx={12} cy={12} r={5.5} />
      <Circle cx={12} cy={12} r={1.5} />
    </>
  ),
  scale: () => (
    <>
      <Rect x={3} y={3} width={18} height={18} rx={5} />
      <Path d="M8 9a5 5 0 0 1 8 0M12 9.5l1.5-2" />
    </>
  ),
  check: () => <Path d="M20 6 9 17l-5-5" />,
  x: () => <Path d="M18 6 6 18M6 6l12 12" />,
  bolt: () => <Path d="M13 2 3 14h9l-1 8 10-12h-9z" />,
  sun: () => (
    <>
      <Circle cx={12} cy={12} r={4} />
      <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: () => <Path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />,
  bowl: () => <Path d="M3 11h18a9 9 0 0 1-18 0zM7 21h10M12 11c0-3 1.5-5 4-6M9 11c0-2-.5-3.5-2-4.5" />,
  cookie: () => (
    <>
      <Path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5 3 3 0 0 1-3.5-3.5 3 3 0 0 1-3-3 3 3 0 0 1-3-3z" />
      <Path d="M8.5 9.5h.01M14 15h.01M9 15.5h.01M11.5 12h.01" />
    </>
  ),
  cake: () => <Path d="M7 10a5 5 0 0 1 10 0zM7 10l5 11 5-11" />,
  cup: () => <Path d="M5.5 8h13l-1.6 12.2a1 1 0 0 1-1 .8H8.1a1 1 0 0 1-1-.8zM9 8l1.2-5H14" />,
  scan: () => <Path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10" />,
  crown: () => <Path d="M3 18h18M4 8l4.5 4L12 5l3.5 7L20 8l-1.6 10H5.6z" />,
  share: () => <Path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />,
  star: () => <Path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />,
  edit: () => <Path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  copy: () => <Path d="M9 9h11v11H9zM5 15H4V4h11v1" />,
  lock: () => (
    <>
      <Rect x={5} y={11} width={14} height={10} rx={2} />
      <Path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  trophy: () => <Path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />,
  meat: () => (
    <>
      <Path d="M14.5 3.5c3.6 0 6.3 2.9 5.9 6.6-.4 3.8-3.9 5.4-6.8 6.9-2.4 1.2-3.6 3.5-6.3 3.5A3.8 3.8 0 0 1 3.5 16.7c0-3.1 2.9-4.5 4.6-7.1C9.9 6.7 11.2 3.5 14.5 3.5z" />
      <Circle cx={14.8} cy={9.6} r={2} />
    </>
  ),
  bread: () => <Path d="M6.5 21V11.3A4.2 4.2 0 0 1 4 7.5C4 5 6.5 3 12 3s8 2 8 4.5a4.2 4.2 0 0 1-2.5 3.8V21zM10 13v4M14 13v4" />,
  barcode: () => <Path d="M3 7V4h3M18 4h3v3M21 17v3h-3M6 20H3v-3M7 8v8M10 8v8M13 8v8M17 8v8" />,
  bell: () => <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0" />,
  run: () => (
    <>
      <Circle cx={14} cy={4} r={2} />
      <Path d="M4 21l4-6 3 2 2-5M17 12l-3-3-4 1-2 4M13 12l3 4v5" />
    </>
  ),
  search: () => (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Path d="m20 20-3.8-3.8" />
    </>
  ),
  info: () => (
    <>
      <Circle cx={12} cy={12} r={9.5} />
      <Path d="M12 16v-4.5M12 8h.01" />
    </>
  ),
};

export function Icon({ name, size = 22, color, stroke = 2, fill }: {
  name: IconName; size?: number; color?: string; stroke?: number; fill?: string;
}) {
  color = color ?? C.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill ?? 'none'} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {P[name](color)}
    </Svg>
  );
}
