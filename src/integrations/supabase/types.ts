export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          amplify_mic: boolean
          id: string
          mic_gain: number
          show_mic_input: boolean
          skip_introduction: boolean
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amplify_mic?: boolean
          id?: string
          mic_gain?: number
          show_mic_input?: boolean
          skip_introduction?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amplify_mic?: boolean
          id?: string
          mic_gain?: number
          show_mic_input?: boolean
          skip_introduction?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      cartoon_characters: {
        Row: {
          animal_type: string
          created_at: string
          id: string
          name: string
          storage_path: string
        }
        Insert: {
          animal_type: string
          created_at?: string
          id?: string
          name: string
          storage_path: string
        }
        Update: {
          animal_type?: string
          created_at?: string
          id?: string
          name?: string
          storage_path?: string
        }
        Relationships: []
      }
      celebration_messages: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          message_category: string
          message_type: string
          priority: number
          progress_level: number
          therapist_name: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          message_category: string
          message_type: string
          priority?: number
          progress_level?: number
          therapist_name: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          message_category?: string
          message_type?: string
          priority?: number
          progress_level?: number
          therapist_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: string
          id: string
          is_active: boolean | null
          name: string
          question_type: Database["public"]["Enums"]["question_type_enum"]
          updated_at: string | null
          youtube_video_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level: string
          id?: string
          is_active?: boolean | null
          name: string
          question_type: Database["public"]["Enums"]["question_type_enum"]
          updated_at?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string
          id?: string
          is_active?: boolean | null
          name?: string
          question_type?: Database["public"]["Enums"]["question_type_enum"]
          updated_at?: string | null
          youtube_video_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number
          created_at: string
          id: string
          name: string
          speech_delay_mode: boolean
          updated_at: string
          username: string
        }
        Insert: {
          age: number
          created_at?: string
          id: string
          name: string
          speech_delay_mode?: boolean
          updated_at?: string
          username: string
        }
        Update: {
          age?: number
          created_at?: string
          id?: string
          name?: string
          speech_delay_mode?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      prompt_configurations: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          prompt_type: string
          updated_at: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          prompt_type: string
          updated_at?: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          prompt_type?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      prompt_history: {
        Row: {
          archived_at: string
          archived_by: string | null
          content: string
          created_at: string
          created_by: string | null
          id: string
          original_prompt_id: string
          prompt_type: string
          updated_at: string
        }
        Insert: {
          archived_at?: string
          archived_by?: string | null
          content: string
          created_at: string
          created_by?: string | null
          id?: string
          original_prompt_id: string
          prompt_type: string
          updated_at: string
        }
        Update: {
          archived_at?: string
          archived_by?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          original_prompt_id?: string
          prompt_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string
          created_at: string | null
          created_by: string | null
          id: string
          image_name: string | null
          lesson_id: string | null
          question: string
          question_type: Database["public"]["Enums"]["question_type_enum"]
          updated_at: string | null
        }
        Insert: {
          answer: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_name?: string | null
          lesson_id?: string | null
          question: string
          question_type?: Database["public"]["Enums"]["question_type_enum"]
          updated_at?: string | null
        }
        Update: {
          answer?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_name?: string | null
          lesson_id?: string | null
          question?: string
          question_type?: Database["public"]["Enums"]["question_type_enum"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          therapist_id: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          therapist_id: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          therapist_id?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_availability_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_specializations: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      therapists: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certification: string | null
          created_at: string
          hourly_rate_30min: number | null
          hourly_rate_60min: number | null
          id: string
          is_active: boolean
          is_verified: boolean
          name: string
          specializations: string[] | null
          timezone: string | null
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certification?: string | null
          created_at?: string
          hourly_rate_30min?: number | null
          hourly_rate_60min?: number | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          name: string
          specializations?: string[] | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certification?: string | null
          created_at?: string
          hourly_rate_30min?: number | null
          hourly_rate_60min?: number | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          name?: string
          specializations?: string[] | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      therapy_sessions: {
        Row: {
          client_id: string
          client_notes: string | null
          created_at: string
          currency: string | null
          duration_minutes: number
          end_time: string
          id: string
          payment_status: string
          price_paid: number | null
          session_date: string
          session_type: string
          start_time: string
          status: string
          therapist_id: string
          therapist_notes: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          client_notes?: string | null
          created_at?: string
          currency?: string | null
          duration_minutes?: number
          end_time: string
          id?: string
          payment_status?: string
          price_paid?: number | null
          session_date: string
          session_type?: string
          start_time: string
          status?: string
          therapist_id: string
          therapist_notes?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_notes?: string | null
          created_at?: string
          currency?: string | null
          duration_minutes?: number
          end_time?: string
          id?: string
          payment_status?: string
          price_paid?: number | null
          session_date?: string
          session_type?: string
          start_time?: string
          status?: string
          therapist_id?: string
          therapist_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapy_sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapy_sessions_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      tts_settings: {
        Row: {
          created_at: string
          enable_ssml: boolean
          id: string
          provider: string | null
          sample_ssml: string
          speed: number
          therapist_name: string
          updated_at: string
          voice: string
        }
        Insert: {
          created_at?: string
          enable_ssml?: boolean
          id?: string
          provider?: string | null
          sample_ssml?: string
          speed?: number
          therapist_name?: string
          updated_at?: string
          voice?: string
        }
        Update: {
          created_at?: string
          enable_ssml?: boolean
          id?: string
          provider?: string | null
          sample_ssml?: string
          speed?: number
          therapist_name?: string
          updated_at?: string
          voice?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "therapist"
      question_type_enum:
        | "first_words"
        | "question_time"
        | "build_sentence"
        | "lets_chat"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "therapist"],
      question_type_enum: [
        "first_words",
        "question_time",
        "build_sentence",
        "lets_chat",
      ],
    },
  },
} as const
