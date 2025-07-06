
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';
import AuthPage from '@/components/AuthPage';
import AddDocumentForm from '@/components/AddDocumentForm';
import Settings from '@/components/Settings';
import EntityManagement from '@/components/EntityManagement';
import CustomDocumentTypes from '@/components/CustomDocumentTypes';
import { Document } from '@/types';
import ScreenContainer from '@/components/ScreenContainer';

type Screen = 'dashboard' | 'auth' | 'add-document' | 'settings' | 'entities' | 'document-types';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [documentToEdit, setDocumentToEdit] = useState<Document | undefined>();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-secondary">Loading RenewMe...</div>
        </div>
      </ScreenContainer>
    );
  }

  // Show auth page if user is not authenticated
  if (!user) {
    return (
      <AuthPage
        onBack={() => setCurrentScreen('dashboard')}
        onAuthSuccess={() => setCurrentScreen('dashboard')}
      />
    );
  }

  // User is authenticated, show app screens
  const handleEditDocument = (document: Document) => {
    setDocumentToEdit(document);
    setCurrentScreen('add-document');
  };

  const handleAddDocument = () => {
    setDocumentToEdit(undefined);
    setCurrentScreen('add-document');
  };

  const handleBackToDashboard = () => {
    setDocumentToEdit(undefined);
    setCurrentScreen('dashboard');
  };

  const handleDocumentSuccess = () => {
    setDocumentToEdit(undefined);
    setCurrentScreen('dashboard');
  };

  switch (currentScreen) {
    case 'auth':
      return (
        <AuthPage
          onBack={() => setCurrentScreen('dashboard')}
          onAuthSuccess={() => setCurrentScreen('dashboard')}
        />
      );
    
    case 'add-document':
      return (
        <AddDocumentForm
          onBack={handleBackToDashboard}
          onSuccess={handleDocumentSuccess}
          editingDocument={documentToEdit}
        />
      );
    
    case 'settings':
      return (
        <Settings onBack={handleBackToDashboard} />
      );
    
    case 'entities':
      return (
        <EntityManagement onBack={handleBackToDashboard} />
      );
    
    case 'document-types':
      return (
        <CustomDocumentTypes onBack={handleBackToDashboard} />
      );
    
    default:
      return (
        <Dashboard
          onAddDocument={handleAddDocument}
          onEditDocument={handleEditDocument}
          onSettings={() => setCurrentScreen('settings')}
        />
      );
  }
};

export default Index;
