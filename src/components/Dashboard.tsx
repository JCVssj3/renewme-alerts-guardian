
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Bell, Settings, Calendar, Edit, Trash2 } from 'lucide-react';
import { Document, SortOption } from '@/types';
import { SupabaseStorageService } from '@/services/supabaseStorageService';
import { NotificationService } from '@/services/notificationService';
import { calculateDaysUntilExpiry, getUrgencyStatus, formatExpiryDate } from '@/utils/dateUtils';
import { getDocumentIcon, getDocumentTypeLabel } from '@/utils/documentIcons';

interface DashboardProps {
  onAddDocument: () => void;
  onEditDocument: (document: Document) => void;
  onSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddDocument, onEditDocument, onSettings }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('urgency');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
    
    // Request notification permissions on load
    NotificationService.requestPermissions();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await SupabaseStorageService.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortDocuments = (docs: Document[]): Document[] => {
    return [...docs].sort((a, b) => {
      switch (sortBy) {
        case 'expiry_date':
          return a.expiryDate.getTime() - b.expiryDate.getTime();
        case 'document_type':
          return a.type.localeCompare(b.type);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'urgency':
          const urgencyOrder = { expired: 0, danger: 1, warning: 2, safe: 3 };
          const aUrgency = getUrgencyStatus(a.expiryDate);
          const bUrgency = getUrgencyStatus(b.expiryDate);
          return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
        default:
          return 0;
      }
    });
  };

  const filterDocuments = (docs: Document[]): Document[] => {
    if (filterType === 'all') return docs;
    return docs.filter(doc => doc.type === filterType);
  };

  const handleMarkAsHandled = async (documentId: string) => {
    try {
      await SupabaseStorageService.updateDocument(documentId, { isHandled: true });
      await NotificationService.cancelDocumentReminder(documentId);
      loadDocuments();
    } catch (error) {
      console.error('Error marking document as handled:', error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await SupabaseStorageService.deleteDocument(documentId);
        await NotificationService.cancelDocumentReminder(documentId);
        loadDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleSendUrgentAlert = async (document: Document) => {
    await NotificationService.scheduleUrgentAlert(document);
  };

  const filteredAndSortedDocs = sortDocuments(filterDocuments(documents));
  const urgentDocs = documents.filter(doc => getUrgencyStatus(doc.expiryDate) === 'danger' || getUrgencyStatus(doc.expiryDate) === 'expired');

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg p-2 sm:p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-text-secondary">Loading your documents...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-bg p-2 sm:p-4">
      {/* Header - Mobile Optimized */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary truncate">RenewMe</h1>
            <p className="text-sm sm:text-base text-text-secondary truncate">Never miss a renewal again</p>
          </div>
          <div className="flex gap-1 sm:gap-2 ml-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="icon"
              onClick={onSettings}
              className="mobile-tap h-8 w-8 sm:h-10 sm:w-10 bg-card-bg border-primary-accent/20 hover:bg-button-hover hover:border-primary-accent"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary-accent" />
            </Button>
            <Button 
              onClick={onAddDocument}
              className="mobile-tap btn-primary h-8 sm:h-10 px-2 sm:px-4"
              size="sm"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline">Add Document</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Card className="card-shadow bg-card-bg border-primary-accent/10 card-hover">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-text-primary">{documents.length}</div>
            <div className="text-xs sm:text-sm text-text-secondary">Total</div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow bg-card-bg border-primary-accent/10 card-hover">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-status-danger">{urgentDocs.length}</div>
            <div className="text-xs sm:text-sm text-text-secondary">Urgent</div>
          </CardContent>
        </Card>

        <Card className="card-shadow bg-card-bg border-primary-accent/10 card-hover">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-status-success">
              {documents.filter(doc => getUrgencyStatus(doc.expiryDate) === 'safe').length}
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">Safe</div>
          </CardContent>
        </Card>

        <Card className="card-shadow bg-card-bg border-primary-accent/10 card-hover">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="text-xl sm:text-2xl font-bold text-status-warning">
              {documents.filter(doc => getUrgencyStatus(doc.expiryDate) === 'warning').length}
            </div>
            <div className="text-xs sm:text-sm text-text-secondary">Warning</div>
          </CardContent>
        </Card>
      </div>

      {/* Sort and Filter Controls - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="flex-1 px-3 py-2 rounded-lg border border-primary-accent/20 bg-card-bg text-text-primary text-sm focus:border-primary-accent"
        >
          <option value="urgency">Sort by Urgency</option>
          <option value="expiry_date">Sort by Expiry Date</option>
          <option value="document_type">Sort by Type</option>
          <option value="name">Sort by Name</option>
        </select>

        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-primary-accent/20 bg-card-bg text-text-primary text-sm focus:border-primary-accent"
        >
          <option value="all">All Types</option>
          <option value="passport">Passport</option>
          <option value="drivers_license">Driver's License</option>
          <option value="id_card">ID Card</option>
          <option value="insurance">Insurance</option>
          <option value="visa">Visa</option>
          <option value="certificate">Certificate</option>
          <option value="membership">Membership</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Documents List - Mobile Optimized */}
      {filteredAndSortedDocs.length === 0 ? (
        <Card className="card-shadow bg-card-bg border-primary-accent/10 card-hover">
          <CardContent className="p-6 sm:p-8 text-center">
            <Calendar className="h-12 sm:h-16 w-12 sm:w-16 text-primary-accent mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No Documents Yet</h3>
            <p className="text-text-secondary mb-4 text-sm sm:text-base">Start by adding your first document to track</p>
            <Button onClick={onAddDocument} className="mobile-tap btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredAndSortedDocs.map((document) => {
            const urgency = getUrgencyStatus(document.expiryDate);
            const daysLeft = calculateDaysUntilExpiry(document.expiryDate);
            
            return (
              <Card key={document.id} className="card-shadow mobile-tap bg-card-bg border-primary-accent/10 card-hover">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="text-xl sm:text-2xl flex-shrink-0">{getDocumentIcon(document.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text-primary text-sm sm:text-base truncate">{document.name}</h3>
                        <p className="text-xs sm:text-sm text-text-secondary truncate">{getDocumentTypeLabel(document.type)}</p>
                        <p className="text-xs sm:text-sm text-text-secondary truncate">Expires: {formatExpiryDate(document.expiryDate)}</p>
                        {document.notes && (
                          <p className="text-xs text-text-secondary mt-1 line-clamp-2 break-words">{document.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                      <Badge 
                        className={`text-xs whitespace-nowrap ${
                          urgency === 'safe' ? 'status-safe' :
                          urgency === 'warning' ? 'status-warning' :
                          urgency === 'danger' ? 'status-danger' :
                          'status-expired'
                        }`}
                      >
                        {daysLeft < 0 ? 'Expired' : 
                         daysLeft === 0 ? 'Today' :
                         daysLeft === 1 ? '1 Day' :
                         `${daysLeft} Days`}
                      </Badge>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditDocument(document)}
                          className="mobile-tap h-7 w-7 p-0 bg-card-bg border-primary-accent/20 hover:bg-button-hover hover:border-primary-accent"
                        >
                          <Edit className="h-3 w-3 text-primary-accent" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDocument(document.id)}
                          className="mobile-tap text-status-danger hover:text-status-danger bg-card-bg border-primary-accent/20 hover:bg-status-danger/10 h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {urgency === 'danger' || urgency === 'expired' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendUrgentAlert(document)}
                              className="mobile-tap h-7 w-7 p-0 bg-card-bg border-primary-accent/20 hover:bg-button-hover hover:border-primary-accent"
                            >
                              <Bell className="h-3 w-3 text-primary-accent" />
                            </Button>
                            {!document.isHandled && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleMarkAsHandled(document.id)}
                                className="mobile-tap text-xs px-2 h-7 btn-secondary"
                              >
                                Handle
                              </Button>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
