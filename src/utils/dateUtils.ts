
import { UrgencyStatus, ReminderPeriod } from '@/types';

export const calculateDaysUntilExpiry = (expiryDate: Date): number => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getUrgencyStatus = (expiryDate: Date): UrgencyStatus => {
  const daysLeft = calculateDaysUntilExpiry(expiryDate);
  
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 7) return 'danger';
  if (daysLeft <= 30) return 'warning';
  return 'safe';
};

export const getUrgencyColor = (urgency: UrgencyStatus): string => {
  switch (urgency) {
    case 'safe': return 'text-green-700 bg-green-50 border-green-200';
    case 'warning': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'danger': return 'text-red-700 bg-red-50 border-red-200';
    case 'expired': return 'text-red-800 bg-red-100 border-red-300';
  }
};

export const formatExpiryDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getReminderDate = (expiryDate: Date, period: ReminderPeriod): Date => {
  const expiry = new Date(expiryDate);
  
  switch (period) {
    case '1_week':
      return new Date(expiry.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '2_weeks':
      return new Date(expiry.getTime() - 14 * 24 * 60 * 60 * 1000);
    case '1_month':
      return new Date(expiry.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '2_months':
      return new Date(expiry.getTime() - 60 * 24 * 60 * 60 * 1000);
    case '3_months':
      return new Date(expiry.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(expiry.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
};

export const getReminderPeriodLabel = (period: ReminderPeriod): string => {
  switch (period) {
    case '1_week': return '1 Week Before';
    case '2_weeks': return '2 Weeks Before';
    case '1_month': return '1 Month Before';
    case '2_months': return '2 Months Before';
    case '3_months': return '3 Months Before';
    case 'custom': return 'Custom';
  }
};
