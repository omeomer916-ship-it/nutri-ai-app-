import { StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const SCAN = require('../../assets/scan-video.mp4');

/** Silent looping background video for the scanner. */
export function IntroVideo(_: { which?: 'scan' }) {
  const player = useVideoPlayer(SCAN, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}
