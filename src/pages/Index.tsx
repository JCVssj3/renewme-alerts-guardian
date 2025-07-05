
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
    <div className="min-h-screen gradient-bg pt-8">
      {currentView === 'dashboard' && (
        <Dashboard 
          onAddDocument={handleAddDocument}
          onEditDocument={handleEditDocument}
          onSettings={handleSettings}
        />
      )}
      
      {(currentView === 'add-document' || currentView === 'edit-document') && (
        <AddDocumentForm 
          onBack={handleBack}
          onSuccess={handleAddSuccess}
          editingDocument={editingDocument}
        />
      )}
      
      {currentView === 'settings' && (
        <Settings onBack={handleBack} />
      )}
    </div>
  );
};

export default Index;
