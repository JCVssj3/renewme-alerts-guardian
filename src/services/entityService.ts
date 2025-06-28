
import { Entity } from '@/types';

const ENTITIES_KEY = 'renewme_entities';

export class EntityService {
  static getEntities(): Entity[] {
    try {
      const stored = localStorage.getItem(ENTITIES_KEY);
      if (!stored) return this.getDefaultEntities();
      
      const entities = JSON.parse(stored);
      return entities.map((entity: any) => ({
        ...entity,
        createdAt: new Date(entity.createdAt),
        updatedAt: new Date(entity.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading entities:', error);
      return this.getDefaultEntities();
    }
  }

  static getDefaultEntities(): Entity[] {
    const defaultEntities = [
      {
        id: 'self',
        name: 'Self',
        tag: 'Personal',
        icon: '👤',
        color: '#3B82F6',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    this.saveEntities(defaultEntities);
    return defaultEntities;
  }

  static saveEntities(entities: Entity[]) {
    try {
      localStorage.setItem(ENTITIES_KEY, JSON.stringify(entities));
    } catch (error) {
      console.error('Error saving entities:', error);
    }
  }

  static addEntity(entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Entity {
    const entities = this.getEntities();
    const newEntity: Entity = {
      ...entity,
      id: `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    entities.push(newEntity);
    this.saveEntities(entities);
    return newEntity;
  }

  static updateEntity(entityId: string, updates: Partial<Entity>) {
    const entities = this.getEntities();
    const index = entities.findIndex(entity => entity.id === entityId);
    
    if (index !== -1) {
      entities[index] = { 
        ...entities[index], 
        ...updates, 
        updatedAt: new Date() 
      };
      this.saveEntities(entities);
    }
  }

  static deleteEntity(entityId: string) {
    if (entityId === 'self') return; // Prevent deleting default entity
    const entities = this.getEntities();
    const filtered = entities.filter(entity => entity.id !== entityId);
    this.saveEntities(filtered);
  }

  static getEntityById(entityId: string): Entity | undefined {
    const entities = this.getEntities();
    return entities.find(entity => entity.id === entityId);
  }
}
