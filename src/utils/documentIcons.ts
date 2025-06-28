
import { DocumentType } from '@/types';
import { CustomDocumentService } from '@/services/customDocumentService';

export const getDocumentIcon = (type: DocumentType): string => {
  switch (type) {
    case 'passport': return '🛂';
    case 'drivers_license': return '🚗';
    case 'id_card': return '🆔';
    case 'insurance': return '🛡️';
    case 'visa': return '✈️';
    case 'certificate': return '📜';
    case 'membership': return '🎫';
    case 'other': return '📄';
    default:
      // Check custom document types
      const customTypes = CustomDocumentService.getCustomDocumentTypes();
      const customType = customTypes.find(ct => ct.id === type);
      return customType?.icon || '📄';
  }
};

export const getDocumentTypeLabel = (type: DocumentType): string => {
  switch (type) {
    case 'passport': return 'Passport';
    case 'drivers_license': return "Driver's License";
    case 'id_card': return 'ID Card';
    case 'insurance': return 'Insurance';
    case 'visa': return 'Visa';
    case 'certificate': return 'Certificate';
    case 'membership': return 'Membership';
    case 'other': return 'Other';
    default:
      // Check custom document types
      const customTypes = CustomDocumentService.getCustomDocumentTypes();
      const customType = customTypes.find(ct => ct.id === type);
      return customType?.name || 'Unknown';
  }
};

export const documentTypeOptions = [
  { value: 'passport' as DocumentType, label: 'Passport', icon: '🛂' },
  { value: 'drivers_license' as DocumentType, label: "Driver's License", icon: '🚗' },
  { value: 'id_card' as DocumentType, label: 'ID Card', icon: '🆔' },
  { value: 'insurance' as DocumentType, label: 'Insurance', icon: '🛡️' },
  { value: 'visa' as DocumentType, label: 'Visa', icon: '✈️' },
  { value: 'certificate' as DocumentType, label: 'Certificate', icon: '📜' },
  { value: 'membership' as DocumentType, label: 'Membership', icon: '🎫' },
  { value: 'other' as DocumentType, label: 'Other', icon: '📄' },
];

export const getAllDocumentTypeOptions = () => {
  const customTypes = CustomDocumentService.getCustomDocumentTypes();
  const customOptions = customTypes.map(type => ({
    value: type.id as DocumentType,
    label: type.name,
    icon: type.icon
  }));
  
  return [...documentTypeOptions, ...customOptions];
};
