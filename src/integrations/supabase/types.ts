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
      announcement_comments: {
        Row: {
          announcement_id: string | null
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          announcement_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          announcement_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_comments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          publish_at: string
          tender_id: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          publish_at?: string
          tender_id?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          publish_at?: string
          tender_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "project_tenders"
            referencedColumns: ["tender_id"]
          },
          {
            foreignKeyName: "announcements_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          "Adaptive/IRT": string | null
          "Assessment Length": string | null
          combined_text: string | null
          Description: string | null
          Downloads: string | null
          embedding: Json | null
          "Job Levels": string | null
          Languages: string | null
          Link: string | null
          "Remote Testing": string | null
          "Test Title": string | null
          "Test Type": string | null
        }
        Insert: {
          "Adaptive/IRT"?: string | null
          "Assessment Length"?: string | null
          combined_text?: string | null
          Description?: string | null
          Downloads?: string | null
          embedding?: Json | null
          "Job Levels"?: string | null
          Languages?: string | null
          Link?: string | null
          "Remote Testing"?: string | null
          "Test Title"?: string | null
          "Test Type"?: string | null
        }
        Update: {
          "Adaptive/IRT"?: string | null
          "Assessment Length"?: string | null
          combined_text?: string | null
          Description?: string | null
          Downloads?: string | null
          embedding?: Json | null
          "Job Levels"?: string | null
          Languages?: string | null
          Link?: string | null
          "Remote Testing"?: string | null
          "Test Title"?: string | null
          "Test Type"?: string | null
        }
        Relationships: []
      }
      bid_appeals: {
        Row: {
          bid_id: string | null
          created_at: string | null
          id: string
          reason: string
          reviewed_by: string | null
          reviewer_comments: string | null
          status: Database["public"]["Enums"]["appeal_status"] | null
          submitted_by: string | null
          updated_at: string | null
        }
        Insert: {
          bid_id?: string | null
          created_at?: string | null
          id?: string
          reason: string
          reviewed_by?: string | null
          reviewer_comments?: string | null
          status?: Database["public"]["Enums"]["appeal_status"] | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Update: {
          bid_id?: string | null
          created_at?: string | null
          id?: string
          reason?: string
          reviewed_by?: string | null
          reviewer_comments?: string | null
          status?: Database["public"]["Enums"]["appeal_status"] | null
          submitted_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bid_appeals_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
        ]
      }
      bid_evaluations: {
        Row: {
          bid_id: string | null
          comments: string | null
          created_at: string
          criteria_scores: Json | null
          evaluator_id: string | null
          id: string
          total_score: number | null
          updated_at: string
        }
        Insert: {
          bid_id?: string | null
          comments?: string | null
          created_at?: string
          criteria_scores?: Json | null
          evaluator_id?: string | null
          id?: string
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          bid_id?: string | null
          comments?: string | null
          created_at?: string
          criteria_scores?: Json | null
          evaluator_id?: string | null
          id?: string
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_evaluations_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          amount: number
          bidder_id: string | null
          criteria_responses: Json | null
          document_urls: Json | null
          evaluation_score: number | null
          feedback: string | null
          id: string
          proposal: string | null
          specifications: Json | null
          status: Database["public"]["Enums"]["bid_status"] | null
          submitted_at: string
          technical_proposal_url: string | null
          tender_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          bidder_id?: string | null
          criteria_responses?: Json | null
          document_urls?: Json | null
          evaluation_score?: number | null
          feedback?: string | null
          id?: string
          proposal?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["bid_status"] | null
          submitted_at?: string
          technical_proposal_url?: string | null
          tender_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bidder_id?: string | null
          criteria_responses?: Json | null
          document_urls?: Json | null
          evaluation_score?: number | null
          feedback?: string | null
          id?: string
          proposal?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["bid_status"] | null
          submitted_at?: string
          technical_proposal_url?: string | null
          tender_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "project_tenders"
            referencedColumns: ["tender_id"]
          },
          {
            foreignKeyName: "bids_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          created_at: string
          id: string
          tender_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          tender_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          tender_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "project_tenders"
            referencedColumns: ["tender_id"]
          },
          {
            foreignKeyName: "bookmarks_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          content: string
          created_at: string
          id: string
          rating: number | null
          tender_id: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          rating?: number | null
          tender_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          rating?: number | null
          tender_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "project_tenders"
            referencedColumns: ["tender_id"]
          },
          {
            foreignKeyName: "feedback_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      infrastructure_audits: {
        Row: {
          attachments: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          maintenance_description: string | null
          maintenance_needed: boolean | null
          maintenance_scheduled_date: string | null
          result: Database["public"]["Enums"]["test_result_status"]
          tender_id: string | null
          test_date: string
          test_description: string | null
          test_type: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          maintenance_description?: string | null
          maintenance_needed?: boolean | null
          maintenance_scheduled_date?: string | null
          result?: Database["public"]["Enums"]["test_result_status"]
          tender_id?: string | null
          test_date: string
          test_description?: string | null
          test_type: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          maintenance_description?: string | null
          maintenance_needed?: boolean | null
          maintenance_scheduled_date?: string | null
          result?: Database["public"]["Enums"]["test_result_status"]
          tender_id?: string | null
          test_date?: string
          test_description?: string | null
          test_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_audits_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "project_tenders"
            referencedColumns: ["tender_id"]
          },
          {
            foreignKeyName: "infrastructure_audits_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_messages: {
        Row: {
          audit_id: string | null
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          sent_at: string | null
          sent_by: string | null
          tender_id: string | null
        }
        Insert: {
          audit_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          tender_id?: string | null
        }
        Update: {
          audit_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          tender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_messages_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "infrastructure_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_messages_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "project_tenders"
            referencedColumns: ["tender_id"]
          },
          {
            foreignKeyName: "maintenance_messages_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["milestone_status"] | null
          tender_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["milestone_status"] | null
          tender_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["milestone_status"] | null
          tender_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "project_tenders"
            referencedColumns: ["tender_id"]
          },
          {
            foreignKeyName: "milestones_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          locked_until: string | null
          login_attempts: number | null
          organization: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          locked_until?: string | null
          login_attempts?: number | null
          organization?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          locked_until?: string | null
          login_attempts?: number | null
          organization?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          permissions: Json | null
          project_id: string | null
          role: Database["public"]["Enums"]["project_role"] | null
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          permissions?: Json | null
          project_id?: string | null
          role?: Database["public"]["Enums"]["project_role"] | null
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          permissions?: Json | null
          project_id?: string | null
          role?: Database["public"]["Enums"]["project_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_tenders"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          attachments: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          impact_details: Json | null
          is_published: boolean | null
          metrics: Json | null
          milestone_id: string | null
          status: string | null
          tender_id: string | null
          title: string
          update_type: Database["public"]["Enums"]["project_update_type"]
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact_details?: Json | null
          is_published?: boolean | null
          metrics?: Json | null
          milestone_id?: string | null
          status?: string | null
          tender_id?: string | null
          title: string
          update_type?: Database["public"]["Enums"]["project_update_type"]
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact_details?: Json | null
          is_published?: boolean | null
          metrics?: Json | null
          milestone_id?: string | null
          status?: string | null
          tender_id?: string | null
          title?: string
          update_type?: Database["public"]["Enums"]["project_update_type"]
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "project_tenders"
            referencedColumns: ["tender_id"]
          },
          {
            foreignKeyName: "project_updates_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_allocated: number | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          end_date: string | null
          id: string
          project_type_id: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget_allocated?: number | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          project_type_id?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget_allocated?: number | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          project_type_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tender_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      tenders: {
        Row: {
          budget_max: number
          budget_min: number
          category_id: string | null
          created_at: string
          created_by: string | null
          current_status: Json | null
          description: string | null
          document_urls: Json | null
          eligibility_criteria: Json | null
          end_date: string
          evaluation_criteria: Json | null
          id: string
          project_id: string | null
          project_type_id: string | null
          required_specifications: Json | null
          shortlist_automatically: boolean | null
          shortlist_threshold: number | null
          start_date: string
          status: Database["public"]["Enums"]["tender_status"] | null
          title: string
          updated_at: string
          winning_bid_id: string | null
        }
        Insert: {
          budget_max: number
          budget_min: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          current_status?: Json | null
          description?: string | null
          document_urls?: Json | null
          eligibility_criteria?: Json | null
          end_date: string
          evaluation_criteria?: Json | null
          id?: string
          project_id?: string | null
          project_type_id?: string | null
          required_specifications?: Json | null
          shortlist_automatically?: boolean | null
          shortlist_threshold?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["tender_status"] | null
          title: string
          updated_at?: string
          winning_bid_id?: string | null
        }
        Update: {
          budget_max?: number
          budget_min?: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          current_status?: Json | null
          description?: string | null
          document_urls?: Json | null
          eligibility_criteria?: Json | null
          end_date?: string
          evaluation_criteria?: Json | null
          id?: string
          project_id?: string | null
          project_type_id?: string | null
          required_specifications?: Json | null
          shortlist_automatically?: boolean | null
          shortlist_threshold?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["tender_status"] | null
          title?: string
          updated_at?: string
          winning_bid_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tender_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_tenders"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "tenders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenders_winning_bid_id_fkey"
            columns: ["winning_bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      project_tenders: {
        Row: {
          budget_allocated: number | null
          budget_max: number | null
          budget_min: number | null
          department: string | null
          end_date: string | null
          project_id: string | null
          project_title: string | null
          start_date: string | null
          tender_description: string | null
          tender_id: string | null
          tender_status: Database["public"]["Enums"]["tender_status"] | null
          tender_title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      appeal_status: "pending" | "under_review" | "approved" | "rejected"
      bid_status:
        | "submitted"
        | "under_review"
        | "shortlisted"
        | "selected"
        | "rejected"
      milestone_status: "pending" | "in_progress" | "completed" | "delayed"
      project_role: "project_admin" | "project_member"
      project_update_type: "progress" | "budget" | "economic" | "milestone"
      tender_status:
        | "draft"
        | "pending_review"
        | "active"
        | "under_evaluation"
        | "awarded"
        | "cancelled"
        | "closed"
      test_result_status: "passed" | "failed" | "pending"
      user_role: "government" | "bidder" | "public"
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
      appeal_status: ["pending", "under_review", "approved", "rejected"],
      bid_status: [
        "submitted",
        "under_review",
        "shortlisted",
        "selected",
        "rejected",
      ],
      milestone_status: ["pending", "in_progress", "completed", "delayed"],
      project_role: ["project_admin", "project_member"],
      project_update_type: ["progress", "budget", "economic", "milestone"],
      tender_status: [
        "draft",
        "pending_review",
        "active",
        "under_evaluation",
        "awarded",
        "cancelled",
        "closed",
      ],
      test_result_status: ["passed", "failed", "pending"],
      user_role: ["government", "bidder", "public"],
    },
  },
} as const
