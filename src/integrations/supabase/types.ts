export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      profiles: {
        Row: {
          age: number
          created_at: string
          id: string
          name: string
          updated_at: string
          username: string
        }
        Insert: {
          age: number
          created_at?: string
          id: string
          name: string
          updated_at?: string
          username: string
        }
        Update: {
          age?: number
          created_at?: string
          id?: string
          name?: string
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
          question?: string
          question_type?: Database["public"]["Enums"]["question_type_enum"]
          updated_at?: string | null
        }
        Relationships: []
      }
      tts_settings: {
        Row: {
          created_at: string
          enable_ssml: boolean
          id: string
          sample_ssml: string
          speed: number
          therapist_name: string
          updated_at: string
          voice: string
          provider?: string
          pitch?: number
        }
        Insert: {
          created_at?: string
          enable_ssml?: boolean
          id?: string
          sample_ssml?: string
          speed?: number
          therapist_name?: string
          updated_at?: string
          voice?: string
          provider?: string
          pitch?: number
        }
        Update: {
          created_at?: string
          enable_ssml?: boolean
          id?: string
          sample_ssml?: string
          speed?: number
          therapist_name?: string
          updated_at?: string
          voice?: string
          provider?: string
          pitch?: number
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
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      question_type_enum: [
        "first_words",
        "question_time",
        "build_sentence",
        "lets_chat",
      ],
    },
  },
} as const
