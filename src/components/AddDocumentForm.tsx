
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, Camera, Image, Plus } from 'lucide-react';
import { Document, DocumentType, ReminderPeriod, Entity } from '@/types';
import { SupabaseStorageService } from '@/services/supabaseStorageService';
import { EntityService } from '@/services/entityService';
import { NotificationService } from '@/services/notificationService';
import { CameraService } from '@/services/cameraService';
import { getAllDocumentTypeOptions } from '@/utils/documentIcons';

interface AddDocumentFormProps {
  onBack: () => void;
  onSuccess: () => void;
  editingDocument?: Document | null;
}

const AddDocumentForm: React.FC<AddDocumentFormProps> = ({ onBack, onSuccess, editingDocument }) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '' as DocumentType,
    expiryDate: undefined as Date | undefined,
    reminderPeriod: '2_weeks' as ReminderPeriod,
    notes: '',
    imageUrl: '',
    entityId: 'self'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const reminderOptions = [
    { value: '1_week', label: '1 Week Before' },
    { value: '2_weeks', label: '2 Weeks Before' },
    { value: '1_month', label: '1 Month Before' },
    { value: '2_months', label: '2 Months Before' },
    { value: '3_months', label: '3 Months Before' },
    { value: '6_months', label: '6 Months Before' },
    { value: '9_months', label: '9 Months Before' },
    { value: '12_months', label: '12 Months Before' }
  ];

  useEffect(() => {
    loadEntities();

    if (editingDocument) {
      setFormData({
        name: editingDocument.name,
        type: editingDocument.type,
        expiryDate: editingDocument.expiryDate,
        reminderPeriod: editingDocument.reminderPeriod,
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

  const handleTakePhoto = async () => {
    try {
      const file = await CameraService.takePicture();
      if (file) {
        setImageFile(file);
        console.log('Photo captured successfully:', file.name);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Failed to take photo. Please try again.');
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const file = await CameraService.selectFromGallery();
      if (file) {
        setImageFile(file);
        console.log('Image selected successfully:', file.name);
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      alert('Failed to select image. Please try again.');
    }
  };

  const handleManualUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setImageFile(file);
        console.log('Manual file upload successful:', file.name);
      }
    };
    input.click();
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            className="mobile-tap"
          >
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
              <Label htmlFor="entity" className="text-gray-700 dark:text-gray-300">Assign To</Label>
              <Select 
                value={formData.entityId} 
                onValueChange={(value) => setFormData({ ...formData, entityId: value })}
              >
                <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 z-50">
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: entity.color }}
                        >
                          {entity.icon}
                        </div>
                        <span>{entity.name}</span>
                        {entity.tag && <span className="text-xs text-gray-500">({entity.tag})</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Document Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., John's Passport"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Document Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: DocumentType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 z-50">
                  {getAllDocumentTypeOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center space-x-2">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate" className="text-gray-700 dark:text-gray-300">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formatDateForInput(formData.expiryDate)}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  setFormData({ ...formData, expiryDate: date });
                }}
                required
                className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Reminder Timeframe */}
            <div className="space-y-2">
              <Label htmlFor="reminder" className="text-gray-700 dark:text-gray-300">Reminder Timeframe</Label>
              <Select 
                value={formData.reminderPeriod} 
                onValueChange={(value: ReminderPeriod) => setFormData({ ...formData, reminderPeriod: value })}
              >
                <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 z-50">
                  {reminderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700 dark:text-gray-300">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this document..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Document Image */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Document Image</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTakePhoto}
                  className="mobile-tap"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSelectFromGallery}
                  className="mobile-tap"
                >
                  <Image className="h-4 w-4 mr-2" />
                  From Gallery
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleManualUpload}
                  className="mobile-tap"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              </div>
              {imageFile && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Selected: {imageFile.name}
                </div>
              )}
            </div>

            {/* Save Button */}
            <Button 
              type="submit" 
              className="w-full mobile-tap bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingDocument ? 'Update Document' : 'Save Document'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDocumentForm;
