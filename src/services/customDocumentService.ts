
import { CustomDocumentType } from '@/types';

const CUSTOM_DOCUMENT_TYPES_KEY = 'renewme_custom_document_types';

export class CustomDocumentService {
  static getCustomDocumentTypes(): CustomDocumentType[] {
    try {
      const stored = localStorage.getItem(CUSTOM_DOCUMENT_TYPES_KEY);
      if (!stored) return [];
      
      const types = JSON.parse(stored);
      return types.map((type: any) => ({
        ...type,
        createdAt: new Date(type.createdAt)
      }));
    } catch (error) {
      console.error('Error loading custom document types:', error);
      return [];
    }
  }

  static saveCustomDocumentTypes(types: CustomDocumentType[]) {
    try {
      localStorage.setItem(CUSTOM_DOCUMENT_TYPES_KEY, JSON.stringify(types));
    } catch (error) {
      console.error('Error saving custom document types:', error);
    }
  }

  static addCustomDocumentType(type: Omit<CustomDocumentType, 'id' | 'createdAt'>): CustomDocumentType {
    const types = this.getCustomDocumentTypes();
    const newType: CustomDocumentType = {
      ...type,
      id: `custom_type_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };
    types.push(newType);
    this.saveCustomDocumentTypes(types);
    return newType;
  }

  static deleteCustomDocumentType(typeId: string) {
    const types = this.getCustomDocumentTypes();
    const filtered = types.filter(type => type.id !== typeId);
    this.saveCustomDocumentTypes(filtered);
  }
}
