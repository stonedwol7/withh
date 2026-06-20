export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: 'customer' | 'partner' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'customer' | 'partner' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: 'customer' | 'partner' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      partners_meta: {
        Row: {
          id: string
          bio: string | null
          video_url: string | null
          languages: string[]
          categories: string[]
          hourly_rate: number | null
          is_guarantor_verified: boolean
          background_check_status: string
          kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected'
          aadhaar_url: string | null
          pan_url: string | null
          selfie_url: string | null
          address_proof_url: string | null
          pan_number: string | null
          bank_account_number: string | null
          ifsc_code: string | null
          upi_id: string | null
          guarantor_name: string | null
          guarantor_phone: string | null
          terms_accepted: boolean
          service_radius_km: number
          rejection_reason: string | null
          rating_avg: number
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          bio?: string | null
          video_url?: string | null
          languages?: string[]
          categories?: string[]
          hourly_rate?: number | null
          is_guarantor_verified?: boolean
          background_check_status?: string
          kyc_status?: 'pending' | 'submitted' | 'verified' | 'rejected'
          aadhaar_url?: string | null
          pan_url?: string | null
          selfie_url?: string | null
          address_proof_url?: string | null
          pan_number?: string | null
          bank_account_number?: string | null
          ifsc_code?: string | null
          upi_id?: string | null
          guarantor_name?: string | null
          guarantor_phone?: string | null
          terms_accepted?: boolean
          service_radius_km?: number
          rejection_reason?: string | null
          rating_avg?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bio?: string | null
          video_url?: string | null
          languages?: string[]
          categories?: string[]
          hourly_rate?: number | null
          is_guarantor_verified?: boolean
          background_check_status?: string
          kyc_status?: 'pending' | 'submitted' | 'verified' | 'rejected'
          aadhaar_url?: string | null
          pan_url?: string | null
          selfie_url?: string | null
          address_proof_url?: string | null
          pan_number?: string | null
          bank_account_number?: string | null
          ifsc_code?: string | null
          upi_id?: string | null
          guarantor_name?: string | null
          guarantor_phone?: string | null
          terms_accepted?: boolean
          service_radius_km?: number
          rejection_reason?: string | null
          rating_avg?: number
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          customer_id: string
          partner_id: string | null
          category: string
          principal_name: string
          exact_meeting_spot: string
          meeting_lat: number | null
          meeting_lng: number | null
          scheduled_at: string
          duration_estimate_minutes: number
          requires_female_partner: boolean
          status: 'pending' | 'confirmed' | 'partner_assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          total_price: number
          notes: string | null
          started_at: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          partner_id?: string | null
          category: string
          principal_name: string
          exact_meeting_spot: string
          meeting_lat?: number | null
          meeting_lng?: number | null
          scheduled_at: string
          duration_estimate_minutes?: number
          requires_female_partner?: boolean
          status?: 'pending' | 'confirmed' | 'partner_assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          total_price: number
          notes?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          partner_id?: string | null
          category?: string
          principal_name?: string
          exact_meeting_spot?: string
          meeting_lat?: number | null
          meeting_lng?: number | null
          scheduled_at?: string
          duration_estimate_minutes?: number
          requires_female_partner?: boolean
          status?: 'pending' | 'confirmed' | 'partner_assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
          total_price?: number
          notes?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          booking_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: { id: string; auth_id: string; full_name: string | null; phone: string | null; created_at: string }
        Insert: { id?: string; auth_id: string; full_name?: string | null; phone?: string | null; created_at?: string }
        Update: { id?: string; auth_id?: string; full_name?: string | null; phone?: string | null; created_at?: string }
        Relationships: []
      }
      support_partners: {
        Row: { id: string; auth_id: string; full_name: string | null; phone: string | null; categories: string[]; languages: string[]; rating: number; availability_status: string | null; created_at: string }
        Insert: { id?: string; auth_id: string; full_name?: string | null; phone?: string | null; categories?: string[]; languages?: string[]; rating?: number; availability_status?: string | null; created_at?: string }
        Update: { id?: string; auth_id?: string; full_name?: string | null; phone?: string | null; categories?: string[]; languages?: string[]; rating?: number; availability_status?: string | null; created_at?: string }
        Relationships: []
      }
      operations_team: {
        Row: { id: string; auth_id: string; full_name: string | null; created_at: string }
        Insert: { id?: string; auth_id: string; full_name?: string | null; created_at?: string }
        Update: { id?: string; auth_id?: string; full_name?: string | null; created_at?: string }
        Relationships: []
      }
      requests: {
        Row: { id: string; customer_id: string; category: string; principal_name: string; exact_meeting_spot: string; scheduled_at: string; duration_estimate_minutes: number; requires_female_partner: boolean; status: string; total_price: number; notes: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; customer_id: string; category: string; principal_name: string; exact_meeting_spot: string; scheduled_at: string; duration_estimate_minutes?: number; requires_female_partner?: boolean; status?: string; total_price?: number; notes?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; customer_id?: string; category?: string; principal_name?: string; exact_meeting_spot?: string; scheduled_at?: string; duration_estimate_minutes?: number; requires_female_partner?: boolean; status?: string; total_price?: number; notes?: string | null; created_at?: string; updated_at?: string }
        Relationships: []
      }
      assignments: {
        Row: { id: string; request_id: string; partner_id: string; assigned_by: string; status: string; accepted_at: string | null; created_at: string }
        Insert: { id?: string; request_id: string; partner_id: string; assigned_by: string; status?: string; accepted_at?: string | null; created_at?: string }
        Update: { id?: string; request_id?: string; partner_id?: string; assigned_by?: string; status?: string; accepted_at?: string | null; created_at?: string }
        Relationships: []
      }
      journey_messages: {
        Row: { id: string; request_id: string; sender_id: string; sender_type: string | null; sender_name: string | null; content: string; created_at: string }
        Insert: { id?: string; request_id: string; sender_id: string; sender_type?: string | null; sender_name?: string | null; content: string; created_at?: string }
        Update: { id?: string; request_id?: string; sender_id?: string; sender_type?: string | null; sender_name?: string | null; content?: string; created_at?: string }
        Relationships: []
      }
      journey_events: {
        Row: { id: string; request_id: string; event_type: string; notes: string | null; created_at: string }
        Insert: { id?: string; request_id: string; event_type: string; notes?: string | null; created_at?: string }
        Update: { id?: string; request_id?: string; event_type?: string; notes?: string | null; created_at?: string }
        Relationships: []
      }
      issues: {
        Row: { id: string; request_id: string; raised_by: string; category: string; description: string; status: string; type: string | null; user_id: string | null; resolution: string | null; resolved_at: string | null; created_at: string }
        Insert: { id?: string; request_id: string; raised_by: string; category: string; description: string; status?: string; type?: string | null; user_id?: string | null; resolution?: string | null; resolved_at?: string | null; created_at?: string }
        Update: { id?: string; request_id?: string; raised_by?: string; category?: string; description?: string; status?: string; type?: string | null; user_id?: string | null; resolution?: string | null; resolved_at?: string | null; created_at?: string }
        Relationships: []
      }
      payments: {
        Row: { id: string; request_id: string; customer_id: string; amount: number; status: string; created_at: string }
        Insert: { id?: string; request_id: string; customer_id: string; amount: number; status?: string; created_at?: string }
        Update: { id?: string; request_id?: string; customer_id?: string; amount?: number; status?: string; created_at?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'customer' | 'partner' | 'admin'
      booking_status: 'pending' | 'confirmed' | 'partner_assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
    }
  }
}
