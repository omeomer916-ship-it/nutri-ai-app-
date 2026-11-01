import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const ID = 'streak';
const TXT: Record<string, [string, string]> = {
  en: ['Keep your streak going', 'Log one meal today to keep your {n}-day streak.'],
  ar: ['حافظ على سلسلتك', 'سجّل وجبة وحدة اليوم لتحافظ على {n} يوم ورا بعض.'],
  fr: ['Gardez votre série', 'Notez un repas aujourd\'hui pour garder vos {n} jours.'],
  es: ['Mantén tu racha', 'Registra una comida hoy para mantener tus {n} días.'],
  de: ['Halte deine Serie', 'Erfasse heute eine Mahlzeit für deine {n}-Tage-Serie.'],
  tr: ['Serini koru', '{n} günlük serini korumak için bugün bir öğün kaydet.'],
  ru: ['Не прерывайте серию', 'Запишите хотя бы один приём пищи, чтобы сохранить серию {n} дн.'],
  id: ['Jaga streak-mu', 'Catat satu makanan hari ini untuk menjaga {n} hari berturut-turut.'],
  ur: ['اپنا سلسلہ جاری رکھیں', '{n} دن کا سلسلہ قائم رکھنے کے لیے آج ایک کھانا درج کریں۔'],
};

/**
 * One gentle reminder at 8 pm tomorrow, only when the user already has a streak.
 * Logging a meal moves it a day forward, so it only fires on a day with nothing logged.
 * Never asks for permission by itself.
 */
export async function scheduleStreakReminder(streak: number, lang: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(ID).catch(() => {});
    if (streak < 2) return;
    const p = await Notifications.getPermissionsAsync();
    if (!p.granted) return;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', { name: 'Reminders', importance: Notifications.AndroidImportance.DEFAULT, lightColor: '#39E68C' });
    }
    const at = new Date();
    at.setDate(at.getDate() + 1);
    at.setHours(20, 0, 0, 0);
    const [title, body] = TXT[lang] ?? TXT.en;
    await Notifications.scheduleNotificationAsync({
      identifier: ID,
      content: { title, body: body.replace('{n}', String(streak + 1)) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: 'reminders' },
    });
  } catch { /* notifications unavailable */ }
}
