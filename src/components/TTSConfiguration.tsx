
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Play, Volume2 } from 'lucide-react';

interface TTSSettings {
  voice: string;
  speed: number;
  enableSSML: boolean;
  sampleSSML: string;
}

const TTSConfiguration = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<TTSSettings>({
    voice: 'nova',
    speed: 1.0,
    enableSSML: false,
    sampleSSML: '<speak>Hello! <break time="0.5s"/> I am Laura, your speech therapy assistant. <emphasis level="strong">Let\'s have fun learning together!</emphasis></speak>'
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const voices = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'echo', label: 'Echo (Male)' },
    { value: 'fable', label: 'Fable (British Male)' },
    { value: 'onyx', label: 'Onyx (Deep Male)' },
    { value: 'nova', label: 'Nova (Female, Child-friendly)' },
    { value: 'shimmer', label: 'Shimmer (Soft Female)' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedVoice = localStorage.getItem('ttsVoice') || 'nova';
    const savedSpeed = parseFloat(localStorage.getItem('ttsSpeed') || '1.0');
    const savedSSML = localStorage.getItem('ttsEnableSSML') === 'true';
    const savedSampleSSML = localStorage.getItem('ttsSampleSSML') || settings.sampleSSML;

    setSettings({
      voice: savedVoice,
      speed: savedSpeed,
      enableSSML: savedSSML,
      sampleSSML: savedSampleSSML
    });
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('ttsVoice', settings.voice);
      localStorage.setItem('ttsSpeed', settings.speed.toString());
      localStorage.setItem('ttsEnableSSML', settings.enableSSML.toString());
      localStorage.setItem('ttsSampleSSML', settings.sampleSSML);

      toast({
        title: "Settings Saved",
        description: "TTS configuration has been updated for all users.",
      });
    } catch (error) {
      console.error('Error saving TTS settings:', error);
      toast({
        title: "Error",
        description: "Failed to save TTS settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testVoice = async () => {
    setIsPlaying(true);
    try {
      const testText = settings.enableSSML 
        ? settings.sampleSSML
        : `Hello! I'm Laura speaking with the ${settings.voice} voice at ${settings.speed}x speed. How do I sound?`;

      const { data, error } = await supabase.functions.invoke('openai-tts', {
        body: { 
          text: testText,
          voice: settings.voice,
          speed: settings.speed
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        // Convert base64 to blob and play
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error testing voice:', error);
      toast({
        title: "Error",
        description: "Failed to test voice. Please try again.",
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Text-to-Speech Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-2">
          <Label htmlFor="voice-select">Voice Selection</Label>
          <Select 
            value={settings.voice} 
            onValueChange={(value) => setSettings(prev => ({ ...prev, voice: value }))}
          >
            <SelectTrigger id="voice-select">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.value} value={voice.value}>
                  {voice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speech Speed */}
        <div className="space-y-3">
          <Label>Speech Speed: {settings.speed}x</Label>
          <Slider
            value={[settings.speed]}
            onValueChange={(value) => setSettings(prev => ({ ...prev, speed: value[0] }))}
            min={0.25}
            max={4.0}
            step={0.25}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.25x (Very Slow)</span>
            <span>1.0x (Normal)</span>
            <span>4.0x (Very Fast)</span>
          </div>
        </div>

        {/* SSML Support */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-ssml"
              checked={settings.enableSSML}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableSSML: checked }))}
            />
            <Label htmlFor="enable-ssml">Enable SSML (Speech Synthesis Markup Language)</Label>
          </div>
          
          {settings.enableSSML && (
            <div className="space-y-2">
              <Label htmlFor="ssml-sample">SSML Sample Text</Label>
              <Textarea
                id="ssml-sample"
                value={settings.sampleSSML}
                onChange={(e) => setSettings(prev => ({ ...prev, sampleSSML: e.target.value }))}
                placeholder="Enter SSML markup for testing..."
                rows={4}
              />
              <p className="text-xs text-gray-600">
                Use SSML tags like &lt;break time="1s"/&gt;, &lt;emphasis&gt;, &lt;prosody rate="slow"&gt; etc.
              </p>
            </div>
          )}
        </div>

        {/* Test and Save Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={testVoice}
            disabled={isPlaying}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isPlaying ? 'Playing...' : 'Test Voice'}
          </Button>
          
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Note:</strong> These settings will apply to all users in the chat interface. 
          Changes take effect immediately for new conversations.
        </div>
      </CardContent>
    </Card>
  );
};

export default TTSConfiguration;
