import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TimePicker } from '@/components/ui/time-picker';
import { ArrowUp, Plus, User, FileText } from 'lucide-react';
import { Document, DocumentType, ReminderPeriod, Entity, CustomDocumentType } from '@/types';
import { SupabaseStorageService } from '@/services/supabaseStorageService';
import { EntityService } from '@/services/entityService';
import { CustomDocumentService } from '@/services/customDocumentService';
import { NotificationService } from '@/services/notificationService';
import { getAllDocumentTypeOptions } from '@/utils/documentIcons';
interface AddDocumentFormProps {
  onBack: () => void;
  onSuccess: () => void;
  editingDocument?: Document | null;
}
const AddDocumentForm: React.FC<AddDocumentFormProps> = ({
  onBack,
  onSuccess,
  editingDocument
}) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [customDocumentTypes, setCustomDocumentTypes] = useState<CustomDocumentType[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as DocumentType,
    expiryDate: undefined as Date | undefined,
    reminderPeriod: '2_weeks' as ReminderPeriod,
    reminderTime: '09:00' as string,
    notes: '',
    imageUrl: '',
    entityId: 'self'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Add Entity Dialog State
  const [isAddEntityDialogOpen, setIsAddEntityDialogOpen] = useState(false);
  const [entityFormData, setEntityFormData] = useState({
    name: '',
    tag: '',
    icon: '👤',
    color: '#3B82F6'
  });

  // Add Document Type Dialog State
  const [isAddTypeDialogOpen, setIsAddTypeDialogOpen] = useState(false);
  const [typeFormData, setTypeFormData] = useState({
    name: '',
    icon: '📄'
  });
  const reminderOptions = [{
    value: '1_week',
    label: '1 Week Before'
  }, {
    value: '2_weeks',
    label: '2 Weeks Before'
  }, {
    value: '1_month',
    label: '1 Month Before'
  }, {
    value: '2_months',
    label: '2 Months Before'
  }, {
    value: '3_months',
    label: '3 Months Before'
  }, {
    value: '6_months',
    label: '6 Months Before'
  }, {
    value: '9_months',
    label: '9 Months Before'
  }, {
    value: '12_months',
    label: '12 Months Before'
  }];
  const entityIcons = ['👤', '👨', '👩', '👶', '👴', '👵', '👨‍💼', '👩‍💼', '👨‍⚕️', '👩‍⚕️', '🏢', '🏠'];
  const entityColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
  const documentIcons = ['📄', '📋', '📜', '🆔', '🛂', '🚗', '🛡️', '✈️', '🎫', '📊', '📈', '💼', '🏠', '⚕️', '🎓', '🏛️'];
  useEffect(() => {
    loadEntities();
    loadCustomDocumentTypes();
    if (editingDocument) {
      setFormData({
        name: editingDocument.name,
        type: editingDocument.type,
        expiryDate: editingDocument.expiryDate,
        reminderPeriod: editingDocument.reminderPeriod,
        reminderTime: editingDocument.reminderTime || '09:00',
        notes: editingDocument.notes || '',
        imageUrl: editingDocument.imageUrl || '',
        entityId: editingDocument.entityId || 'self'
      });
    }
  }, [editingDocument]);
  const loadEntities = () => {
    const loadedEntities = EntityService.getEntities();
    setEntities(loadedEntities);
  };
  const loadCustomDocumentTypes = () => {
    const types = CustomDocumentService.getCustomDocumentTypes();
    setCustomDocumentTypes(types);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started with data:', formData);
    if (!formData.name || !formData.type || !formData.expiryDate) {
      alert('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      let imageUrl = formData.imageUrl;

      // Upload image if selected
      if (imageFile) {
        console.log('Uploading image file:', imageFile.name);
        const uploadedUrl = await SupabaseStorageService.uploadDocumentImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('Image uploaded successfully:', uploadedUrl);
        }
      }
      if (editingDocument) {
        console.log('Updating existing document:', editingDocument.id);
        await SupabaseStorageService.updateDocument(editingDocument.id, {
          name: formData.name.trim(),
          type: formData.type,
          expiryDate: formData.expiryDate,
          reminderPeriod: formData.reminderPeriod,
          reminderTime: formData.reminderTime,
          notes: formData.notes.trim(),
          imageUrl: imageUrl,
          entityId: formData.entityId
        });
        await NotificationService.scheduleDocumentReminder({
          ...editingDocument,
          name: formData.name.trim(),
          type: formData.type,
          expiryDate: formData.expiryDate,
          reminderPeriod: formData.reminderPeriod,
          reminderTime: formData.reminderTime,
          notes: formData.notes.trim(),
          imageUrl: imageUrl,
          entityId: formData.entityId
        });
      } else {
        const newDocument = {
          name: formData.name.trim(),
          type: formData.type,
          expiryDate: formData.expiryDate,
          reminderPeriod: formData.reminderPeriod,
          reminderTime: formData.reminderTime,
          notes: formData.notes.trim(),
          imageUrl: imageUrl,
          entityId: formData.entityId,
          isHandled: false
        };
        console.log('Adding new document:', newDocument);
        await SupabaseStorageService.addDocument(newDocument);
        await NotificationService.scheduleDocumentReminder({
          ...newDocument,
          id: `temp_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      console.log('Document saved successfully');
      onSuccess();
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleManualUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setImageFile(file);
        console.log('Manual file upload successful:', file.name);
      }
    };
    input.click();
  };
  const handleAddEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityFormData.name.trim()) return;
    const newEntity = EntityService.addEntity(entityFormData);
    loadEntities();
    setFormData({
      ...formData,
      entityId: newEntity.id
    });
    setEntityFormData({
      name: '',
      tag: '',
      icon: '👤',
      color: '#3B82F6'
    });
    setIsAddEntityDialogOpen(false);
  };
  const handleAddDocumentType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeFormData.name.trim()) return;
    CustomDocumentService.addCustomDocumentType(typeFormData);
    loadCustomDocumentTypes();
    setTypeFormData({
      name: '',
      icon: '📄'
    });
    setIsAddTypeDialogOpen(false);
  };
  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };
  const getAllDocumentOptions = () => {
    const standardOptions = getAllDocumentTypeOptions();
    const customOptions = customDocumentTypes.map(type => ({
      value: type.id,
      label: type.name,
      icon: type.icon
    }));
    return [...standardOptions, ...customOptions];
  };
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 pt-12 bg-amber-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-8">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="icon" onClick={onBack} className="mobile-tap">
            <ArrowUp className="h-5 w-5 rotate-[-90deg]" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {editingDocument ? 'Edit Document' : 'Add Document'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {editingDocument ? 'Update renewal reminder' : 'Create a new renewal reminder'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="card-shadow bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200">Document Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Assign To */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="entity" className="text-gray-700 dark:text-gray-300">Assign To</Label>
                <Dialog open={isAddEntityDialogOpen} onOpenChange={setIsAddEntityDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="mobile-tap">
                      <User className="h-3 w-3 mr-1" />
                      Add Entity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-800">
                    <DialogHeader>
                      <DialogTitle>Add New Entity</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddEntity} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="entityName">Name *</Label>
                        <Input id="entityName" value={entityFormData.name} onChange={e => setEntityFormData({
                        ...entityFormData,
                        name: e.target.value
                      })} placeholder="e.g., John Smith" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="entityTag">Tag</Label>
                        <Input id="entityTag" value={entityFormData.tag} onChange={e => setEntityFormData({
                        ...entityFormData,
                        tag: e.target.value
                      })} placeholder="e.g., Family, Work" />
                      </div>

                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <div className="flex flex-wrap gap-2">
                          {entityIcons.map(icon => <Button key={icon} type="button" variant={entityFormData.icon === icon ? 'default' : 'outline'} className="w-10 h-10 p-0" onClick={() => setEntityFormData({
                          ...entityFormData,
                          icon
                        })}>
                              {icon}
                            </Button>)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex flex-wrap gap-2">
                          {entityColors.map(color => <button key={color} type="button" className={`w-8 h-8 rounded-full border-2 ${entityFormData.color === color ? 'border-gray-800' : 'border-gray-300'}`} style={{
                          backgroundColor: color
                        }} onClick={() => setEntityFormData({
                          ...entityFormData,
                          color
                        })} />)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Add Entity</Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddEntityDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={formData.entityId} onValueChange={value => setFormData({
              ...formData,
              entityId: value
            })}>
                <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 z-50">
                  {entities.map(entity => <SelectItem key={entity.id} value={entity.id}>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{
                      backgroundColor: entity.color
                    }}>
                          {entity.icon}
                        </div>
                        <span>{entity.name}</span>
                        {entity.tag && <span className="text-xs text-gray-500">({entity.tag})</span>}
                      </div>
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Document Name</Label>
              <Input id="name" type="text" placeholder="e.g., John's Passport" value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} required className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Document Type</Label>
                <Dialog open={isAddTypeDialogOpen} onOpenChange={setIsAddTypeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" size="sm" className="mobile-tap">
                      <FileText className="h-3 w-3 mr-1" />
                      Add Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white dark:bg-gray-800">
                    <DialogHeader>
                      <DialogTitle>Add Custom Document Type</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddDocumentType} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="typeName">Type Name *</Label>
                        <Input id="typeName" value={typeFormData.name} onChange={e => setTypeFormData({
                        ...typeFormData,
                        name: e.target.value
                      })} placeholder="e.g., Birth Certificate" required />
                      </div>

                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <div className="flex flex-wrap gap-2">
                          {documentIcons.map(icon => <Button key={icon} type="button" variant={typeFormData.icon === icon ? 'default' : 'outline'} className="w-10 h-10 p-0" onClick={() => setTypeFormData({
                          ...typeFormData,
                          icon
                        })}>
                              {icon}
                            </Button>)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Add Type</Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddTypeDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={formData.type} onValueChange={(value: DocumentType) => setFormData({
              ...formData,
              type: value
            })}>
                <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 z-50">
                  {getAllDocumentOptions().map(option => <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-gray-700 dark:text-gray-300">Expiry Date</Label>
              <Input id="expiryDate" type="date" value={formatDateForInput(formData.expiryDate)} onChange={e => {
              const date = e.target.value ? new Date(e.target.value) : undefined;
              setFormData({
                ...formData,
                expiryDate: date
              });
            }} required className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
            </div>

            {/* Reminder Timeframe */}
            <div className="space-y-2">
              <Label htmlFor="reminder" className="text-gray-700 dark:text-gray-300">Reminder Timeframe</Label>
              <Select value={formData.reminderPeriod} onValueChange={(value: ReminderPeriod) => setFormData({
              ...formData,
              reminderPeriod: value
            })}>
                <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 z-50">
                  {reminderOptions.map(option => <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Reminder Time */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Reminder Time</Label>
              <TimePicker
                value={formData.reminderTime}
                onChange={(time) => setFormData({ ...formData, reminderTime: time })}
                placeholder="Select reminder time"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
              <p className="text-sm text-muted-foreground">
                You'll be notified at this time on your reminder day, even if the app is closed.
              </p>
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Notes (Optional)</Label>
              <Textarea id="notes" placeholder="Additional notes about this document..." value={formData.notes} onChange={e => setFormData({
              ...formData,
              notes: e.target.value
            })} rows={3} className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
            </div>

            {/* Document Image */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Document Image</Label>
              <Button type="button" variant="outline" onClick={handleManualUpload} className="mobile-tap w-full">
                <Plus className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
              {imageFile && <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Selected: {imageFile.name}
                </div>}
            </div>

            {/* Save Button */}
            <Button type="submit" className="w-full mobile-tap bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingDocument ? 'Update Document' : 'Save Document'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>;
};
export default AddDocumentForm;