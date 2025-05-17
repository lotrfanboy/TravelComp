/**
 * Tipos gerados para o Supabase
 * 
 * Estas definições de tipos são usadas pelo cliente do Supabase
 * para garantir tipagem forte nas consultas ao banco de dados.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          password: string | null
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          role: string
          organization_id: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          password?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          role?: string
          organization_id?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          password?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          role?: string
          organization_id?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: number
          name: string
          user_id: string
          organization_id: number | null
          start_date: string
          end_date: string
          destination: string
          country: string
          is_multi_destination: boolean | null
          trip_type: string
          budget: number | null
          currency: string | null
          notes: string | null
          is_public: boolean | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          user_id: string
          organization_id?: number | null
          start_date: string
          end_date: string
          destination: string
          country: string
          is_multi_destination?: boolean | null
          trip_type: string
          budget?: number | null
          currency?: string | null
          notes?: string | null
          is_public?: boolean | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          user_id?: string
          organization_id?: number | null
          start_date?: string
          end_date?: string
          destination?: string
          country?: string
          is_multi_destination?: boolean | null
          trip_type?: string
          budget?: number | null
          currency?: string | null
          notes?: string | null
          is_public?: boolean | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      workspaces: {
        Row: {
          id: number
          name: string
          address: string | null
          city: string
          country: string
          type: string
          wifi_speed: number | null
          price: number | null
          currency: string | null
          amenities: Json | null
          rating: number | null
          image_url: string | null
          website: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          address?: string | null
          city: string
          country: string
          type: string
          wifi_speed?: number | null
          price?: number | null
          currency?: string | null
          amenities?: Json | null
          rating?: number | null
          image_url?: string | null
          website?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          address?: string | null
          city?: string
          country?: string
          type?: string
          wifi_speed?: number | null
          price?: number | null
          currency?: string | null
          amenities?: Json | null
          rating?: number | null
          image_url?: string | null
          website?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      accommodations: {
        Row: {
          id: number
          name: string
          address: string | null
          city: string
          country: string
          type: string
          price_per_night: number | null
          currency: string | null
          amenities: Json | null
          rating: number | null
          image_url: string | null
          website: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          address?: string | null
          city: string
          country: string
          type: string
          price_per_night?: number | null
          currency?: string | null
          amenities?: Json | null
          rating?: number | null
          image_url?: string | null
          website?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          address?: string | null
          city?: string
          country?: string
          type?: string
          price_per_night?: number | null
          currency?: string | null
          amenities?: Json | null
          rating?: number | null
          image_url?: string | null
          website?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      attractions: {
        Row: {
          id: number
          name: string
          description: string | null
          city: string
          country: string
          type: string
          price: number | null
          currency: string | null
          rating: number | null
          image_url: string | null
          website: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          city: string
          country: string
          type: string
          price?: number | null
          currency?: string | null
          rating?: number | null
          image_url?: string | null
          website?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          city?: string
          country?: string
          type?: string
          price?: number | null
          currency?: string | null
          rating?: number | null
          image_url?: string | null
          website?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      destinations: {
        Row: {
          id: number
          trip_id: number
          name: string
          city: string
          country: string
          order_index: number | null
          arrival_date: string
          departure_date: string
          accommodation: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          trip_id: number
          name: string
          city: string
          country: string
          order_index?: number | null
          arrival_date: string
          departure_date: string
          accommodation?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          trip_id?: number
          name?: string
          city?: string
          country?: string
          order_index?: number | null
          arrival_date?: string
          departure_date?: string
          accommodation?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          title: string
          message: string
          type: string | null
          is_read: boolean | null
          entity_type: string | null
          entity_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          message: string
          type?: string | null
          is_read?: boolean | null
          entity_type?: string | null
          entity_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          message?: string
          type?: string | null
          is_read?: boolean | null
          entity_type?: string | null
          entity_id?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}