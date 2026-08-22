export type Database = {
  public: {
    Tables: {
      votes: {
        Row: { category: string; created_at: string; id: string; points: number; project_id: string; voting_code_id: string };
        Insert: { category: string; created_at?: string; id?: string; points: number; project_id: string; voting_code_id: string };
        Update: { category?: string; created_at?: string; id?: string; points?: number; project_id?: string; voting_code_id?: string };
        Relationships: [
          { foreignKeyName: 'votes_project_id_fkey'; columns: ['project_id']; isOneToOne: false; referencedRelation: 'projects'; referencedColumns: ['id'] },
          { foreignKeyName: 'votes_voting_code_id_fkey'; columns: ['voting_code_id']; isOneToOne: true; referencedRelation: 'voting_codes'; referencedColumns: ['id'] },
        ];
      };
      voting_codes: {
        Row: { category: string; code: string; created_at: string; id: string; status: string; used_at: string | null };
        Insert: { category: string; code: string; created_at?: string; id?: string; status?: string; used_at?: string | null };
        Update: { category?: string; code?: string; created_at?: string; id?: string; status?: string; used_at?: string | null };
        Relationships: [];
      };
      projects: {
        Row: { category: 'Information Science' | 'Computer Engineering' | 'Electronic Engineering' | 'Precision Engineering' | 'Advanced Material Engineering'; created_at: string; features: string[]; full_description: string; hidden_project_code: string; id: string; image_url: string; is_active: boolean; project_number: string; short_description: string; team_name: string; title: string };
        Insert: { category: 'Information Science' | 'Computer Engineering' | 'Electronic Engineering' | 'Precision Engineering' | 'Advanced Material Engineering'; created_at?: string; features?: string[]; full_description: string; hidden_project_code: string; id: string; image_url: string; is_active?: boolean; project_number: string; short_description: string; team_name: string; title: string };
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
        Relationships: [];
      };
      voter_rate_limits: {
        Row: { action: string; attempts: number; expires_at: string; fingerprint: string; window_started_at: string };
        Insert: { action: string; attempts?: number; expires_at: string; fingerprint: string; window_started_at: string };
        Update: Partial<Database['public']['Tables']['voter_rate_limits']['Row']>;
        Relationships: [];
      };
      voting_settings: {
        Row: { id: boolean; is_open: boolean; results_revealed: boolean; student_points: number; teacher_points: number; visitor_points: number; updated_at: string };
        Insert: { id?: boolean; is_open?: boolean; results_revealed?: boolean; student_points?: number; teacher_points?: number; visitor_points?: number; updated_at?: string };
        Update: { is_open?: boolean; results_revealed?: boolean; student_points?: number; teacher_points?: number; visitor_points?: number; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      disable_voting_code: { Args: { input_code: string }; Returns: boolean };
      generate_voting_codes: { Args: { input_category: string; input_count: number }; Returns: Database['public']['Tables']['voting_codes']['Row'][] };
      is_voting_admin: { Args: Record<string, never>; Returns: boolean };
      list_voting_codes: { Args: { input_category?: string | null; input_status?: string | null }; Returns: Database['public']['Tables']['voting_codes']['Row'][] };
      list_code_vote_history: { Args: { input_query?: string | null; input_category?: string | null; input_status?: string | null }; Returns: { voting_code_id: string; code: string; category: string; status: string; vote_id: string | null; voted_at: string | null; project_id: string | null; project_title: string | null }[] };
      submit_vote: { Args: { input_code: string; input_project_id: string }; Returns: { result: string; vote_id: string | null }[] };
      verify_voting_code: { Args: { input_code: string }; Returns: { category: string | null; result: string }[] };
      verify_voter_code: { Args: { input_code: string }; Returns: { category: string; has_voted: boolean; voting_code_id: string }[] };
      check_voter_rate_limit: { Args: { input_action: string; input_fingerprint: string }; Returns: { allowed: boolean; retry_after: number }[] };
      submit_voter_vote: { Args: { input_project_id: string; input_voting_code_id: string }; Returns: { result: string; vote_id: string | null }[] };
      admin_live_top_projects: { Args: Record<string, never>; Returns: { rank: number; hidden_project_code: string; category: string; image_url: string; team_name: string; title: string; total_points: number }[] };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
