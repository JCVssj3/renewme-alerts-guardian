import { supabase } from '@/integrations/supabase/client';
import { Document, AppSettings, Entity, CustomDocumentType, ReminderPeriod } from '@/types';

export class SupabaseStorageService {
  // Helper method to get current user ID
  private static async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  // Documents
  static async getDocuments(): Promise<Document[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(doc => ({
        ...doc,
        expiryDate: new Date(doc.expiry_date),
        reminderPeriod: doc.reminder_period as ReminderPeriod,
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
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('documents')
        .insert({
          user_id: userId,
          name: document.name,
          type: document.type,
          expiry_date: document.expiryDate.toISOString(),
          reminder_period: document.reminderPeriod,
          notes: document.notes,
          image_url: document.imageUrl,
          entity_id: document.entityId,
          is_handled: document.isHandled
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  static async updateDocument(documentId: string, updates: Partial<Document>) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.type) updateData.type = updates.type;
      if (updates.expiryDate) updateData.expiry_date = updates.expiryDate.toISOString();
      if (updates.reminderPeriod) updateData.reminder_period = updates.reminderPeriod;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.entityId) updateData.entity_id = updates.entityId;
      if (updates.isHandled !== undefined) updateData.is_handled = updates.isHandled;

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  static async deleteDocument(documentId: string) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Entities
  static async getEntities(): Promise<Entity[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // If no entities exist, create default 'self' entity
      if (!data || data.length === 0) {
        await this.createDefaultEntity(userId);
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

  private static async createDefaultEntity(userId: string) {
    try {
      await supabase
        .from('entities')
        .insert({
          id: 'self',
          user_id: userId,
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
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('entities')
        .insert({
          id: entity.id,
          user_id: userId,
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
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.tag !== undefined) updateData.tag = updates.tag;
      if (updates.icon) updateData.icon = updates.icon;
      if (updates.color) updateData.color = updates.color;

      const { error } = await supabase
        .from('entities')
        .update(updateData)
        .eq('id', entityId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating entity:', error);
      throw error;
    }
  }

  static async deleteEntity(entityId: string) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      if (entityId === 'self') return; // Prevent deleting default entity

      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('id', entityId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting entity:', error);
      throw error;
    }
  }

  // Custom Document Types
  static async getCustomDocumentTypes(): Promise<CustomDocumentType[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('custom_document_types')
        .select('*')
        .eq('user_id', userId)
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
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('custom_document_types')
        .insert({
          user_id: userId,
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
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('custom_document_types')
        .delete()
        .eq('id', typeId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting custom document type:', error);
      throw error;
    }
  }

  // Settings
  static async getSettings(): Promise<AppSettings> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.log('No user ID found, returning default settings');
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

      console.log('Fetching settings for user:', userId);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        throw error;
      }

      if (!data) {
        console.log('No settings found, creating default settings');
        await this.createDefaultSettings(userId);
        return this.getSettings();
      }

      console.log('Raw settings data:', data);
      return {
        theme: 'system',
        notifications: {
          enabled: data.notifications_enabled ?? true,
          sound: data.notifications_sound ?? true,
          vibration: data.notifications_vibration ?? true,
          defaultReminderPeriod: (data.default_reminder_period as ReminderPeriod) || '2_weeks'
        }
      };
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

  private static async createDefaultSettings(userId: string) {
    try {
      console.log('Creating default settings for user:', userId);
      const { error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          notifications_enabled: true,
          notifications_sound: true,
          notifications_vibration: true,
          default_reminder_period: '2_weeks'
        });
      
      if (error) {
        console.error('Error creating default settings:', error);
        throw error;
      }
      console.log('Default settings created successfully');
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  }

  static async saveSettings(settings: AppSettings) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      console.log('Saving settings for user:', userId, settings);
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          notifications_enabled: settings.notifications.enabled,
          notifications_sound: settings.notifications.sound,
          notifications_vibration: settings.notifications.vibration,
          default_reminder_period: settings.notifications.defaultReminderPeriod
        });

      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Document Image Upload
  static async uploadDocumentImage(file: File): Promise<string | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

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
