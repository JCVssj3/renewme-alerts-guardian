
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Entity } from '@/types';
import { SupabaseStorageService } from '@/services/supabaseStorageService';

const EntityManagement: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    icon: '👤',
    color: '#3B82F6'
  });

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'
  ];

  const icons = ['👤', '👥', '🏢', '👨‍👩‍👧‍👦', '🚗', '🏠', '💼', '🎓', '⚕️', '🏛️'];

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      setLoading(true);
      console.log('Loading entities...');
      const loadedEntities = await SupabaseStorageService.getEntities();
      console.log('Entities loaded:', loadedEntities);
      setEntities(loadedEntities);
    } catch (error) {
      console.error('Error loading entities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    try {
      if (editingEntity) {
        await SupabaseStorageService.updateEntity(editingEntity.id, formData);
      } else {
        await SupabaseStorageService.addEntity({
          id: `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...formData
        });
      }
      resetForm();
      loadEntities();
    } catch (error) {
      console.error('Error saving entity:', error);
    }
  };

  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity);
    setFormData({
      name: entity.name,
      tag: entity.tag || '',
      icon: entity.icon || '👤',
      color: entity.color
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (entityId: string) => {
    if (entityId === 'self') {
      alert('Cannot delete the default "Myself" entity');
      return;
    }
    if (confirm('Are you sure you want to delete this entity?')) {
      try {
        await SupabaseStorageService.deleteEntity(entityId);
        loadEntities();
      } catch (error) {
        console.error('Error deleting entity:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tag: '',
      icon: '👤',
      color: '#3B82F6'
    });
    setEditingEntity(null);
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
            <Users className="h-5 w-5" />
            <span>Entity Management</span>
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEntity(null)} className="mobile-tap">
                <Plus className="h-4 w-4 mr-2" />
                Add Entity
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-800 max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingEntity ? 'Edit Entity' : 'Add New Entity'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., John, Company, Family"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tag">Tag/Role</Label>
                  <Input
                    id="tag"
                    value={formData.tag}
                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g., Personal, Spouse, Business"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {icons.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant={formData.icon === icon ? 'default' : 'outline'}
                        className="w-full h-10 p-0 text-lg"
                        onClick={() => setFormData({ ...formData, icon })}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-full h-10 rounded border-2 ${
                          formData.color === color ? 'border-gray-400 ring-2 ring-gray-300' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingEntity ? 'Update' : 'Add'} Entity
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
        {entities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No entities created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entities.map((entity) => (
              <div key={entity.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0"
                    style={{ backgroundColor: entity.color }}
                  >
                    {entity.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 dark:text-white truncate">{entity.name}</div>
                    {entity.tag && (
                      <Badge variant="secondary" className="mt-1 text-xs">{entity.tag}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(entity)}
                    className="mobile-tap p-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  {entity.id !== 'self' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(entity.id)}
                      className="mobile-tap text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EntityManagement;
