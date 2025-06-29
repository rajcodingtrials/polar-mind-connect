
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, RotateCcw, Save, Eye, Loader2 } from 'lucide-react';
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

const PromptConfiguration = () => {
  const { toast } = useToast();
  const [isSaving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
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
        .select('prompt_type, content')
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

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Prepare all prompts for upsert
      const promptsToSave = [
        { prompt_type: 'base_prompt', content: settings.basePrompt },
        ...Object.entries(settings.activityPrompts).map(([type, content]) => ({
          prompt_type: type,
          content
        }))
      ];

      // First, deactivate existing prompts
      const { error: deactivateError } = await supabase
        .from('prompt_configurations')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) {
        throw deactivateError;
      }

      // Insert new active prompts
      const { error: insertError } = await supabase
        .from('prompt_configurations')
        .insert(promptsToSave.map(prompt => ({
          ...prompt,
          is_active: true
        })));

      if (insertError) {
        throw insertError;
      }

      toast({
        title: "Prompts Saved",
        description: "Custom prompts have been saved to the database and will be used in all chat sessions.",
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
        // Deactivate current prompts
        const { error: deactivateError } = await supabase
          .from('prompt_configurations')
          .update({ is_active: false })
          .eq('is_active', true);

        if (deactivateError) {
          throw deactivateError;
        }

        // Insert default prompts as new active prompts
        const { error: insertError } = await supabase
          .from('prompt_configurations')
          .insert(defaultPrompts.map(prompt => ({
            prompt_type: prompt.prompt_type,
            content: prompt.content,
            is_active: true
          })));

        if (insertError) {
          throw insertError;
        }

        // Reload settings
        await loadSettings();

        toast({
          title: "Prompts Reset",
          description: "All prompts have been reset to default values.",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Prompt Configuration
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
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Prompts'}
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
          <strong>Note:</strong> Prompts are now stored in the database and will be used immediately in all new chat sessions. 
          Changes affect Laura's personality, instructions, and therapeutic approach across all users.
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptConfiguration;
