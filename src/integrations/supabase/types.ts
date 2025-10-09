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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookmark_folders: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookmarked_episodes: {
        Row: {
          created_at: string
          episode_id: string
          folder_id: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          folder_id?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          folder_id?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarked_episodes_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarked_episodes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "bookmark_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarked_lessons: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          lesson_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          lesson_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          lesson_id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarked_lessons_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "bookmark_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarked_lessons_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      chavel_callouts: {
        Row: {
          callout_text: string
          created_at: string | null
          episode_id: string | null
          id: string
          relevance_score: number | null
        }
        Insert: {
          callout_text: string
          created_at?: string | null
          episode_id?: string | null
          id?: string
          relevance_score?: number | null
        }
        Update: {
          callout_text?: string
          created_at?: string | null
          episode_id?: string | null
          id?: string
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chavel_callouts_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          current_stage: string | null
          employee_count: number | null
          founding_year: number | null
          funding_raised: string | null
          id: string
          industry: string | null
          name: string
          status: string | null
          updated_at: string | null
          valuation: string | null
        }
        Insert: {
          created_at?: string | null
          current_stage?: string | null
          employee_count?: number | null
          founding_year?: number | null
          funding_raised?: string | null
          id?: string
          industry?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
          valuation?: string | null
        }
        Update: {
          created_at?: string | null
          current_stage?: string | null
          employee_count?: number | null
          founding_year?: number | null
          funding_raised?: string | null
          id?: string
          industry?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
          valuation?: string | null
        }
        Relationships: []
      }
      episodes: {
        Row: {
          analysis_status: string | null
          company_id: string | null
          created_at: string | null
          founder_names: string | null
          id: string
          platform: string | null
          podcast_id: string | null
          release_date: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          analysis_status?: string | null
          company_id?: string | null
          created_at?: string | null
          founder_names?: string | null
          id?: string
          platform?: string | null
          podcast_id?: string | null
          release_date?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          analysis_status?: string | null
          company_id?: string | null
          created_at?: string | null
          founder_names?: string | null
          id?: string
          platform?: string | null
          podcast_id?: string | null
          release_date?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_podcast_id_fkey"
            columns: ["podcast_id"]
            isOneToOne: false
            referencedRelation: "podcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          actionability_score: number | null
          category: string | null
          created_at: string | null
          episode_id: string | null
          founder_attribution: string | null
          id: string
          impact_score: number | null
          lesson_text: string
        }
        Insert: {
          actionability_score?: number | null
          category?: string | null
          created_at?: string | null
          episode_id?: string | null
          founder_attribution?: string | null
          id?: string
          impact_score?: number | null
          lesson_text: string
        }
        Update: {
          actionability_score?: number | null
          category?: string | null
          created_at?: string | null
          episode_id?: string | null
          founder_attribution?: string | null
          id?: string
          impact_score?: number | null
          lesson_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      personalized_insights: {
        Row: {
          action_items: Json | null
          created_at: string | null
          id: string
          lesson_id: string | null
          personalized_text: string
          relevance_score: number | null
          startup_profile_id: string | null
        }
        Insert: {
          action_items?: Json | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          personalized_text: string
          relevance_score?: number | null
          startup_profile_id?: string | null
        }
        Update: {
          action_items?: Json | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          personalized_text?: string
          relevance_score?: number | null
          startup_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personalized_insights_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personalized_insights_startup_profile_id_fkey"
            columns: ["startup_profile_id"]
            isOneToOne: false
            referencedRelation: "user_startup_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      podcasts: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_startup_profiles: {
        Row: {
          company_name: string
          company_website: string | null
          created_at: string | null
          description: string
          employee_count: number | null
          funding_raised: string | null
          id: string
          industry: string | null
          stage: Database["public"]["Enums"]["startup_stage"]
          updated_at: string | null
          user_id: string | null
          valuation: string | null
        }
        Insert: {
          company_name: string
          company_website?: string | null
          created_at?: string | null
          description: string
          employee_count?: number | null
          funding_raised?: string | null
          id?: string
          industry?: string | null
          stage: Database["public"]["Enums"]["startup_stage"]
          updated_at?: string | null
          user_id?: string | null
          valuation?: string | null
        }
        Update: {
          company_name?: string
          company_website?: string | null
          created_at?: string | null
          description?: string
          employee_count?: number | null
          funding_raised?: string | null
          id?: string
          industry?: string | null
          stage?: Database["public"]["Enums"]["startup_stage"]
          updated_at?: string | null
          user_id?: string | null
          valuation?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      startup_stage:
        | "pre_seed"
        | "seed"
        | "series_a"
        | "series_b_plus"
        | "growth"
        | "public"
        | "bootstrapped"
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
      startup_stage: [
        "pre_seed",
        "seed",
        "series_a",
        "series_b_plus",
        "growth",
        "public",
        "bootstrapped",
      ],
    },
  },
} as const
