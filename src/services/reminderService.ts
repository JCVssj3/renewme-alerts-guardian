import { Preferences } from '@capacitor/preferences';
import { v4 as uuidv4 } from 'uuid';

export interface Reminder {
  id: string;
  documentId: string;
  name: string;
  expiryDate: string;
  notificationId?: number;
}

const REMINDERS_KEY = 'reminders';

export class ReminderService {
  static async getReminders(): Promise<Reminder[]> {
    const { value } = await Preferences.get({ key: REMINDERS_KEY });
    return value ? JSON.parse(value) : [];
  }

  static async saveReminder(reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
    const reminders = await this.getReminders();
    const newReminder: Reminder = { ...reminder, id: uuidv4() };
    reminders.push(newReminder);
    await Preferences.set({ key: REMINDERS_KEY, value: JSON.stringify(reminders) });
    return newReminder;
  }

  static async updateReminder(updatedReminder: Reminder): Promise<void> {
    let reminders = await this.getReminders();
    reminders = reminders.map(r => r.id === updatedReminder.id ? updatedReminder : r);
    await Preferences.set({ key: REMINDERS_KEY, value: JSON.stringify(reminders) });
  }

  static async deleteReminder(id: string): Promise<void> {
    let reminders = await this.getReminders();
    reminders = reminders.filter(r => r.id !== id);
    await Preferences.set({ key: REMINDERS_KEY, value: JSON.stringify(reminders) });
  }
}
