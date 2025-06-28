
export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  expiryDate: Date;
  reminderPeriod: ReminderPeriod;
  notes?: string;
  imageUrl?: string;
  isHandled: boolean;
  createdAt: Date;
  updatedAt: Date;
  entityId?: string;
}

export type DocumentType = 
  | 'passport'
  | 'drivers_license'
  | 'id_card'
  | 'insurance'
  | 'visa'
  | 'certificate'
  | 'membership'
  | 'other'
  | string; // Allow custom document types

export type ReminderPeriod = 
  | '1_week'
  | '2_weeks' 
  | '1_month'
  | '2_months'
  | '3_months'
  | '6_months'
  | '9_months'
  | '12_months'
  | 'custom';

export type UrgencyStatus = 'safe' | 'warning' | 'danger' | 'expired';

export type SortOption = 'expiry_date' | 'document_type' | 'urgency' | 'name' | 'entity';

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  defaultReminderPeriod: ReminderPeriod;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
}

export interface Entity {
  id: string;
  name: string;
  tag?: string;
  icon?: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomDocumentType {
  id: string;
  name: string;
  icon: string;
  createdAt: Date;
}
