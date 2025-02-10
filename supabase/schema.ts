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
      vault_items: {
        Row: {
          id: string
          user_id: string
          sneaker_id: string
          name: string
          brand: string
          thumbnail: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sneaker_id: string
          name: string
          brand: string
          thumbnail: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sneaker_id?: string
          name?: string
          brand?: string
          thumbnail?: string
          created_at?: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      collection_items: {
        Row: {
          id: string
          collection_id: string
          sneaker_id: string
          name: string
          brand: string
          thumbnail: string
          created_at: string
        }
        Insert: {
          id?: string
          collection_id: string
          sneaker_id: string
          name: string
          brand: string
          thumbnail: string
          created_at?: string
        }
        Update: {
          id?: string
          collection_id?: string
          sneaker_id?: string
          name?: string
          brand?: string
          thumbnail?: string
          created_at?: string
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
  }
} 