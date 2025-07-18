
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useEffect, useState } from "react";
import { NotificationService } from "@/services/notificationService";
import Index from "./pages/Index";
import Settings from "./components/Settings";
import { Document } from "./types";
import AddDocumentForm from "./components/AddDocumentForm";
import Dashboard from "./components/Dashboard";

const queryClient = new QueryClient();

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  useEffect(() => {
    NotificationService.initialize();
  }, []);

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setCurrentPage('addDocument');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onAddDocument={() => {
              setEditingDocument(null);
              setCurrentPage('addDocument');
            }}
            onEditDocument={handleEditDocument}
            onSettings={() => setCurrentPage('settings')}
          />
        );
      case 'addDocument':
        return (
          <AddDocumentForm
            onBack={() => setCurrentPage('dashboard')}
            onSuccess={() => setCurrentPage('dashboard')}
            editingDocument={editingDocument}
          />
        );
      case 'settings':
        return <Settings onBack={() => setCurrentPage('dashboard')} />;
      default:
        return <Index />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {renderPage()}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
