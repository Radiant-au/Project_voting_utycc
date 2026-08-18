import 'server-only';
import { projects as fallbackProjects } from '@/features/exhibition/data/data';
import type { Project } from '@/features/exhibition/data/types';
import { getVoterSupabase } from '@/lib/supabase/voter-server';

type ProjectRow = DatabaseRow<'projects'>;
type DatabaseRow<T extends keyof import('@/lib/supabase/database.types').Database['public']['Tables']> = import('@/lib/supabase/database.types').Database['public']['Tables'][T]['Row'];

const fallbackImage = (id: string) => fallbackProjects.find((project) => project.id === id)?.imageUrl ?? '';
export const publicProject = (row: ProjectRow): Project => ({
  id: row.id,
  projectNumber: row.project_number,
  title: row.title,
  shortDescription: row.short_description,
  fullDescription: row.full_description,
  category: row.category,
  teamName: row.team_name,
  imageUrl: row.image_url || fallbackImage(row.id),
  isActive: row.is_active,
  isArchived: false,
  features: row.features,
});

const columns = 'id,project_number,title,short_description,full_description,category,team_name,image_url,features,is_active,created_at' as const;

export async function getProjects() {
  const { data, error } = await getVoterSupabase().from('projects').select(columns).eq('is_active', true).order('project_number').limit(100);
  if (error) throw error;
  return (data as ProjectRow[]).map(publicProject);
}

export async function getProject(id: string) {
  const { data, error } = await getVoterSupabase().from('projects').select(columns).eq('id', id).eq('is_active', true).maybeSingle();
  if (error) throw error;
  return data ? publicProject(data as ProjectRow) : null;
}

