import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowUp, Camera, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Document, DocumentType, ReminderPeriod, Entity } from '@/types';
import { StorageService } from '@/services/storageService';
import { NotificationService } from '@/services/notificationService';
import { getAllDocumentTypeOptions } from '@/utils/documentIcons';
import { EntityService } from '@/services/entityService';
import { cn } from '@/lib/utils';

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
    const loadedEntities = EntityService.getEntities();
    setEntities(loadedEntities);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.expiryDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingDocument) {
        const updatedDocument: Document = {
          ...editingDocument,
          name: formData.name.trim(),
          type: formData.type,
          expiryDate: formData.expiryDate,
          reminderPeriod: formData.reminderPeriod,
          notes: formData.notes.trim(),
          imageUrl: formData.imageUrl,
          entityId: formData.entityId,
          updatedAt: new Date()
        };
        
        StorageService.updateDocument(editingDocument.id, updatedDocument);
        await NotificationService.scheduleDocumentReminder(updatedDocument);
      } else {
        const newDocument: Document = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: formData.name.trim(),
          type: formData.type,
          expiryDate: formData.expiryDate,
          reminderPeriod: formData.reminderPeriod,
          notes: formData.notes.trim(),
          imageUrl: formData.imageUrl,
          entityId: formData.entityId,
          isHandled: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        StorageService.addDocument(newDocument);
        await NotificationService.scheduleDocumentReminder(newDocument);
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

  const handleImageCapture = () => {
    alert('Camera functionality will be implemented with Capacitor Camera plugin');
  };

  const getEntityById = (entityId: string) => {
    return entities.find(e => e.id === entityId);
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
            {/* Entity Assignment */}
            <div className="space-y-2">
              <Label htmlFor="entity" className="text-gray-700 dark:text-gray-300">Assign To</Label>
              <Select 
                value={formData.entityId} 
                onValueChange={(value) => setFormData({ ...formData, entityId: value })}
              >
                <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
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
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Document Name *</Label>
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
              <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Document Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: DocumentType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
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
              <Label className="text-gray-700 dark:text-gray-300">Expiry Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600",
                      !formData.expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiryDate ? format(formData.expiryDate, "PPP") : "Pick expiry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.expiryDate}
                    onSelect={(date) => setFormData({ ...formData, expiryDate: date })}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Reminder Period */}
            <div className="space-y-2">
              <Label htmlFor="reminder" className="text-gray-700 dark:text-gray-300">Reminder Timeframe</Label>
              <Select 
                value={formData.reminderPeriod} 
                onValueChange={(value: ReminderPeriod) => setFormData({ ...formData, reminderPeriod: value })}
              >
                <SelectTrigger className="mobile-tap bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  {reminderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
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

            {/* Document Upload */}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Document Image (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                onClick={handleImageCapture}
                className="w-full mobile-tap"
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo or Upload Document
              </Button>
            </div>

            {/* Submit Button */}
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
