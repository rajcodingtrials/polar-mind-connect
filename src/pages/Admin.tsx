
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import QuestionUpload from '../components/QuestionUpload';
import TTSConfiguration from '../components/TTSConfiguration';
import GoogleTTSConfiguration from '../components/GoogleTTSConfiguration';
import PromptConfiguration from '../components/PromptConfiguration';
import CelebrationMessageManager from '../components/CelebrationMessageManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@radix-ui/react-slider';
import { useUserRole } from '../hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { ChevronDown, ChevronRight } from 'lucide-react';

type QuestionType = Database['public']['Enums']['question_type_enum'];

interface Question {
  id: string;
  question: string;
  answer: string;
  imageName?: string;
  questionType?: string;
}

const Admin = () => {
  const { role, loading } = useUserRole();
  const [defaultChatMode, setDefaultChatMode] = useState('free');
  const { toast } = useToast();

  // Admin settings state
  const [adminSettings, setAdminSettings] = useState<Database['public']['Tables']['admin_settings']['Row'] | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Fetch admin settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setSettingsLoading(true);
      setSettingsError(null);
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .limit(1)
          .single();
        if (error) throw error;
        setAdminSettings(data);
      } catch (err: any) {
        setSettingsError('Failed to load admin settings');
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Update admin settings in Supabase
  const updateSetting = async (key: string, value: boolean | number) => {
    if (!adminSettings) return;
    setSettingsSaving(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .update({ [key]: value })
        .eq('id', adminSettings.id)
        .select()
        .single();
      if (error) throw error;
      setAdminSettings(data);
      toast({ title: 'Admin setting updated', description: `${key.replace('_', ' ')} set to ${value}` });
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to update admin setting', variant: 'destructive' });
    } finally {
      setSettingsSaving(false);
    }
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('defaultChatMode');
    if (savedMode) {
      setDefaultChatMode(savedMode);
    }
  }, []);

  const [clearUploadForm, setClearUploadForm] = useState(false);
  const [showCelebrationBlock, setShowCelebrationBlock] = useState(false);
  const [resendEmail, setResendEmail] = useState('pree.nair86@gmail.com');
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleQuestionsUploaded = async (questions: Question[], images: File[], questionType: string) => {
    try {
      // First, upload images to Supabase storage
      const imageUploadPromises = images.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('question-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw uploadError;
        }

        return { originalName: file.name, storageName: fileName };
      });

      const uploadedImages = await Promise.all(imageUploadPromises);
      
      // Create a mapping from original names to storage names
      const imageNameMap = uploadedImages.reduce((acc, img) => {
        acc[img.originalName] = img.storageName;
        return acc;
      }, {} as Record<string, string>);

      // Then, save questions to database with updated image names and question type
      const questionsToInsert = questions.map(q => ({
        question: q.question,
        answer: q.answer,
        image_name: q.imageName ? imageNameMap[q.imageName] : null,
        question_type: questionType as QuestionType // Always use the selected question type
      }));

      console.log('Inserting questions with type:', questionType);
      console.log('Questions to insert:', questionsToInsert.map(q => ({ question: q.question, type: q.question_type })));

      const { error: dbError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (dbError) {
        console.error('Error saving questions:', dbError);
        throw dbError;
      }

      toast({
        title: "Success",
        description: `Uploaded ${questions.length} questions and ${images.length} images to Supabase`,
      });

      console.log('Successfully uploaded to Supabase:', questions.length, 'questions,', images.length, 'images');
      // Trigger clearing the upload form
      setClearUploadForm(true);
      setTimeout(() => setClearUploadForm(false), 100); // Reset trigger
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      toast({
        title: "Error",
        description: "Failed to upload questions and images to Supabase",
        variant: "destructive",
      });
    }
  };

  const handleDefaultModeChange = (isStructured: boolean) => {
    const mode = isStructured ? 'structured' : 'free';
    setDefaultChatMode(mode);
    localStorage.setItem('defaultChatMode', mode);
    console.log('Default chat mode changed to:', mode);
  };

  const handleResendVerification = async () => {
    if (!resendEmail || !resendEmail.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setResendingEmail(true);
    try {
      // Call the edge function directly with mock data to test custom template
      const { data, error } = await supabase.functions.invoke('send-email-verification', {
        body: {
          user: { email: resendEmail },
          email_data: {
            token: 'test-token-123456',
            token_hash: 'test-hash-' + Math.random().toString(36).substring(7),
            redirect_to: window.location.origin,
            email_action_type: 'signup',
            site_url: 'https://gsnsjrfudxyczpldbkzc.supabase.co/auth/v1'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Test email sent",
        description: `A test verification email with your custom template has been sent to ${resendEmail}`,
      });
    } catch (error: any) {
      console.error('Email send error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  const clearStoredData = async () => {
    try {
      // Clear questions from database
      const { error: dbError } = await supabase
        .from('questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

      if (dbError) {
        console.error('Error clearing questions:', dbError);
      }

      // Clear images from storage
      const { data: files } = await supabase.storage
        .from('question-images')
        .list();

      if (files && files.length > 0) {
        const filePaths = files.map(file => file.name);
        const { error: storageError } = await supabase.storage
          .from('question-images')
          .remove(filePaths);

        if (storageError) {
          console.error('Error clearing images:', storageError);
        }
      }

      // Clear localStorage
      localStorage.removeItem('adminQuestions');
      localStorage.removeItem('adminImages');
      localStorage.removeItem('defaultChatMode');
      setDefaultChatMode('free');
      
      toast({
        title: "Success",
        description: "Cleared all stored data from Supabase and localStorage",
      });

      console.log('Cleared all stored data from Supabase and localStorage');
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: "Failed to clear some data",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </main>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                You don't have permission to access this page.
              </p>
              <p className="text-center text-sm text-gray-500 mt-2">
                Your role: {role || 'No role assigned'}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage questions, images, prompts, TTS settings, and chat configuration</p>
          </div>

          {/* Admin Toggles */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border flex flex-col gap-6">
            <h2 className="text-xl font-bold mb-2">Admin Feature Toggles</h2>
            {settingsLoading ? (
              <div className="text-blue-600">Loading admin settings...</div>
            ) : settingsError ? (
              <div className="text-red-600">{settingsError}</div>
            ) : adminSettings && (
              <>
                <div className="flex items-center gap-4">
                  <Switch
                    id="skip-intro-toggle"
                    checked={adminSettings.skip_introduction}
                    onCheckedChange={v => updateSetting('skip_introduction', v)}
                    disabled={settingsSaving}
                  />
                  <Label htmlFor="skip-intro-toggle" className="text-base">Skip Introduction (Testing Only)</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    id="show-mic-toggle"
                    checked={adminSettings.show_mic_input}
                    onCheckedChange={v => updateSetting('show_mic_input', v)}
                    disabled={settingsSaving}
                  />
                  <Label htmlFor="show-mic-toggle" className="text-base">Show Mic Input on Question Screen</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    id="amplify-mic-toggle"
                    checked={!!adminSettings.amplify_mic}
                    onCheckedChange={v => updateSetting('amplify_mic', v)}
                    disabled={settingsSaving}
                  />
                  <Label htmlFor="amplify-mic-toggle" className="text-base">Amplify Microphone Input</Label>
                </div>
                <div className="flex items-center gap-4 pl-8">
                  <Label htmlFor="mic-gain-slider" className="text-base">Microphone Gain</Label>
                  <input
                    id="mic-gain-slider"
                    type="range"
                    min={1}
                    max={5}
                    step={0.1}
                    value={adminSettings.mic_gain ?? 1.0}
                    onChange={e => updateSetting('mic_gain', parseFloat(e.target.value))}
                    disabled={!adminSettings.amplify_mic || settingsSaving}
                    style={{ width: 200 }}
                  />
                  <span className="ml-2 text-blue-700 font-mono">{(adminSettings.mic_gain ?? 1.0).toFixed(1)}x</span>
                </div>
              </>
            )}
          </div>

          {/* Email Verification Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Verification Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend-email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="resend-email"
                    type="email"
                    placeholder="user@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                  />
                  <Button 
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                  >
                    {resendingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Test your custom email template by sending a sample verification email
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Note: This sends a test email with a dummy verification link
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Chat Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="default-mode">Default Chat Mode</Label>
                  <p className="text-sm text-gray-600">
                    Choose whether new chats start in structured Q&A mode or free chat mode
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="default-mode" className="text-sm">Free Chat</Label>
                  <Switch
                    id="default-mode"
                    checked={defaultChatMode === 'structured'}
                    onCheckedChange={handleDefaultModeChange}
                  />
                  <Label htmlFor="default-mode" className="text-sm">Q&A Mode</Label>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={clearStoredData}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Clear All Stored Data
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  This will remove all uploaded questions and images from Supabase
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Configuration */}
          <PromptConfiguration />

          {/* OpenAI TTS Configuration */}
          <TTSConfiguration />

          {/* Google TTS Configuration */}
          <GoogleTTSConfiguration />

          {/* Celebration Messages Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer select-none" onClick={() => setShowCelebrationBlock(v => !v)}>
              <div className="flex items-center gap-2">
                {showCelebrationBlock ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                <CardTitle>Celebration Messages</CardTitle>
              </div>
            </CardHeader>
            {showCelebrationBlock && (
              <CardContent>
                <CelebrationMessageManager />
              </CardContent>
            )}
          </Card>

          {/* Upload Section */}
          <QuestionUpload onQuestionsUploaded={handleQuestionsUploaded} clearTrigger={clearUploadForm} />
        </div>
      </main>
    </div>
  );
};

export default Admin;
