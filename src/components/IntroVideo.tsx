import { StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const INTRO = require('../../assets/intro-video.mp4');
const SCAN = require('../../assets/scan-video.mp4');

/** Silent looping background video (intro slide 1 or scanner). */
export function IntroVideo({ which = 'intro' }: { which?: 'intro' | 'scan' }) {
  const player = useVideoPlayer(which === 'scan' ? SCAN : INTRO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}
