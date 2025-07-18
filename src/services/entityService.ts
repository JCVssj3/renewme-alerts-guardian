import { Entity } from '@/types';
import { StorageService } from './storageService';

export class EntityService {
  static async getEntities(): Promise<Entity[]> {
    return await StorageService.getEntities();
  }

  static async addEntity(entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entity> {
    const newEntity: Entity = {
      ...entity,
      id: `ent_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await StorageService.addEntity(newEntity);
    return newEntity;
  }

  static async updateEntity(entityId: string, updates: Partial<Entity>): Promise<void> {
    await StorageService.updateEntity(entityId, updates);
  }

  static async deleteEntity(entityId: string): Promise<void> {
    await StorageService.deleteEntity(entityId);
  }
}
