
import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import AddDocumentForm from '@/components/AddDocumentForm';
import Settings from '@/components/Settings';
import { StorageService } from '@/services/storageService';

type AppView = 'dashboard' | 'add-document' | 'settings';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  useEffect(() => {
    // Initialize app data
    console.log('RenewMe app initialized');
    
    // Load any existing data
    const documents = StorageService.getDocuments();
    const settings = StorageService.getSettings();
    
    console.log(`Loaded ${documents.length} documents`);
    console.log('Settings:', settings);
  }, []);

  const handleAddDocument = () => {
    setCurrentView('add-document');
  };

  const handleSettings = () => {
    setCurrentView('settings');
  };

  const handleBack = () => {
    setCurrentView('dashboard');
  };

  const handleAddSuccess = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen">
      {currentView === 'dashboard' && (
        <Dashboard 
          onAddDocument={handleAddDocument}
          onSettings={handleSettings}
        />
      )}
      
      {currentView === 'add-document' && (
        <AddDocumentForm 
          onBack={handleBack}
          onSuccess={handleAddSuccess}
        />
      )}
      
      {currentView === 'settings' && (
        <Settings onBack={handleBack} />
      )}
    </div>
  );
};

export default Index;
