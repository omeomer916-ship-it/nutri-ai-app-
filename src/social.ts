import { Linking } from 'react-native';

/** The app's Instagram account (without @). Leave empty to hide the Instagram buttons. */
export const INSTAGRAM = '';

/** Opens the profile; Android and iPhone hand instagram.com links to the Instagram app when it is installed. */
export function openInstagram() {
  if (INSTAGRAM) Linking.openURL(`https://www.instagram.com/${INSTAGRAM}/`).catch(() => {});
}
