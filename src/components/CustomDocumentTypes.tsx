
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, FileText } from 'lucide-react';
import { CustomDocumentType } from '@/types';
import { SupabaseStorageService } from '@/services/supabaseStorageService';

interface CustomDocumentTypesProps {
  onBack: () => void;
}

const CustomDocumentTypes: React.FC<CustomDocumentTypesProps> = ({ onBack }) => {
  const [customTypes, setCustomTypes] = useState<CustomDocumentType[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    icon: '📄'
  });

  const documentIcons = [
    '📄', '📋', '📜', '🆔', '🛂', '🚗', '🛡️', '✈️', 
    '🎫', '📊', '📈', '💼', '🏠', '⚕️', '🎓', '🏛️'
  ];

  useEffect(() => {
    loadCustomTypes();
  }, []);

  const loadCustomTypes = async () => {
    try {
      setLoading(true);
      const types = await SupabaseStorageService.getCustomDocumentTypes();
      setCustomTypes(types);
    } catch (error) {
      console.error('Error loading custom document types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      await SupabaseStorageService.addCustomDocumentType(formData);
      resetForm();
      loadCustomTypes();
    } catch (error) {
      console.error('Error adding custom document type:', error);
    }
  };

  const handleDelete = async (typeId: string) => {
    if (confirm('Are you sure you want to delete this document type?')) {
      try {
        await SupabaseStorageService.deleteCustomDocumentType(typeId);
        loadCustomTypes();
      } catch (error) {
        console.error('Error deleting custom document type:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '📄'
    });
    setIsAddDialogOpen(false);
  };

  if (loading) {
    return (
      <Card className="card-shadow">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-accent"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Custom Document Types</span>
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mobile-tap">
                <Plus className="h-4 w-4 mr-2" />
                Add Type
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle>Add Custom Document Type</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Type Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Birth Certificate, Marriage License"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {documentIcons.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant={formData.icon === icon ? 'default' : 'outline'}
                        className="w-12 h-12 p-0"
                        onClick={() => setFormData({ ...formData, icon })}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Add Type
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {customTypes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No custom document types created yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{type.icon}</span>
                      <span className="font-medium">{type.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {type.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(type.id)}
                      className="mobile-tap text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomDocumentTypes;
