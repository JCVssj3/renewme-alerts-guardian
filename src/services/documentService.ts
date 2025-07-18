import { Storage } from '@capacitor/storage';
import { Document } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const DOCUMENTS_KEY = 'documents';

export const DocumentService = {
  async getDocuments(): Promise<Document[]> {
    const { value } = await Storage.get({ key: DOCUMENTS_KEY });
    if (value) {
      const documents = JSON.parse(value) as Document[];
      // Convert date strings back to Date objects
      return documents.map(doc => ({
        ...doc,
        expiryDate: new Date(doc.expiryDate),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
    }
    return [];
  },

  async getDocument(id: string): Promise<Document | undefined> {
    const documents = await this.getDocuments();
    return documents.find(doc => doc.id === id);
  },

  async addDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const documents = await this.getDocuments();
    const newDocument: Document = {
      ...document,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    documents.push(newDocument);
    await Storage.set({ key: DOCUMENTS_KEY, value: JSON.stringify(documents) });
    return newDocument;
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document | undefined> {
    let documents = await this.getDocuments();
    const index = documents.findIndex(doc => doc.id === id);
    if (index > -1) {
      documents[index] = { ...documents[index], ...updates, updatedAt: new Date() };
      await Storage.set({ key: DOCUMENTS_KEY, value: JSON.stringify(documents) });
      return documents[index];
    }
    return undefined;
  },

  async deleteDocument(id: string): Promise<void> {
    let documents = await this.getDocuments();
    documents = documents.filter(doc => doc.id !== id);
    await Storage.set({ key: DOCUMENTS_KEY, value: JSON.stringify(documents) });
  },
};
