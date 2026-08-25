import 'server-only';
import { unstable_cache } from 'next/cache';
import { projectFallbackImage } from '@/features/exhibition/data/project-images';
import type { Project } from '@/features/exhibition/data/types';
import { getVoterSupabase } from '@/lib/supabase/voter-server';

type ProjectRow = DatabaseRow<'projects'>;
type DatabaseRow<T extends keyof import('@/lib/supabase/database.types').Database['public']['Tables']> = import('@/lib/supabase/database.types').Database['public']['Tables'][T]['Row'];

export const publicProject = (row: ProjectRow): Project => ({
  id: row.id,
  title: row.title,
  shortDescription: row.short_description,
  category: row.category,
  teamName: row.team_name,
  imageUrl: row.image_url || projectFallbackImage(row.id),
  isActive: row.is_active,
  isArchived: false,
  features: row.features,
});

const columns = 'id,title,short_description,category,team_name,image_url,features,is_active,created_at' as const;

export const getProjects = unstable_cache(async () => {
  const { data, error } = await getVoterSupabase().from('projects').select(columns).eq('is_active', true).order('created_at').limit(100);
  if (error) throw error;
  return (data as ProjectRow[]).map(publicProject);
}, ['public-voter-projects'], { revalidate: 30 });

export async function getProject(id: string) {
  const { data, error } = await getVoterSupabase().from('projects').select(columns).eq('id', id).eq('is_active', true).maybeSingle();
  if (error) throw error;
  return data ? publicProject(data as ProjectRow) : null;
}
