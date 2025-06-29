
import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import AddDocumentForm from '@/components/AddDocumentForm';
import Settings from '@/components/Settings';
import { Document } from '@/types';

type AppView = 'dashboard' | 'add-document' | 'edit-document' | 'settings';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  useEffect(() => {
    console.log('RenewMe app initialized');
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
    <div className="min-h-screen bg-background">
      {/* Top Ad Strip - Reserved Space */}
      <div className="w-full h-16 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-xs text-gray-400 dark:text-gray-500">Ad Space Reserved</div>
      </div>

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

      {/* Bottom Ad Strip - Reserved Space */}
      <div className="w-full h-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-xs text-gray-400 dark:text-gray-500">Ad Space Reserved</div>
      </div>
    </div>
  );
};

export default Index;
