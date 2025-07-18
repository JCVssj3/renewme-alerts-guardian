import { Storage } from '@capacitor/storage';
import { Document, AppSettings, Entity, CustomDocumentType } from '@/types';

const DOCUMENTS_KEY = 'renewme_documents';
const SETTINGS_KEY = 'renewme_settings';
const ENTITIES_KEY = 'renewme_entities';
const CUSTOM_DOCUMENT_TYPES_KEY = 'renewme_custom_document_types';

export class StorageService {
  // Documents
  static async getDocuments(): Promise<Document[]> {
    try {
      const { value } = await Storage.get({ key: DOCUMENTS_KEY });
      if (!value) return [];
      
      const documents = JSON.parse(value);
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

  static async saveDocuments(documents: Document[]) {
    try {
      await Storage.set({
        key: DOCUMENTS_KEY,
        value: JSON.stringify(documents),
      });
    } catch (error) {
      console.error('Error saving documents:', error);
    }
  }

  static async addDocument(document: Document) {
    const documents = await this.getDocuments();
    documents.push(document);
    await this.saveDocuments(documents);
  }

  static async updateDocument(documentId: string, updates: Partial<Document>) {
    const documents = await this.getDocuments();
    const index = documents.findIndex(doc => doc.id === documentId);
    
    if (index !== -1) {
      documents[index] = { 
        ...documents[index], 
        ...updates, 
        updatedAt: new Date() 
      };
      await this.saveDocuments(documents);
    }
  }

  static async deleteDocument(documentId: string) {
    const documents = await this.getDocuments();
    const filtered = documents.filter(doc => doc.id !== documentId);
    await this.saveDocuments(filtered);
  }

  // Settings
  static async getSettings(): Promise<AppSettings> {
    try {
      const { value } = await Storage.get({ key: SETTINGS_KEY });
      if (!value) {
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
      return JSON.parse(value);
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

  static async saveSettings(settings: AppSettings) {
    try {
      await Storage.set({
        key: SETTINGS_KEY,
        value: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

    // Entities
    static async getEntities(): Promise<Entity[]> {
        try {
            const { value } = await Storage.get({ key: ENTITIES_KEY });
            if (!value) {
                // If no entities exist, create default 'self' entity
                const defaultEntity: Entity = {
                    id: 'self',
                    name: 'Myself',
                    tag: 'Personal',
                    icon: '👤',
                    color: '#3B82F6',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await this.addEntity(defaultEntity);
                return [defaultEntity];
            }
            const entities = JSON.parse(value);
            return entities.map((entity: any) => ({
                ...entity,
                createdAt: new Date(entity.createdAt),
                updatedAt: new Date(entity.updatedAt)
            }));
        } catch (error) {
            console.error('Error loading entities:', error);
            return [];
        }
    }

    static async saveEntities(entities: Entity[]) {
        try {
            await Storage.set({
                key: ENTITIES_KEY,
                value: JSON.stringify(entities),
            });
        } catch (error) {
            console.error('Error saving entities:', error);
        }
    }

    static async addEntity(entity: Entity) {
        const entities = await this.getEntities();
        entities.push(entity);
        await this.saveEntities(entities);
    }

    static async updateEntity(entityId: string, updates: Partial<Entity>) {
        let entities = await this.getEntities();
        entities = entities.map(entity =>
            entity.id === entityId ? { ...entity, ...updates, updatedAt: new Date() } : entity
        );
        await this.saveEntities(entities);
    }

    static async deleteEntity(entityId: string) {
        if (entityId === 'self') return; // Prevent deleting default entity
        let entities = await this.getEntities();
        entities = entities.filter(entity => entity.id !== entityId);
        await this.saveEntities(entities);
    }

    // Custom Document Types
    static async getCustomDocumentTypes(): Promise<CustomDocumentType[]> {
        try {
            const { value } = await Storage.get({ key: CUSTOM_DOCUMENT_TYPES_KEY });
            if (!value) return [];
            const types = JSON.parse(value);
            return types.map((type: any) => ({
                ...type,
                createdAt: new Date(type.createdAt)
            }));
        } catch (error) {
            console.error('Error loading custom document types:', error);
            return [];
        }
    }

    static async saveCustomDocumentTypes(types: CustomDocumentType[]) {
        try {
            await Storage.set({
                key: CUSTOM_DOCUMENT_TYPES_KEY,
                value: JSON.stringify(types),
            });
        } catch (error) {
            console.error('Error saving custom document types:', error);
        }
    }

    static async addCustomDocumentType(type: CustomDocumentType) {
        const types = await this.getCustomDocumentTypes();
        types.push(type);
        await this.saveCustomDocumentTypes(types);
    }

    static async deleteCustomDocumentType(typeId: string) {
        let types = await this.getCustomDocumentTypes();
        types = types.filter(type => type.id !== typeId);
        await this.saveCustomDocumentTypes(types);
    }
}
