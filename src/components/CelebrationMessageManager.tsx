import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type CelebrationMessage = Database['public']['Tables']['celebration_messages']['Row'];

const CelebrationMessageManager = () => {
  const [messages, setMessages] = useState<CelebrationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    message_type: 'tts_audio' as const,
    therapist_name: 'Laura',
    message_category: 'correct_answer' as const,
    progress_level: 1,
    content: '',
    is_active: true,
    priority: 1
  });

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('celebration_messages')
        .select('*')
        .order('therapist_name', { ascending: true })
        .order('message_type', { ascending: true })
        .order('progress_level', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load celebration messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        // Update existing message
        const { error } = await supabase
          .from('celebration_messages')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Success', description: 'Message updated successfully' });
      } else {
        // Add new message
        const { error } = await supabase
          .from('celebration_messages')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Message added successfully' });
      }

      setEditingId(null);
      setShowAddForm(false);
      resetForm();
      loadMessages();
    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: 'Error',
        description: 'Failed to save message',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (message: CelebrationMessage) => {
    setEditingId(message.id);
    setFormData({
      message_type: message.message_type as any,
      therapist_name: message.therapist_name,
      message_category: message.message_category as any,
      progress_level: message.progress_level,
      content: message.content,
      is_active: message.is_active,
      priority: message.priority
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('celebration_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Message deleted successfully' });
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      message_type: 'tts_audio',
      therapist_name: 'Laura',
      message_category: 'correct_answer',
      progress_level: 1,
      content: '',
      is_active: true,
      priority: 1
    });
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'tts_audio': return 'bg-blue-100 text-blue-800';
      case 'question_feedback': return 'bg-green-100 text-green-800';
      case 'celebration_visual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTherapistColor = (therapist: string) => {
    switch (therapist) {
      case 'Laura': return 'bg-pink-100 text-pink-800';
      case 'Lawrence': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading celebration messages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Celebration Messages</h2>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Message
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Message' : 'Add New Message'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Message Type</Label>
                <Select
                  value={formData.message_type}
                  onValueChange={(value) => setFormData({ ...formData, message_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tts_audio">TTS Audio</SelectItem>
                    <SelectItem value="question_feedback">Question Feedback</SelectItem>
                    <SelectItem value="celebration_visual">Celebration Visual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Therapist</Label>
                <Select
                  value={formData.therapist_name}
                  onValueChange={(value) => setFormData({ ...formData, therapist_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laura">Laura</SelectItem>
                    <SelectItem value="Lawrence">Lawrence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={formData.message_category}
                  onValueChange={(value) => setFormData({ ...formData, message_category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="correct_answer">Correct Answer</SelectItem>
                    <SelectItem value="retry_encouragement">Retry Encouragement</SelectItem>
                    <SelectItem value="session_complete">Session Complete</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Progress Level</Label>
                <Select
                  value={formData.progress_level.toString()}
                  onValueChange={(value) => setFormData({ ...formData, progress_level: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 (1st correct)</SelectItem>
                    <SelectItem value="2">Level 2 (2nd correct)</SelectItem>
                    <SelectItem value="3">Level 3 (3rd correct)</SelectItem>
                    <SelectItem value="4">Level 4 (4th correct)</SelectItem>
                    <SelectItem value="5">Level 5 (5th correct)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <div>
              <Label>Message Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter message content. Use {child_name} for personalization."
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {'{child_name}'} to include the child's name in the message.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingId ? 'Update' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages List */}
      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id} className={editingId === message.id ? 'ring-2 ring-blue-500' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getMessageTypeColor(message.message_type)}>
                      {message.message_type}
                    </Badge>
                    <Badge className={getTherapistColor(message.therapist_name)}>
                      {message.therapist_name}
                    </Badge>
                    <Badge variant="outline">
                      Level {message.progress_level}
                    </Badge>
                    <Badge variant="outline">
                      Priority {message.priority}
                    </Badge>
                    {!message.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{message.message_category}</p>
                  <p className="text-sm text-gray-600">{message.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(message)}
                    disabled={editingId !== null}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(message.id)}
                    disabled={editingId !== null}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No celebration messages found. Add your first message above.
        </div>
      )}
    </div>
  );
};

export default CelebrationMessageManager; 