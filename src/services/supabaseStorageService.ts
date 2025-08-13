
import { supabase } from '@/integrations/supabase/client';
import { Document, AppSettings, Entity, CustomDocumentType, ReminderPeriod } from '@/types';

// Use null for anonymous operations to bypass RLS
const ANONYMOUS_USER_ID = null;

export class SupabaseStorageService {
  // Documents
  static async getDocuments(): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .is('user_id', ANONYMOUS_USER_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(doc => ({
        ...doc,
        expiryDate: new Date(doc.expiry_date),
        reminderPeriod: doc.reminder_period as ReminderPeriod,
        reminderTime: doc.reminder_time || '09:00',
        imageUrl: doc.image_url,
        entityId: doc.entity_id,
        isHandled: doc.is_handled,
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at)
      })) || [];
    } catch (error) {
      console.error('Error loading documents:', error);
      return [];
    }
  }

  static async addDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const { error } = await supabase
        .from('documents')
        .insert({
          user_id: ANONYMOUS_USER_ID,
          name: document.name,
          type: document.type,
          expiry_date: document.expiryDate.toISOString(),
          reminder_period: document.reminderPeriod,
          reminder_time: document.reminderTime || '09:00',
          notes: document.notes,
          image_url: document.imageUrl,
          entity_id: document.entityId,
          is_handled: document.isHandled
        } as any);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  static async updateDocument(documentId: string, updates: Partial<Document>) {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.type) updateData.type = updates.type;
      if (updates.expiryDate) updateData.expiry_date = updates.expiryDate.toISOString();
      if (updates.reminderPeriod) updateData.reminder_period = updates.reminderPeriod;
      if (updates.reminderTime) updateData.reminder_time = updates.reminderTime;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.entityId) updateData.entity_id = updates.entityId;
      if (updates.isHandled !== undefined) updateData.is_handled = updates.isHandled;

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId)
        .is('user_id', ANONYMOUS_USER_ID);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  static async deleteDocument(documentId: string) {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .is('user_id', ANONYMOUS_USER_ID);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Entities
  static async getEntities(): Promise<Entity[]> {
    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .is('user_id', ANONYMOUS_USER_ID)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // If no entities exist, create default 'self' entity
      if (!data || data.length === 0) {
        await this.createDefaultEntity();
        return this.getEntities();
      }

      return data?.map(entity => ({
        ...entity,
        createdAt: new Date(entity.created_at),
        updatedAt: new Date(entity.updated_at)
      })) || [];
    } catch (error) {
      console.error('Error loading entities:', error);
      return [];
    }
  }

  private static async createDefaultEntity() {
    try {
      await supabase
        .from('entities')
        .insert({
          id: 'self',
          user_id: ANONYMOUS_USER_ID,
          name: 'Myself',
          tag: 'Personal',
          icon: '👤',
          color: '#3B82F6'
        });
    } catch (error) {
      console.error('Error creating default entity:', error);
    }
  }

  static async addEntity(entity: Omit<Entity, 'createdAt' | 'updatedAt'>) {
    try {
      const { error } = await supabase
        .from('entities')
        .insert({
          id: entity.id,
          user_id: ANONYMOUS_USER_ID,
          name: entity.name,
          tag: entity.tag,
          icon: entity.icon,
          color: entity.color
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding entity:', error);
      throw error;
    }
  }

  static async updateEntity(entityId: string, updates: Partial<Entity>) {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.tag !== undefined) updateData.tag = updates.tag;
      if (updates.icon) updateData.icon = updates.icon;
      if (updates.color) updateData.color = updates.color;

      const { error } = await supabase
        .from('entities')
        .update(updateData)
        .eq('id', entityId)
        .is('user_id', ANONYMOUS_USER_ID);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating entity:', error);
      throw error;
    }
  }

  static async deleteEntity(entityId: string) {
    try {
      if (entityId === 'self') return; // Prevent deleting default entity

      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('id', entityId)
        .is('user_id', ANONYMOUS_USER_ID);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting entity:', error);
      throw error;
    }
  }

  // Custom Document Types
  static async getCustomDocumentTypes(): Promise<CustomDocumentType[]> {
    try {
      const { data, error } = await supabase
        .from('custom_document_types')
        .select('*')
        .is('user_id', ANONYMOUS_USER_ID)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(type => ({
        ...type,
        createdAt: new Date(type.created_at)
      })) || [];
    } catch (error) {
      console.error('Error loading custom document types:', error);
      return [];
    }
  }

  static async addCustomDocumentType(type: Omit<CustomDocumentType, 'id' | 'createdAt'>) {
    try {
      const { error } = await supabase
        .from('custom_document_types')
        .insert({
          user_id: ANONYMOUS_USER_ID,
          name: type.name,
          icon: type.icon
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding custom document type:', error);
      throw error;
    }
  }

  static async deleteCustomDocumentType(typeId: string) {
    try {
      const { error } = await supabase
        .from('custom_document_types')
        .delete()
        .eq('id', typeId)
        .is('user_id', ANONYMOUS_USER_ID);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting custom document type:', error);
      throw error;
    }
  }

  // Settings - Temporarily return default settings
  static async getSettings(): Promise<AppSettings> {
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

  static async saveSettings(settings: AppSettings) {
    // Temporarily disabled until types are updated
    console.log('Settings saved (temporarily disabled):', settings);
  }

  // Document Image Upload - Simplified without auth
  static async uploadDocumentImage(file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `anonymous/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('document-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('document-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading document image:', error);
      return null;
    }
  }

  static async deleteDocumentImage(imageUrl: string) {
    try {
      const fileName = imageUrl.split('/').slice(-2).join('/');
      
      const { error } = await supabase.storage
        .from('document-images')
        .remove([fileName]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting document image:', error);
    }
  }
}
