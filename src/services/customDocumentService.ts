import { CustomDocumentType } from '@/types';
import { StorageService } from './storageService';

export class CustomDocumentService {
  static async getCustomDocumentTypes(): Promise<CustomDocumentType[]> {
    return await StorageService.getCustomDocumentTypes();
  }

  static async addCustomDocumentType(type: Omit<CustomDocumentType, 'id' | 'createdAt'>): Promise<CustomDocumentType> {
    const newType: CustomDocumentType = {
      ...type,
      id: `type_${Date.now()}`,
      createdAt: new Date(),
    };
    await StorageService.addCustomDocumentType(newType);
    return newType;
  }

  static async deleteCustomDocumentType(typeId: string): Promise<void> {
    await StorageService.deleteCustomDocumentType(typeId);
  }
}
