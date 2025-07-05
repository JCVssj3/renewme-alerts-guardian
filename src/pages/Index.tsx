
import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import AddDocumentForm from '@/components/AddDocumentForm';
import Settings from '@/components/Settings';
import { Document } from '@/types';
import { NotificationService } from '@/services/notificationService';

type AppView = 'dashboard' | 'add-document' | 'edit-document' | 'settings';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  useEffect(() => {
    console.log('RenewMe app initialized');
    
    // Initialize notification system
    const initNotifications = async () => {
      await NotificationService.requestPermissions();
      await NotificationService.initializeNotificationListeners();
    };
    
    initNotifications();
  }, []);

  const handleAddDocument = () => {
    setEditingDocument(null);
    setCurrentView('add-document');
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setCurrentView('edit-document');
  };

  const handleSettings = () => {
    setCurrentView('settings');
  };

  const handleBack = () => {
    setEditingDocument(null);
    setCurrentView('dashboard');
  };

  const handleAddSuccess = () => {
    setEditingDocument(null);
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-primary-bg" style={{ paddingTop: 'max(env(safe-area-inset-top), 1.5rem)' }}>
      {currentView === 'dashboard' && (
        <Dashboard 
          onAddDocument={handleAddDocument}
          onEditDocument={handleEditDocument}
          onSettings={handleSettings}
        />
      )}
      
      {(currentView === 'add-document' || currentView === 'edit-document') && (
        <div className="p-2 sm:p-4">
          <AddDocumentForm 
            onBack={handleBack}
            onSuccess={handleAddSuccess}
            editingDocument={editingDocument}
          />
        </div>
      )}
      
      {currentView === 'settings' && (
        <div className="p-2 sm:p-4">
          <Settings onBack={handleBack} />
        </div>
      )}
    </div>
  );
};

export default Index;
