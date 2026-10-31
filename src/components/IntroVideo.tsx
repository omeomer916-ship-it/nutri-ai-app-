import { StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const SRC = require('../../assets/intro-video.mp4');

/** Silent looping background video for the first intro slide. */
export function IntroVideo() {
  const player = useVideoPlayer(SRC, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}
