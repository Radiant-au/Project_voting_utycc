export type Database = {
  public: {
    Tables: {
      votes: {
        Row: { category: string; created_at: string; id: string; project_id: string; voting_code_id: string };
        Insert: { category: string; created_at?: string; id?: string; project_id: string; voting_code_id: string };
        Update: { category?: string; created_at?: string; id?: string; project_id?: string; voting_code_id?: string };
        Relationships: [];
      };
      voting_codes: {
        Row: { category: string; code: string; created_at: string; id: string; status: string; used_at: string | null };
        Insert: { category: string; code: string; created_at?: string; id?: string; status?: string; used_at?: string | null };
        Update: { category?: string; code?: string; created_at?: string; id?: string; status?: string; used_at?: string | null };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      disable_voting_code: { Args: { input_code: string }; Returns: boolean };
      generate_voting_codes: { Args: { input_category: string; input_count: number }; Returns: Database['public']['Tables']['voting_codes']['Row'][] };
      is_voting_admin: { Args: Record<string, never>; Returns: boolean };
      list_voting_codes: { Args: { input_category?: string | null; input_status?: string | null }; Returns: Database['public']['Tables']['voting_codes']['Row'][] };
      submit_vote: { Args: { input_code: string; input_project_id: string }; Returns: { result: string; vote_id: string | null }[] };
      verify_voting_code: { Args: { input_code: string }; Returns: { category: string | null; result: string }[] };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
