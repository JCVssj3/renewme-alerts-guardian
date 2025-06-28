
import { Document, AppSettings } from '@/types';

const DOCUMENTS_KEY = 'renewme_documents';
const SETTINGS_KEY = 'renewme_settings';

export class StorageService {
  static getDocuments(): Document[] {
    try {
      const stored = localStorage.getItem(DOCUMENTS_KEY);
      if (!stored) return [];
      
      const documents = JSON.parse(stored);
      return documents.map((doc: any) => ({
        ...doc,
        expiryDate: new Date(doc.expiryDate),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  }

  static saveDocuments(documents: Document[]) {
    try {
      localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents));
    } catch (error) {
      console.error('Error saving documents:', error);
    }
  }

  static addDocument(document: Document) {
    const documents = this.getDocuments();
    documents.push(document);
    this.saveDocuments(documents);
  }

  static updateDocument(documentId: string, updates: Partial<Document>) {
    const documents = this.getDocuments();
    const index = documents.findIndex(doc => doc.id === documentId);
    
    if (index !== -1) {
      documents[index] = { 
        ...documents[index], 
        ...updates, 
        updatedAt: new Date() 
      };
      this.saveDocuments(documents);
    }
  }

  static deleteDocument(documentId: string) {
    const documents = this.getDocuments();
    const filtered = documents.filter(doc => doc.id !== documentId);
    this.saveDocuments(filtered);
  }

  static getSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (!stored) {
        return {
          theme: 'system',
          notifications: {
            enabled: true,
            sound: true,
            vibration: true,
            defaultReminderPeriod: '2_weeks'
          }
        };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        theme: 'system',
        notifications: {
          enabled: true,
          sound: true,
          vibration: true,
          defaultReminderPeriod: '2_weeks'
        }
      };
    }
  }

  static saveSettings(settings: AppSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
}
