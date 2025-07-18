
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useEffect } from "react";
import { NotificationService } from "@/services/notificationService";
import { Routes, Route, useNavigate } from "react-router-dom";
import Settings from "./components/Settings";
import AddDocumentForm from "./components/AddDocumentForm";
import Dashboard from "./components/Dashboard";

const queryClient = new QueryClient();

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    NotificationService.initialize();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  onAddDocument={() => navigate("/add")}
                  onEditDocument={(doc) => navigate(`/edit/${doc.id}`)}
                  onSettings={() => navigate("/settings")}
                />
              }
            />
            <Route
              path="/add"
              element={
                <AddDocumentForm
                  onBack={() => navigate("/")}
                  onSuccess={() => navigate("/")}
                />
              }
            />
            <Route
              path="/edit/:id"
              element={
                <AddDocumentForm
                  onBack={() => navigate("/")}
                  onSuccess={() => navigate("/")}
                />
              }
            />
            <Route
              path="/settings"
              element={<Settings onBack={() => navigate("/")} />}
            />
          </Routes>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
