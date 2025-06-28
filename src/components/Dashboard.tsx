
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Bell, Settings, Calendar } from 'lucide-react';
import { Document, SortOption } from '@/types';
import { StorageService } from '@/services/storageService';
import { NotificationService } from '@/services/notificationService';
import { calculateDaysUntilExpiry, getUrgencyStatus, formatExpiryDate } from '@/utils/dateUtils';
import { getDocumentIcon, getDocumentTypeLabel } from '@/utils/documentIcons';

interface DashboardProps {
  onAddDocument: () => void;
  onSettings: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddDocument, onSettings }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('urgency');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadDocuments();
    
    // Request notification permissions on load
    NotificationService.requestPermissions();
  }, []);

  const loadDocuments = () => {
    const docs = StorageService.getDocuments();
    setDocuments(docs);
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
    StorageService.updateDocument(documentId, { isHandled: true });
    await NotificationService.cancelDocumentReminder(documentId);
    loadDocuments();
  };

  const handleSendUrgentAlert = async (document: Document) => {
    await NotificationService.scheduleUrgentAlert(document);
  };

  const filteredAndSortedDocs = sortDocuments(filterDocuments(documents));
  const urgentDocs = documents.filter(doc => getUrgencyStatus(doc.expiryDate) === 'danger' || getUrgencyStatus(doc.expiryDate) === 'expired');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">RenewMe</h1>
          <p className="text-gray-600">Never miss a renewal again</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onSettings}
            className="mobile-tap"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            onClick={onAddDocument}
            className="mobile-tap bg-primary hover:bg-primary/90"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{documents.length}</div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{urgentDocs.length}</div>
            <div className="text-sm text-gray-600">Urgent</div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(doc => getUrgencyStatus(doc.expiryDate) === 'safe').length}
            </div>
            <div className="text-sm text-gray-600">Safe</div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {documents.filter(doc => getUrgencyStatus(doc.expiryDate) === 'warning').length}
            </div>
            <div className="text-sm text-gray-600">Warning</div>
          </CardContent>
        </Card>
      </div>

      {/* Sort and Filter Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
        >
          <option value="urgency">Sort by Urgency</option>
          <option value="expiry_date">Sort by Expiry Date</option>
          <option value="document_type">Sort by Type</option>
          <option value="name">Sort by Name</option>
        </select>

        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
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

      {/* Documents List */}
      {filteredAndSortedDocs.length === 0 ? (
        <Card className="card-shadow">
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Documents Yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first document to track</p>
            <Button onClick={onAddDocument} className="mobile-tap">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedDocs.map((document) => {
            const urgency = getUrgencyStatus(document.expiryDate);
            const daysLeft = calculateDaysUntilExpiry(document.expiryDate);
            
            return (
              <Card key={document.id} className="card-shadow mobile-tap">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-2xl">{getDocumentIcon(document.type)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{document.name}</h3>
                        <p className="text-sm text-gray-600">{getDocumentTypeLabel(document.type)}</p>
                        <p className="text-sm text-gray-500">Expires: {formatExpiryDate(document.expiryDate)}</p>
                        {document.notes && (
                          <p className="text-xs text-gray-500 mt-1">{document.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Badge 
                        className={`${
                          urgency === 'safe' ? 'bg-green-100 text-green-800 border-green-200' :
                          urgency === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          urgency === 'danger' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-red-200 text-red-900 border-red-300'
                        }`}
                      >
                        {daysLeft < 0 ? 'Expired' : 
                         daysLeft === 0 ? 'Today' :
                         daysLeft === 1 ? '1 Day' :
                         `${daysLeft} Days`}
                      </Badge>
                      
                      {urgency === 'danger' || urgency === 'expired' ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSendUrgentAlert(document)}
                            className="mobile-tap"
                          >
                            <Bell className="h-3 w-3" />
                          </Button>
                          {!document.isHandled && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleMarkAsHandled(document.id)}
                              className="mobile-tap"
                            >
                              Mark Handled
                            </Button>
                          )}
                        </div>
                      ) : null}
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
