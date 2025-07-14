import { supabase } from '@/integrations/supabase/client';

export interface SoundConfig {
  sound: string;
  description: string;
  instruction: string;
  common_errors: string[];
  emoji: string;
}

export interface SoundDetectionConfig {
  sounds: SoundConfig[];
  detection_threshold: number;
  feedback_delay_ms: number;
}

export interface SoundFeedbackContext {
  target_sound: string;
  user_attempt: string;
  therapistName: string;
  childName: string;
  question?: string;
  correct_answer?: string;
}

export class SoundFeedbackManager {
  private soundConfig: SoundDetectionConfig | null = null;
  private feedbackPrompts: Record<string, string> = {};

  async initialize(): Promise<void> {
    try {
      // Load sound detection configuration
      const { data: configData, error: configError } = await supabase
        .from('prompt_configurations')
        .select('content')
        .eq('prompt_type', 'sound_detection_config')
        .eq('is_active', true)
        .single();

      if (configError) {
        console.error('Error loading sound detection config:', configError);
        return;
      }

      if (configData) {
        this.soundConfig = JSON.parse(configData.content);
        console.log('Sound detection config loaded:', this.soundConfig);
      }

      // Load feedback prompts
      const { data: promptsData, error: promptsError } = await supabase
        .from('prompt_configurations')
        .select('prompt_type, content')
        .in('prompt_type', [
          'sound_feedback_correct',
          'sound_feedback_incorrect',
          'sound_feedback_encouragement',
          'sound_feedback_instruction'
        ])
        .eq('is_active', true);

      if (promptsError) {
        console.error('Error loading sound feedback prompts:', promptsError);
        return;
      }

      if (promptsData) {
        promptsData.forEach(prompt => {
          this.feedbackPrompts[prompt.prompt_type] = prompt.content;
        });
        console.log('Sound feedback prompts loaded:', Object.keys(this.feedbackPrompts));
      }
    } catch (error) {
      console.error('Error initializing sound feedback manager:', error);
    }
  }

  detectTargetSound(userInput: string): { targetSound: SoundConfig | null; confidence: number } {
    if (!this.soundConfig) {
      return { targetSound: null, confidence: 0 };
    }

    const normalizedInput = userInput.toLowerCase().trim();
    let bestMatch: SoundConfig | null = null;
    let bestConfidence = 0;

    // Check for exact sound matches
    for (const sound of this.soundConfig.sounds) {
      // Check if the sound is mentioned in the input
      if (normalizedInput.includes(sound.sound) || 
          normalizedInput.includes(sound.description.toLowerCase()) ||
          normalizedInput.includes(sound.emoji)) {
        return { targetSound: sound, confidence: 0.9 };
      }

      // Check for common errors that might indicate they're trying to make the sound
      for (const error of sound.common_errors) {
        if (normalizedInput.includes(error)) {
          const confidence = 0.6; // Lower confidence for error patterns
          if (confidence > bestConfidence) {
            bestMatch = sound;
            bestConfidence = confidence;
          }
        }
      }
    }

    return { targetSound: bestMatch, confidence: bestConfidence };
  }

  async generateSoundFeedback(
    context: SoundFeedbackContext,
    feedbackType: 'correct' | 'incorrect' | 'encouragement' | 'instruction'
  ): Promise<string | null> {
    try {
      const promptKey = `sound_feedback_${feedbackType}`;
      const basePrompt = this.feedbackPrompts[promptKey];

      if (!basePrompt) {
        console.error(`No prompt found for feedback type: ${feedbackType}`);
        return null;
      }

      // Replace placeholders in the prompt
      let promptContent = basePrompt
        .replace('{target_sound}', context.target_sound)
        .replace('{user_attempt}', context.user_attempt)
        .replace('{question}', context.question || 'the question')
        .replace('{correct_answer}', context.correct_answer || 'the answer');

      // Call OpenAI to generate the feedback
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [{
            role: 'user',
            content: promptContent
          }],
          activityType: 'sound_practice',
          customInstructions: `You are ${context.therapistName}, a warm and encouraging speech therapist. Provide brief, child-friendly feedback that is specific and encouraging.`,
          therapistName: context.therapistName,
          childName: context.childName
        }
      });

      if (error) {
        console.error('Error generating sound feedback:', error);
        return null;
      }

      return data?.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error('Error in generateSoundFeedback:', error);
      return null;
    }
  }

  getSoundInstruction(targetSound: string): string | null {
    if (!this.soundConfig) return null;

    const sound = this.soundConfig.sounds.find(s => s.sound === targetSound);
    return sound?.instruction || null;
  }

  getSoundEmoji(targetSound: string): string | null {
    if (!this.soundConfig) return null;

    const sound = this.soundConfig.sounds.find(s => s.sound === targetSound);
    return sound?.emoji || null;
  }

  isInitialized(): boolean {
    return this.soundConfig !== null && Object.keys(this.feedbackPrompts).length > 0;
  }
}

// Global instance
export const soundFeedbackManager = new SoundFeedbackManager(); 