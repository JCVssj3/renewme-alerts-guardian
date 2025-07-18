// src/services/reminderStorage.ts
import { Preferences } from '@capacitor/preferences';
import { Reminder } from '@/types';

const REMINDERS_KEY = 'document_reminders';

export const reminderStorage = {
  async getReminders(): Promise<Reminder[]> {
    const { value } = await Preferences.get({ key: REMINDERS_KEY });
    return value ? JSON.parse(value) : [];
  },

  async saveReminders(reminders: Reminder[]): Promise<void> {
    await Preferences.set({
      key: REMINDERS_KEY,
      value: JSON.stringify(reminders),
    });
  },

  async addReminder(newReminder: Reminder): Promise<void> {
    const reminders = await this.getReminders();
    const existingIndex = reminders.findIndex(r => r.id === newReminder.id);
    if (existingIndex > -1) {
      reminders[existingIndex] = newReminder;
    } else {
      reminders.push(newReminder);
    }
    await this.saveReminders(reminders);
  },

  async removeReminder(docId: string): Promise<void> {
    let reminders = await this.getReminders();
    reminders = reminders.filter(r => r.id !== docId);
    await this.saveReminders(reminders);
  },

  async updateReminder(updatedReminder: Reminder): Promise<void> {
    let reminders = await this.getReminders();
    const index = reminders.findIndex(r => r.id === updatedReminder.id);
    if (index > -1) {
      reminders[index] = updatedReminder;
      await this.saveReminders(reminders);
    }
  },
};
