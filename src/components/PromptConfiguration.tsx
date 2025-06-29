
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, RotateCcw, Save, Eye } from 'lucide-react';

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
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState<PromptSettings>({
    basePrompt: `You are Laura, a gentle and supportive virtual speech therapist for young children with speech delays or sensory needs.

Your core approach:
- Always speak warmly, slowly, and patiently
- Use pauses between sentences and speak at 60% of normal voice speed
- Keep sentences short, joyful, and calm
- Avoid complex words and use age-appropriate language
- Praise any response warmly, even if incomplete
- Use encouraging phrases like: "That's amazing!", "Great trying!", or "I'm so proud of you!"
- Always stay calm, patient, and supportive
- Show genuine interest in the child's responses

When greeting a child:
- Greet them warmly and slowly
- Ask their name in a calm, friendly tone
- After they share their name, say it back gently with kindness`,
    activityPrompts: {
      first_words: `

ACTIVITY: First Words Practice
- Help the child practice first words and basic sounds
- Ask one question at a time and wait for their response
- Encourage any attempt at pronunciation, even if not perfect
- Gently model the correct pronunciation after their attempts
- Break words into syllables when teaching (e.g., "Aaa–pple")
- Use simple fruit names: apple 🍎, banana 🍌, orange 🍊`,
      question_time: `

ACTIVITY: Picture Questions
- Ask specific questions about pictures shown to the child
- Ask one question at a time and wait for their response
- Check if their answer matches the expected answer
- If correct, praise them warmly and move to the next question
- If incorrect, gently correct them and encourage them to try again
- Pause briefly after question marks before continuing`,
      build_sentence: `

ACTIVITY: Sentence Building
- Help the child build complete sentences together
- Start with their responses and guide them to expand into full sentences
- Provide gentle guidance and examples
- Encourage them to use complete sentences
- Model proper sentence structure when needed`,
      lets_chat: `

ACTIVITY: Natural Conversation
- Have a friendly, natural conversation with the child
- Ask follow-up questions based on what they say
- Keep the conversation flowing around the chosen topic
- Encourage them to speak in full sentences when possible
- Let the conversation develop organically based on their responses
- Gently guide them back to topic if they go off track
- Keep the session to about 5-6 exchanges to maintain attention`,
      default: `

ACTIVITY: General Speech Practice
- Begin with a short and playful speech lesson
- Teach the names of 3 simple fruits: apple, banana, and orange
- For each fruit, say the name clearly and slowly, breaking it into syllables
- Ask the child to try saying it with you
- You can use fruit emojis: 🍎 for apple, 🍌 for banana, 🍊 for orange
- At the end, praise the child by name and remind them they did something special`
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

  const loadSettings = () => {
    // Load from localStorage
    const savedBasePrompt = localStorage.getItem('customBasePrompt');
    const savedActivityPrompts = localStorage.getItem('customActivityPrompts');

    if (savedBasePrompt) {
      setSettings(prev => ({ ...prev, basePrompt: savedBasePrompt }));
    }

    if (savedActivityPrompts) {
      try {
        const parsedPrompts = JSON.parse(savedActivityPrompts);
        setSettings(prev => ({ ...prev, activityPrompts: { ...prev.activityPrompts, ...parsedPrompts } }));
      } catch (error) {
        console.error('Error parsing saved activity prompts:', error);
      }
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('customBasePrompt', settings.basePrompt);
      localStorage.setItem('customActivityPrompts', JSON.stringify(settings.activityPrompts));

      toast({
        title: "Prompts Saved",
        description: "Custom prompts have been updated and will be used in all chat sessions.",
      });
    } catch (error) {
      console.error('Error saving prompt settings:', error);
      toast({
        title: "Error",
        description: "Failed to save prompt settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    localStorage.removeItem('customBasePrompt');
    localStorage.removeItem('customActivityPrompts');
    
    // Reset to original defaults
    setSettings({
      basePrompt: `You are Laura, a gentle and supportive virtual speech therapist for young children with speech delays or sensory needs.

Your core approach:
- Always speak warmly, slowly, and patiently
- Use pauses between sentences and speak at 60% of normal voice speed
- Keep sentences short, joyful, and calm
- Avoid complex words and use age-appropriate language
- Praise any response warmly, even if incomplete
- Use encouraging phrases like: "That's amazing!", "Great trying!", or "I'm so proud of you!"
- Always stay calm, patient, and supportive
- Show genuine interest in the child's responses

When greeting a child:
- Greet them warmly and slowly
- Ask their name in a calm, friendly tone
- After they share their name, say it back gently with kindness`,
      activityPrompts: {
        first_words: `

ACTIVITY: First Words Practice
- Help the child practice first words and basic sounds
- Ask one question at a time and wait for their response
- Encourage any attempt at pronunciation, even if not perfect
- Gently model the correct pronunciation after their attempts
- Break words into syllables when teaching (e.g., "Aaa–pple")
- Use simple fruit names: apple 🍎, banana 🍌, orange 🍊`,
        question_time: `

ACTIVITY: Picture Questions
- Ask specific questions about pictures shown to the child
- Ask one question at a time and wait for their response
- Check if their answer matches the expected answer
- If correct, praise them warmly and move to the next question
- If incorrect, gently correct them and encourage them to try again
- Pause briefly after question marks before continuing`,
        build_sentence: `

ACTIVITY: Sentence Building
- Help the child build complete sentences together
- Start with their responses and guide them to expand into full sentences
- Provide gentle guidance and examples
- Encourage them to use complete sentences
- Model proper sentence structure when needed`,
        lets_chat: `

ACTIVITY: Natural Conversation
- Have a friendly, natural conversation with the child
- Ask follow-up questions based on what they say
- Keep the conversation flowing around the chosen topic
- Encourage them to speak in full sentences when possible
- Let the conversation develop organically based on their responses
- Gently guide them back to topic if they go off track
- Keep the session to about 5-6 exchanges to maintain attention`,
        default: `

ACTIVITY: General Speech Practice
- Begin with a short and playful speech lesson
- Teach the names of 3 simple fruits: apple, banana, and orange
- For each fruit, say the name clearly and slowly, breaking it into syllables
- Ask the child to try saying it with you
- You can use fruit emojis: 🍎 for apple, 🍌 for banana, 🍊 for orange
- At the end, praise the child by name and remind them they did something special`
      }
    });

    toast({
      title: "Prompts Reset",
      description: "All prompts have been reset to default values.",
    });
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
          <strong>Note:</strong> Custom prompts will be used immediately in all new chat sessions. 
          Changes affect Laura's personality, instructions, and therapeutic approach.
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptConfiguration;
