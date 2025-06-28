
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
}

export type DocumentType = 
  | 'passport'
  | 'drivers_license'
  | 'id_card'
  | 'insurance'
  | 'visa'
  | 'certificate'
  | 'membership'
  | 'other';

export type ReminderPeriod = 
  | '1_week'
  | '2_weeks' 
  | '1_month'
  | '2_months'
  | '3_months'
  | 'custom';

export type UrgencyStatus = 'safe' | 'warning' | 'danger' | 'expired';

export type SortOption = 'expiry_date' | 'document_type' | 'urgency' | 'name';

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
