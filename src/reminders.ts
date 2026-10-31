import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

const CH = 'reminders';
const TEXT: Record<string, { meal: [string, string][]; water: string; title: string }> = {
  ar: {
    title: 'Nutri AI',
    meal: [['وقت الفطور', 'صوّر فطورك وخلّي يومك يبلش صح.'], ['وقت الغدا', 'لا تنسى تسجّل غداك.'], ['وقت العشا', 'سجّل عشاك وشوف كيف كان يومك.']],
    water: 'وقت كاسة مي. اشرب وسجّلها.',
  },
  en: {
    title: 'Nutri AI',
    meal: [['Breakfast time', 'Snap your breakfast and start the day right.'], ['Lunch time', "Don't forget to log your lunch."], ['Dinner time', 'Log your dinner and see how your day went.']],
    water: 'Time for a glass of water. Drink and log it.',
  },
};

async function allowed() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CH, { name: 'Reminders', importance: Notifications.AndroidImportance.DEFAULT, lightColor: '#39E68C' });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** Re-creates all daily reminders from the current settings. Returns false if notifications are not allowed. */
export async function applyReminders(r: { meals: boolean; water: boolean }, lang: string): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!r.meals && !r.water) return true;
    if (!(await allowed())) return false;
    const tx = TEXT[lang] ?? TEXT.en;
    const daily = (hour: number, minute: number, title: string, body: string) =>
      Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: CH },
      });
    if (r.meals) {
      const at: [number, number][] = [[8, 30], [13, 30], [19, 30]];
      for (let i = 0; i < 3; i++) await daily(at[i][0], at[i][1], tx.meal[i][0], tx.meal[i][1]);
    }
    if (r.water) for (const h of [10, 12, 15, 17, 20]) await daily(h, 0, tx.title, tx.water);
    return true;
  } catch {
    return false;
  }
}
