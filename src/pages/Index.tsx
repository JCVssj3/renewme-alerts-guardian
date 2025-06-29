
import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import AddDocumentForm from '@/components/AddDocumentForm';
import Settings from '@/components/Settings';
import AuthPage from '@/components/AuthPage';
import { SupabaseStorageService } from '@/services/supabaseStorageService';
import { useAuth } from '@/hooks/useAuth';
import { Document } from '@/types';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

type AppView = 'dashboard' | 'add-document' | 'edit-document' | 'settings' | 'auth';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      setCurrentView('auth');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      console.log('RenewMe app initialized for user:', user.email);
      setCurrentView('dashboard');
    }
  }, [user]);

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

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">RenewMe</div>
          <div className="text-gray-600 dark:text-gray-300">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'dashboard' && (
        <div>
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="mobile-tap"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <Dashboard 
            onAddDocument={handleAddDocument}
            onEditDocument={handleEditDocument}
            onSettings={handleSettings}
          />
        </div>
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

      {currentView === 'auth' && (
        <AuthPage onBack={() => setCurrentView('dashboard')} />
      )}
    </div>
  );
};

export default Index;
