
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, RotateCcw, Save, Eye, Loader2, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PromptSettings {
  basePrompt: string;
  activityPrompts: {
    first_words: string;
    question_time: string;
    build_sentence: string;
    lets_chat: string;
    default: string;
  };
}

interface StoredPrompt {
  id: string;
  prompt_type: string;
  content: string;
  version: number;
}

const PromptConfiguration = () => {
  const { toast } = useToast();
  const [isSaving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [originalPrompts, setOriginalPrompts] = useState<StoredPrompt[]>([]);
  const [settings, setSettings] = useState<PromptSettings>({
    basePrompt: '',
    activityPrompts: {
      first_words: '',
      question_time: '',
      build_sentence: '',
      lets_chat: '',
      default: ''
    }
  });

  const activityLabels = {
    first_words: 'First Words',
    question_time: 'Question Time',
    build_sentence: 'Build a Sentence',
    lets_chat: 'Lets Chat',
    default: 'General Practice'
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all active prompt configurations from Supabase
      const { data: prompts, error } = await supabase
        .from('prompt_configurations')
        .select('id, prompt_type, content, version')
        .eq('is_active', true);

      if (error) {
        console.error('Error loading prompts:', error);
        toast({
          title: "Error",
          description: "Failed to load prompt configurations from database.",
          variant: "destructive",
        });
        return;
      }

      if (prompts && prompts.length > 0) {
        // Store original prompts for comparison
        setOriginalPrompts(prompts);

        const newSettings: PromptSettings = {
          basePrompt: '',
          activityPrompts: {
            first_words: '',
            question_time: '',
            build_sentence: '',
            lets_chat: '',
            default: ''
          }
        };

        prompts.forEach(prompt => {
          if (prompt.prompt_type === 'base_prompt') {
            newSettings.basePrompt = prompt.content;
          } else if (prompt.prompt_type in newSettings.activityPrompts) {
            newSettings.activityPrompts[prompt.prompt_type as keyof typeof newSettings.activityPrompts] = prompt.content;
          }
        });

        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error loading prompt settings:', error);
      toast({
        title: "Error",
        description: "Failed to load prompt settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getChangedPrompts = () => {
    const currentPrompts = [
      { prompt_type: 'base_prompt', content: settings.basePrompt },
      ...Object.entries(settings.activityPrompts).map(([type, content]) => ({
        prompt_type: type,
        content
      }))
    ];

    const changedPrompts = currentPrompts.filter(current => {
      const original = originalPrompts.find(orig => orig.prompt_type === current.prompt_type);
      return !original || original.content !== current.content;
    });

    return changedPrompts;
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const changedPrompts = getChangedPrompts();
      
      if (changedPrompts.length === 0) {
        toast({
          title: "No Changes",
          description: "No prompt changes detected.",
        });
        setSaving(false);
        return;
      }

      console.log(`Updating ${changedPrompts.length} changed prompts:`, changedPrompts.map(p => p.prompt_type));

      // Process each changed prompt
      for (const changedPrompt of changedPrompts) {
        const originalPrompt = originalPrompts.find(orig => orig.prompt_type === changedPrompt.prompt_type);
        
        if (originalPrompt) {
          // Move existing prompt to history
          const { error: historyError } = await supabase
            .from('prompt_history')
            .insert({
              original_prompt_id: originalPrompt.id,
              prompt_type: originalPrompt.prompt_type,
              content: originalPrompt.content,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              archived_by: (await supabase.auth.getUser()).data.user?.id
            });

          if (historyError) {
            console.error('Error archiving prompt:', historyError);
            throw historyError;
          }

          // Update existing prompt with new content and increment version
          const { error: updateError } = await supabase
            .from('prompt_configurations')
            .update({
              content: changedPrompt.content,
              version: originalPrompt.version + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', originalPrompt.id);

          if (updateError) {
            console.error('Error updating prompt:', updateError);
            throw updateError;
          }
        } else {
          // Insert new prompt if it doesn't exist
          const { error: insertError } = await supabase
            .from('prompt_configurations')
            .insert({
              prompt_type: changedPrompt.prompt_type,
              content: changedPrompt.content,
              is_active: true,
              version: 1
            });

          if (insertError) {
            console.error('Error inserting new prompt:', insertError);
            throw insertError;
          }
        }
      }

      // Reload settings to get updated data
      await loadSettings();

      toast({
        title: "Prompts Updated",
        description: `Successfully updated ${changedPrompts.length} prompt(s). Previous versions archived to history.`,
      });
    } catch (error) {
      console.error('Error saving prompt settings:', error);
      toast({
        title: "Error",
        description: "Failed to save prompt settings to database.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      // Load default prompts from database (the ones inserted during migration)
      const { data: defaultPrompts, error } = await supabase
        .from('prompt_configurations')
        .select('prompt_type, content')
        .order('created_at', { ascending: true })
        .limit(6); // Get the original 6 default prompts

      if (error) {
        throw error;
      }

      if (defaultPrompts && defaultPrompts.length > 0) {
        // Archive current active prompts and replace with defaults
        const currentActivePrompts = originalPrompts;
        
        for (const currentPrompt of currentActivePrompts) {
          // Move to history
          const { error: historyError } = await supabase
            .from('prompt_history')
            .insert({
              original_prompt_id: currentPrompt.id,
              prompt_type: currentPrompt.prompt_type,
              content: currentPrompt.content,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              archived_by: (await supabase.auth.getUser()).data.user?.id
            });

          if (historyError) {
            throw historyError;
          }

          // Update with default content
          const defaultPrompt = defaultPrompts.find(def => def.prompt_type === currentPrompt.prompt_type);
          if (defaultPrompt) {
            const { error: updateError } = await supabase
              .from('prompt_configurations')
              .update({
                content: defaultPrompt.content,
                version: currentPrompt.version + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', currentPrompt.id);

            if (updateError) {
              throw updateError;
            }
          }
        }

        // Reload settings
        await loadSettings();

        toast({
          title: "Prompts Reset",
          description: "All prompts have been reset to default values. Previous versions archived.",
        });
      }
    } catch (error) {
      console.error('Error resetting prompts:', error);
      toast({
        title: "Error",
        description: "Failed to reset prompts to defaults.",
        variant: "destructive",
      });
    }
  };

  const getPreview = (activityType?: string) => {
    let preview = settings.basePrompt;
    
    if (activityType && settings.activityPrompts[activityType as keyof typeof settings.activityPrompts]) {
      preview += settings.activityPrompts[activityType as keyof typeof settings.activityPrompts];
    } else {
      preview += settings.activityPrompts.default;
    }
    
    return preview;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Prompt Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading prompt configurations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const changedPrompts = getChangedPrompts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Prompt Configuration
          {changedPrompts.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2">
              {changedPrompts.length} unsaved changes
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="base" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="base">Base Prompt</TabsTrigger>
            <TabsTrigger value="activities">Activity Prompts</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="base" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="base-prompt">Base Therapeutic Prompt</Label>
              <Textarea
                id="base-prompt"
                value={settings.basePrompt}
                onChange={(e) => setSettings(prev => ({ ...prev, basePrompt: e.target.value }))}
                placeholder="Enter the core instructions for Laura's behavior..."
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-600">
                This is the core prompt that defines Laura's personality and general approach to therapy.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="activities" className="space-y-4">
            <div className="space-y-6">
              {Object.entries(settings.activityPrompts).map(([key, prompt]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`activity-${key}`}>
                    {activityLabels[key as keyof typeof activityLabels]} Activity
                  </Label>
                  <Textarea
                    id={`activity-${key}`}
                    value={prompt}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      activityPrompts: {
                        ...prev.activityPrompts,
                        [key]: e.target.value
                      }
                    }))}
                    placeholder={`Enter specific instructions for ${activityLabels[key as keyof typeof activityLabels]} activities...`}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Label>Preview Combined Prompt:</Label>
                <select 
                  className="px-3 py-1 border rounded"
                  onChange={(e) => setShowPreview(true)}
                >
                  <option value="">Select Activity Type</option>
                  {Object.entries(activityLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {getPreview('default')}
                </pre>
              </div>
              
              <p className="text-xs text-gray-600">
                This shows how the final prompt will appear when sent to the AI. The base prompt is combined with the selected activity prompt.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={saveSettings}
            disabled={isSaving || changedPrompts.length === 0}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : `Save Changes${changedPrompts.length > 0 ? ` (${changedPrompts.length})` : ''}`}
          </Button>
          
          <Button
            onClick={resetToDefaults}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Smart Updates:</strong> Only changed prompts will be updated. Previous versions are automatically archived to the history table with version tracking. 
          The system now tracks changes intelligently and maintains a complete audit trail.
        </div>

        {changedPrompts.length > 0 && (
          <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <strong>Pending Changes:</strong> You have {changedPrompts.length} unsaved prompt change(s): {changedPrompts.map(p => p.prompt_type).join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PromptConfiguration;
