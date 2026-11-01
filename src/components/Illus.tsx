import { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { C } from '../theme';

export type IllusKind = 'plate' | 'scale' | 'photos' | 'trophy' | 'report' | 'voice' | 'book';

/** Flat 2D illustrations in the brand greens. They float gently so empty screens feel alive. */
export function Illus({ kind, size = 180 }: { kind: IllusKind; size?: number }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, []);
  const light = C.mode === 'light';
  // Flat palette: one deep, one mid, one bright green, plus neutral surfaces.
  const P = {
    blob: light ? '#DDF5E7' : '#0F2A1B', deep: '#0E8F4C', mid: '#39E68C', soft: light ? '#A8EBC6' : '#1E6B44',
    pale: light ? '#FFFFFF' : '#1B2620', line: light ? '#0A0F0C' : '#E8FFF2', shadow: light ? 'rgba(10,40,25,0.10)' : 'rgba(0,0,0,0.45)', gold: '#FFD45C',
  };
  const art = ART[kind](P);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: 'absolute' }}>
        <Path d="M100 18c40 0 78 22 80 70 2 50-34 92-82 92S18 150 20 98C22 50 58 18 100 18z" fill={P.blob} />
        <Ellipse cx={100} cy={176} rx={54} ry={7} fill={P.shadow} />
        <G>{art.back}</G>
      </Svg>
      <Animated.View style={{ position: 'absolute', transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }}>
        <Svg width={size} height={size} viewBox="0 0 200 200">{art.front}</Svg>
      </Animated.View>
    </View>
  );
}

type Pal = { blob: string; deep: string; mid: string; soft: string; pale: string; line: string; shadow: string; gold: string };
const leaf = (x: number, y: number, s: number, r: number, f: string, v: string) => (
  <G transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <Path d="M0 0C0-18 10-30 28-32 28-14 18-2 0 0z" fill={f} />
    <Path d="M3-3L22-26" stroke={v} strokeWidth={2} strokeLinecap="round" />
  </G>
);
const spark = (x: number, y: number, s: number, f: string) => (
  <Path transform={`translate(${x} ${y}) scale(${s})`} d="M0-8L2-2 8 0 2 2 0 8-2 2-8 0-2-2z" fill={f} />
);

const ART: Record<IllusKind, (p: Pal) => { back: React.ReactNode; front: React.ReactNode }> = {
  plate: (p) => ({
    back: <>
      <Rect x={34} y={70} width={8} height={70} rx={4} fill={p.soft} />
      <Path d="M30 70v18a8 8 0 0 0 16 0V70" stroke={p.soft} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M158 70c10 0 12 20 12 30s-6 12-10 12v28" stroke={p.soft} strokeWidth={8} fill="none" strokeLinecap="round" />
    </>,
    front: <>
      <Ellipse cx={100} cy={112} rx={52} ry={50} fill={p.pale} />
      <Ellipse cx={100} cy={112} rx={38} ry={36} fill="none" stroke={p.soft} strokeWidth={3} />
      {leaf(78, 128, 1.05, -10, p.mid, p.deep)}
      {leaf(104, 120, 0.8, 20, p.deep, p.mid)}
      <Circle cx={116} cy={102} r={9} fill={p.gold} />
      <Circle cx={92} cy={96} r={6} fill={p.mid} />
      {spark(150, 52, 1.1, p.mid)}{spark(56, 46, 0.7, p.deep)}
    </>,
  }),
  scale: (p) => ({
    back: <>{spark(156, 50, 1, p.mid)}{spark(46, 60, 0.7, p.deep)}</>,
    front: <>
      <Rect x={48} y={74} width={104} height={88} rx={26} fill={p.pale} />
      <Rect x={60} y={86} width={80} height={36} rx={14} fill={p.deep} />
      <Path d="M76 112a24 24 0 0 1 48 0" stroke={p.mid} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M100 112l10-14" stroke={p.pale} strokeWidth={4} strokeLinecap="round" />
      <Circle cx={100} cy={112} r={4} fill={p.pale} />
      <Rect x={66} y={136} width={28} height={12} rx={6} fill={p.soft} />
      <Rect x={106} y={136} width={28} height={12} rx={6} fill={p.soft} />
      {leaf(140, 74, 0.9, 10, p.mid, p.deep)}
    </>,
  }),
  photos: (p) => ({
    back: <G transform="rotate(-10 100 110)"><Rect x={42} y={58} width={70} height={92} rx={14} fill={p.soft} /></G>,
    front: <>
      <G transform="rotate(8 120 110)">
        <Rect x={86} y={56} width={74} height={98} rx={14} fill={p.pale} />
        <Rect x={94} y={64} width={58} height={62} rx={9} fill={p.deep} />
        <Circle cx={123} cy={86} r={10} fill={p.mid} />
        <Path d="M104 126c4-16 14-22 19-22s15 6 19 22z" fill={p.mid} />
        <Rect x={98} y={134} width={34} height={6} rx={3} fill={p.soft} />
      </G>
      <Path d="M62 108h22m-7-7 7 7-7 7" stroke={p.line} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {spark(160, 48, 1, p.gold)}
    </>,
  }),
  trophy: (p) => ({
    back: <>{spark(48, 56, 1, p.gold)}{spark(156, 64, 0.8, p.mid)}{spark(146, 140, 0.6, p.deep)}</>,
    front: <>
      <Path d="M70 62h60v24c0 22-14 38-30 38S70 108 70 86z" fill={p.gold} />
      <Path d="M70 70H54c0 18 8 26 18 26M130 70h16c0 18-8 26-18 26" stroke={p.gold} strokeWidth={7} fill="none" strokeLinecap="round" />
      <Path d="M86 70v16c0 8 6 14 14 14" stroke="#fff" strokeOpacity={0.55} strokeWidth={5} fill="none" strokeLinecap="round" />
      <Rect x={92} y={122} width={16} height={18} fill={p.deep} />
      <Rect x={72} y={140} width={56} height={18} rx={7} fill={p.deep} />
      <Rect x={84} y={146} width={32} height={6} rx={3} fill={p.mid} />
    </>,
  }),
  report: (p) => ({
    back: <>{spark(52, 52, 0.9, p.mid)}</>,
    front: <>
      <Rect x={46} y={56} width={108} height={110} rx={18} fill={p.pale} />
      <Rect x={62} y={124} width={14} height={26} rx={5} fill={p.soft} />
      <Rect x={84} y={106} width={14} height={44} rx={5} fill={p.mid} />
      <Rect x={106} y={114} width={14} height={36} rx={5} fill={p.soft} />
      <Rect x={128} y={90} width={14} height={60} rx={5} fill={p.deep} />
      <Path d="M62 98l24-16 22 8 32-22" stroke={p.deep} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={140} cy={68} r={6} fill={p.mid} />
      <Rect x={62} y={66} width={40} height={6} rx={3} fill={p.soft} />
      {spark(160, 150, 1, p.gold)}
    </>,
  }),
  voice: (p) => ({
    back: <>
      <Path d="M44 100c0-10 6-18 6-18M156 100c0-10-6-18-6-18M36 116c-6-16 0-34 6-42M164 116c6-16 0-34-6-42" stroke={p.soft} strokeWidth={5} fill="none" strokeLinecap="round" />
    </>,
    front: <>
      <Rect x={78} y={44} width={44} height={78} rx={22} fill={p.deep} />
      <Rect x={86} y={56} width={8} height={40} rx={4} fill={p.mid} opacity={0.6} />
      <Path d="M64 102c0 20 16 36 36 36s36-16 36-36" stroke={p.line} strokeWidth={6} fill="none" strokeLinecap="round" />
      <Path d="M100 138v18M84 158h32" stroke={p.line} strokeWidth={6} strokeLinecap="round" />
      {leaf(126, 70, 0.8, 15, p.mid, p.deep)}
      {spark(58, 52, 1, p.gold)}
    </>,
  }),
  book: (p) => ({
    back: <>{spark(156, 50, 1, p.gold)}</>,
    front: <>
      <Path d="M100 70c-14-10-34-12-52-8v86c18-4 38-2 52 8z" fill={p.pale} />
      <Path d="M100 70c14-10 34-12 52-8v86c-18-4-38-2-52 8z" fill={p.soft} />
      <Path d="M100 70v86" stroke={p.deep} strokeWidth={3} />
      <Path d="M60 84h28M60 96h28M60 108h20" stroke={p.soft} strokeWidth={4} strokeLinecap="round" />
      {leaf(116, 124, 1, -20, p.mid, p.deep)}
      <Circle cx={134} cy={92} r={8} fill={p.gold} />
    </>,
  }),
};
