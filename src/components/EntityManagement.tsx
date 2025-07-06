import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Entity } from '@/types';
import { EntityService } from '@/services/entityService';

interface EntityManagementProps {
  onBack: () => void;
}

const EntityManagement: React.FC<EntityManagementProps> = ({ onBack }) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
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

  const loadEntities = () => {
    const loadedEntities = EntityService.getEntities();
    setEntities(loadedEntities);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    if (editingEntity) {
      EntityService.updateEntity(editingEntity.id, formData);
    } else {
      EntityService.addEntity(formData);
    }

    resetForm();
    loadEntities();
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

  const handleDelete = (entityId: string) => {
    if (entityId === 'self') {
      alert('Cannot delete the default "Self" entity');
      return;
    }
    if (confirm('Are you sure you want to delete this entity?')) {
      EntityService.deleteEntity(entityId);
      loadEntities();
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
            <DialogContent className="bg-white dark:bg-gray-800">
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
                  <div className="flex flex-wrap gap-2">
                    {icons.map((icon) => (
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

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-400' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity</TableHead>
              <TableHead>Tag/Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.map((entity) => (
              <TableRow key={entity.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: entity.color }}
                    >
                      {entity.icon}
                    </div>
                    <span className="font-medium">{entity.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {entity.tag && (
                    <Badge variant="secondary">{entity.tag}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(entity)}
                      className="mobile-tap"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    {entity.id !== 'self' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(entity.id)}
                        className="mobile-tap text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EntityManagement;
