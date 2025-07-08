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
import { Play, Volume2, Globe } from 'lucide-react';
import { stopAllAudio, playGlobalTTS, stopGlobalAudio } from '@/utils/audioUtils';

interface GoogleTTSSettings {
  voice: string;
  speed: number;
  pitch: number;
  enableSSML: boolean;
  sampleSSML: string;
  therapistName: string;
  provider: 'google';
}

const GoogleTTSConfiguration = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<GoogleTTSSettings>({
    voice: 'en-US-Neural2-J',
    speed: 1.0,
    pitch: 0.0,
    enableSSML: false,
    sampleSSML: '<speak>Hello! <break time="0.5s"/> I am Laura, your speech therapy assistant. <emphasis level="strong">Let\'s have fun learning together!</emphasis></speak>',
    therapistName: 'Laura',
    provider: 'google'
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTherapists, setAvailableTherapists] = useState<string[]>(['Laura', 'Lawrence']);

  // Expanded Google TTS voices with therapy-specific descriptions
  const googleVoices = [
    {
      category: "🎯 Kid-Friendly US English",
      voices: [
        {
          value: 'en-US-Neural2-J',
          label: 'en-US-Neural2-J (HD neural)',
          gender: 'Female',
          description: 'Bright, child-friendly tone, smooth consonants, minimal sibilant hiss'
        },
        {
          value: 'en-US-Neural2-H',
          label: 'en-US-Neural2-H (HD neural)',
          gender: 'Female',
          description: 'Warm, nurturing voice perfect for young children'
        },
        {
          value: 'en-US-Neural2-F',
          label: 'en-US-Neural2-F (HD neural)',
          gender: 'Female',
          description: 'Clear, articulate voice with excellent pronunciation for speech therapy'
        },
        {
          value: 'en-US-Neural2-I',
          label: 'en-US-Neural2-I (HD neural)',
          gender: 'Male',
          description: 'Warm & encouraging; less baritone boom than Wavenet-D'
        },
        {
          value: 'en-US-Neural2-G',
          label: 'en-US-Neural2-G (HD neural)',
          gender: 'Male',
          description: 'Gentle, patient voice ideal for speech therapy'
        }
      ]
    },
    {
      category: "🇺🇸 US English (Standard)",
      voices: [
        {
          value: 'en-US-Wavenet-D',
          label: 'en-US-Wavenet-D',
          gender: 'Male',
          description: 'Classic "neutral newscaster" diction; vowels very even'
        },
        {
          value: 'en-US-Wavenet-F',
          label: 'en-US-Wavenet-F',
          gender: 'Female',
          description: 'Slightly slower cadence, good for early articulation drills'
        },
        {
          value: 'en-US-Wavenet-A',
          label: 'en-US-Wavenet-A',
          gender: 'Male',
          description: 'Clear, authoritative voice with excellent pronunciation'
        },
        {
          value: 'en-US-Wavenet-E',
          label: 'en-US-Wavenet-E',
          gender: 'Female',
          description: 'Soft, melodic voice with gentle articulation'
        }
      ]
    },
    {
      category: "🇬🇧 UK English",
      voices: [
        {
          value: 'en-GB-Wavenet-F',
          label: 'en-GB-Wavenet-F',
          gender: 'Female',
          description: 'Clear British RP, gentle melody—nice contrast for phoneme generalisation'
        },
        {
          value: 'en-GB-Wavenet-B',
          label: 'en-GB-Wavenet-B',
          gender: 'Male',
          description: 'Precise but not stuffy; kids who watch Peppa Pig relate well'
        },
        {
          value: 'en-GB-Neural2-D',
          label: 'en-GB-Neural2-D',
          gender: 'Male',
          description: 'Modern British accent, clear and engaging'
        },
        {
          value: 'en-GB-Neural2-F',
          label: 'en-GB-Neural2-F',
          gender: 'Female',
          description: 'Elegant British voice, perfect for storytelling'
        }
      ]
    },
    {
      category: "🇮🇳 Indian English",
      voices: [
        {
          value: 'en-IN-Wavenet-C',
          label: 'en-IN-Wavenet-C',
          gender: 'Female',
          description: 'Soft Indian accent, crisp stops—useful for bilingual families'
        },
        {
          value: 'en-IN-Wavenet-B',
          label: 'en-IN-Wavenet-B',
          gender: 'Male',
          description: 'Relaxed, mid-pitch male; easy for South-Asian households'
        },
        {
          value: 'en-IN-Wavenet-D',
          label: 'en-IN-Wavenet-D',
          gender: 'Male',
          description: 'Clear Indian English, excellent for pronunciation practice'
        }
      ]
    },
    {
      category: "🇦🇺 Australian English",
      voices: [
        {
          value: 'en-AU-Neural2-C',
          label: 'en-AU-Neural2-C',
          gender: 'Female',
          description: 'Friendly Australian accent, warm and approachable'
        },
        {
          value: 'en-AU-Neural2-D',
          label: 'en-AU-Neural2-D',
          gender: 'Male',
          description: 'Clear Australian voice, great for diverse accents'
        }
      ]
    }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load the TTS settings for the selected therapist
      const { data, error } = await supabase
        .from('tts_settings')
        .select('voice, speed, enable_ssml, sample_ssml, therapist_name, provider')
        .eq('therapist_name', settings.therapistName)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error loading Google TTS settings:', error);
        throw error;
      }

      if (data) {
        setSettings({
          voice: data.voice,
          speed: data.speed,
          pitch: (data as any).pitch || 0.0,
          enableSSML: data.enable_ssml,
          sampleSSML: data.sample_ssml,
          therapistName: data.therapist_name,
          provider: 'google'
        });
      }
    } catch (error) {
      console.error('Error loading Google TTS settings:', error);
      toast({
        title: "Error",
        description: "Failed to load Google TTS settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Check if settings exist for this therapist
      const { data: existingSettings } = await supabase
        .from('tts_settings')
        .select('id')
        .eq('therapist_name', settings.therapistName)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('tts_settings')
          .update({
            voice: settings.voice,
            speed: settings.speed,
            enable_ssml: settings.enableSSML,
            sample_ssml: settings.sampleSSML,
            provider: 'google',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('tts_settings')
          .insert({
            voice: settings.voice,
            speed: settings.speed,
            enable_ssml: settings.enableSSML,
            sample_ssml: settings.sampleSSML,
            provider: 'google',
            therapist_name: settings.therapistName
          });

        if (error) throw error;
      }

      toast({
        title: "Settings Saved",
        description: `Google TTS configuration has been updated for ${settings.therapistName}.`,
      });
    } catch (error) {
      console.error('Error saving Google TTS settings:', error);
      toast({
        title: "Error",
        description: "Failed to save Google TTS settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTherapistChange = async (therapistName: string) => {
    setSettings(prev => ({ ...prev, therapistName }));
          // Load settings for the new therapist
      try {
        const { data, error } = await supabase
          .from('tts_settings')
          .select('voice, speed, enable_ssml, sample_ssml, therapist_name, provider')
          .eq('therapist_name', therapistName)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading Google TTS settings:', error);
          return;
        }

        if (data) {
                  setSettings({
          voice: data.voice,
          speed: data.speed,
          pitch: (data as any).pitch || 0.0,
          enableSSML: data.enable_ssml,
          sampleSSML: data.sample_ssml,
          therapistName: data.therapist_name,
          provider: 'google'
        });
        } else {
        // Set defaults for new therapist
        const defaultVoice = therapistName === 'Lawrence' ? 'en-US-Neural2-I' : 'en-US-Neural2-J';
        const defaultSSML = therapistName === 'Lawrence' 
          ? '<speak>Hello! <break time="0.5s"/> I am Lawrence, your speech therapy assistant. <emphasis level="strong">Let\'s have fun learning together!</emphasis></speak>'
          : '<speak>Hello! <break time="0.5s"/> I am Laura, your speech therapy assistant. <emphasis level="strong">Let\'s have fun learning together!</emphasis></speak>';
        
        setSettings({
          voice: defaultVoice,
          speed: 1.0,
          pitch: 0.0,
          enableSSML: false,
          sampleSSML: defaultSSML,
          therapistName,
          provider: 'google'
        });
      }
    } catch (error) {
      console.error('Error loading therapist settings:', error);
    }
  };

  const testVoice = async () => {
    setIsPlaying(true);
    try {
      const testText = settings.enableSSML 
        ? settings.sampleSSML
        : `Hello! I'm ${settings.therapistName} speaking with the ${settings.voice} voice at ${settings.speed}x speed. How do I sound?`;

      // Stop any previous audio
      stopGlobalAudio();

      const { data, error } = await supabase.functions.invoke('google-tts', {
        body: { 
          text: testText,
          voice: settings.voice,
          speed: settings.speed
          // pitch: settings.pitch // Temporarily disabled until database column is added
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        await playGlobalTTS(data.audioContent, 'GoogleTTSConfiguration');
        // Set a timeout to reset the playing state
        setTimeout(() => {
          setIsPlaying(false);
        }, 5000); // 5 seconds should be enough for the test audio
      }
    } catch (error) {
      console.error('Error testing Google TTS voice:', error);
      toast({
        title: "Error",
        description: "Failed to test Google TTS voice. Please try again.",
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Google TTS Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading Google TTS settings...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Google TTS Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Therapist Selection */}
        <div className="space-y-2">
          <Label htmlFor="google-therapist-select">Select Therapist</Label>
          <Select 
            value={settings.therapistName} 
            onValueChange={handleTherapistChange}
          >
            <SelectTrigger id="google-therapist-select">
              <SelectValue placeholder="Select a therapist" />
            </SelectTrigger>
            <SelectContent>
              {availableTherapists.map((therapist) => (
                <SelectItem key={therapist} value={therapist}>
                  {therapist}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Voice Selection with Categories */}
        <div className="space-y-2">
          <Label htmlFor="google-voice-select">Voice Selection</Label>
          <Select 
            value={settings.voice} 
            onValueChange={(value) => setSettings(prev => ({ ...prev, voice: value }))}
          >
            <SelectTrigger id="google-voice-select">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {googleVoices.map((category) => (
                <div key={category.category}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100">
                    {category.category}
                  </div>
                  {category.voices.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{voice.label}</span>
                        <span className="text-xs text-gray-500">
                          {voice.gender} • {voice.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
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

        {/* Pitch Control - Temporarily disabled until database column is added */}
        {/* 
        <div className="space-y-3">
          <Label>Voice Pitch: {settings.pitch > 0 ? '+' : ''}{settings.pitch}</Label>
          <Slider
            value={[settings.pitch]}
            onValueChange={(value) => setSettings(prev => ({ ...prev, pitch: value[0] }))}
            min={-20.0}
            max={20.0}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>-20 (Very Low)</span>
            <span>0 (Normal)</span>
            <span>+20 (Very High)</span>
          </div>
        </div>
        */}

        {/* SSML Support */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="google-enable-ssml"
              checked={settings.enableSSML}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableSSML: checked }))}
            />
            <Label htmlFor="google-enable-ssml">Enable SSML (Speech Synthesis Markup Language)</Label>
          </div>
          
          {settings.enableSSML && (
            <div className="space-y-2">
              <Label htmlFor="google-ssml-sample">SSML Sample Text</Label>
              <Textarea
                id="google-ssml-sample"
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
            {isPlaying ? 'Playing...' : 'Test Google TTS Voice'}
          </Button>
          
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Google TTS Settings'}
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
          <strong>Google TTS Benefits:</strong> 
          <ul className="mt-2 space-y-1">
            <li>• Faster response times and lower latency</li>
            <li>• High-quality neural voices optimized for therapy</li>
            <li>• Multiple accents and dialects for diverse populations</li>
            <li>• Better pronunciation and natural speech patterns</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleTTSConfiguration; 