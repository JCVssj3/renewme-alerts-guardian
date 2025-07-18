import { Preferences } from '@capacitor/preferences';
import { Document, AppSettings } from '@/types';

const DOCUMENTS_KEY = 'renewme_documents';
const SETTINGS_KEY = 'renewme_settings';

export class StorageService {
  static async getDocuments(): Promise<Document[]> {
    try {
      const { value } = await Preferences.get({ key: DOCUMENTS_KEY });
      if (!value) return [];

      const documents = JSON.parse(value);
      return documents.map((doc: any) => ({
        ...doc,
        expiryDate: new Date(doc.expiryDate),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  }

  static async saveDocuments(documents: Document[]): Promise<void> {
    try {
      await Preferences.set({
        key: DOCUMENTS_KEY,
        value: JSON.stringify(documents),
      });
    } catch (error) {
      console.error('Error saving documents:', error);
    }
  }

  static async addDocument(document: Document): Promise<void> {
    const documents = await this.getDocuments();
    documents.push(document);
    await this.saveDocuments(documents);
  }

  static async updateDocument(documentId: string, updates: Partial<Document>): Promise<void> {
    const documents = await this.getDocuments();
    const index = documents.findIndex(doc => doc.id === documentId);

    if (index !== -1) {
      documents[index] = {
        ...documents[index],
        ...updates,
        updatedAt: new Date(),
      };
      await this.saveDocuments(documents);
    }
  }

  static async deleteDocument(documentId: string): Promise<void> {
    const documents = await this.getDocuments();
    const filtered = documents.filter(doc => doc.id !== documentId);
    await this.saveDocuments(filtered);
  }

  static async getSettings(): Promise<AppSettings> {
    const defaultSettings: AppSettings = {
      theme: 'system',
      notifications: {
        enabled: true,
        sound: true,
        vibration: true,
        defaultReminderPeriod: '2weeks',
      },
    };

    try {
      const { value } = await Preferences.get({ key: SETTINGS_KEY });
      return value ? { ...defaultSettings, ...JSON.parse(value) } : defaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await Preferences.set({
        key: SETTINGS_KEY,
        value: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
}
