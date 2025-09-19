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
      auth_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      crop_records: {
        Row: {
          created_at: string
          crop_name: string
          expected_harvest_on: string | null
          farm_id: string
          id: string
          notes: string | null
          planted_on: string
          season: string | null
          updated_at: string
          yield_estimate: number | null
        }
        Insert: {
          created_at?: string
          crop_name: string
          expected_harvest_on?: string | null
          farm_id: string
          id?: string
          notes?: string | null
          planted_on: string
          season?: string | null
          updated_at?: string
          yield_estimate?: number | null
        }
        Update: {
          created_at?: string
          crop_name?: string
          expected_harvest_on?: string | null
          farm_id?: string
          id?: string
          notes?: string | null
          planted_on?: string
          season?: string | null
          updated_at?: string
          yield_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          area: number | null
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          soil_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: number | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          soil_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: number | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          soil_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string
          direction: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          direction?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          direction?: string
          name?: string
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          attempts: number
          code: string
          code_expires_at: string
          consumed: boolean
          created_at: string
          id: string
          phone: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          code: string
          code_expires_at: string
          consumed?: boolean
          created_at?: string
          id?: string
          phone: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          code?: string
          code_expires_at?: string
          consumed?: boolean
          created_at?: string
          id?: string
          phone?: string
          user_id?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string
          crop_record_id: string | null
          farm_id: string | null
          id: string
          language_code: string | null
          message: string
          metadata: Json | null
          severity: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          crop_record_id?: string | null
          farm_id?: string | null
          id?: string
          language_code?: string | null
          message: string
          metadata?: Json | null
          severity?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          crop_record_id?: string | null
          farm_id?: string | null
          id?: string
          language_code?: string | null
          message?: string
          metadata?: Json | null
          severity?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_crop_record_id_fkey"
            columns: ["crop_record_id"]
            isOneToOne: false
            referencedRelation: "crop_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          code: string
          country_code: string
          created_at: string
          name: string
        }
        Insert: {
          code: string
          country_code?: string
          created_at?: string
          name: string
        }
        Update: {
          code?: string
          country_code?: string
          created_at?: string
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          id: string
          language_code: string
          metadata: Json | null
          name: string
          phone: string
          phone_country_code: string | null
          phone_verified: boolean
          state_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_code: string
          metadata?: Json | null
          name: string
          phone: string
          phone_country_code?: string | null
          phone_verified?: boolean
          state_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language_code?: string
          metadata?: Json | null
          name?: string
          phone?: string
          phone_country_code?: string | null
          phone_verified?: boolean
          state_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "users_state_code_fkey"
            columns: ["state_code"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["code"]
          },
        ]
      }
      weather_data: {
        Row: {
          created_at: string
          data_type: string
          farm_id: string | null
          fetched_at: string
          humidity: number | null
          id: string
          lat: number | null
          lng: number | null
          precip: number | null
          provider: string
          raw: Json | null
          target_time: string
          temp: number | null
          wind_dir: number | null
          wind_speed: number | null
        }
        Insert: {
          created_at?: string
          data_type: string
          farm_id?: string | null
          fetched_at?: string
          humidity?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          precip?: number | null
          provider: string
          raw?: Json | null
          target_time: string
          temp?: number | null
          wind_dir?: number | null
          wind_speed?: number | null
        }
        Update: {
          created_at?: string
          data_type?: string
          farm_id?: string | null
          fetched_at?: string
          humidity?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          precip?: number | null
          provider?: string
          raw?: Json | null
          target_time?: string
          temp?: number | null
          wind_dir?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_data_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_view_auth_events: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          phone: string | null
          user_id: string | null
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
