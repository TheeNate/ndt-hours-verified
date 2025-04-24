
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
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          username: string
          full_name: string
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          is_admin?: boolean
          created_at?: string
        }
      }
      ndt_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          method: string
          location: string
          hours: number
          company: string
          supervisor: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          method: string
          location: string
          hours: number
          company: string
          supervisor: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          method?: string
          location?: string
          hours?: number
          company?: string
          supervisor?: string
          created_at?: string
          updated_at?: string
        }
      }
      methods: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      ndt_signatures: {
        Row: {
          id: string
          entry_id: string
          technician_id: string
          technician_name: string
          hours: number
          method: string
          supervisor_name: string
          supervisor_email: string
          company: string
          asnt: string
          cert_level: string
          token: string
          status: 'Pending' | 'Confirmed'
          auto_signature: string
          employee_id: string
          cert_number: string
          verification_date: string | null
          timestamp_hash: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          technician_id: string
          technician_name: string
          hours: number
          method: string
          supervisor_name: string
          supervisor_email: string
          company: string
          asnt?: string
          cert_level?: string
          token: string
          status?: 'Pending' | 'Confirmed'
          auto_signature?: string
          employee_id?: string
          cert_number?: string
          verification_date?: string | null
          timestamp_hash?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          technician_id?: string
          technician_name?: string
          hours?: number
          method?: string
          supervisor_name?: string
          supervisor_email?: string
          company?: string
          asnt?: string
          cert_level?: string
          token?: string
          status?: 'Pending' | 'Confirmed'
          auto_signature?: string
          employee_id?: string
          cert_number?: string
          verification_date?: string | null
          timestamp_hash?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rope_entries: {
        Row: {
          id: string
          user_id: string
          date_from: string
          date_to: string
          company: string
          location: string
          tasks: string
          industry: string
          details: string
          supervisor: string
          rope_hours: number
          signature_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date_from: string
          date_to: string
          company: string
          location: string
          tasks: string
          industry: string
          details: string
          supervisor: string
          rope_hours: number
          signature_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date_from?: string
          date_to?: string
          company?: string
          location?: string
          tasks?: string
          industry?: string
          details?: string
          supervisor?: string
          rope_hours?: number
          signature_hash?: string | null
          created_at?: string
        }
      }
      rope_signatures: {
        Row: {
          id: string
          entry_id: string
          technician_id: string
          technician_name: string
          supervisor_name: string
          supervisor_email: string
          token: string
          status: 'Pending' | 'Confirmed'
          verification_date: string | null
          timestamp_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          technician_id: string
          technician_name: string
          supervisor_name: string
          supervisor_email: string
          token: string
          status?: 'Pending' | 'Confirmed'
          verification_date?: string | null
          timestamp_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          technician_id?: string
          technician_name?: string
          supervisor_name?: string
          supervisor_email?: string
          token?: string
          status?: 'Pending' | 'Confirmed'
          verification_date?: string | null
          timestamp_hash?: string | null
          created_at?: string
        }
      }
    }
  }
}
