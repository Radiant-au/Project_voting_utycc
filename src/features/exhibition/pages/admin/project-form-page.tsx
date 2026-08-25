'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ImagePlus } from 'lucide-react';
import { projectFallbackImage } from '../../data/project-images';
import { isProjectCategory, projectCategories, type ProjectCategory } from '../../data/project-categories';
import { supabase } from '@/lib/supabase/admin-client';
import { Button, Toast, useToastMessage } from '../../components/ui';
import { AdminShell, Field, PageIntro } from '../../components/admin';

const emptyForm = { hiddenCode: '', title: '', short: '', team: '', category: projectCategories[0] as ProjectCategory, image: '' };

export function ProjectForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { notify, message, clear } = useToastMessage();
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!id) return;
    void (async () => {
      const { data, error: loadError } = await supabase.from('projects').select('hidden_project_code,title,short_description,team_name,category,image_url').eq('id', id).maybeSingle();
      setLoading(false);
      if (loadError || !data) return setError(loadError?.code === '42703' || loadError?.message.includes('hidden_project_code') ? 'Database update required: apply supabase/migrations/20260820140000_hidden_project_codes_live_results.sql, then refresh.' : loadError?.message || 'Project not found.');
      setForm({ hiddenCode: data.hidden_project_code, title: data.title, short: data.short_description, team: data.team_name, category: isProjectCategory(data.category) ? data.category : projectCategories[0], image: data.image_url || projectFallbackImage(id) });
    })();
  }, [id]);

  const submit = async (publish: boolean) => {
    const required = ['hiddenCode', 'title', 'short', 'team'];
    const missing = Object.entries(form).filter(([key, value]) => required.includes(key) && !value.trim()).map(([key]) => key);
    if (missing.length) return setErrors(missing);
    setErrors([]); setSaving(true); setError('');
    if (!isProjectCategory(form.category)) return setError('Choose a valid project category.');
    const project = { hidden_project_code: form.hiddenCode.trim().toUpperCase(), title: form.title.trim(), short_description: form.short.trim(), team_name: form.team.trim(), category: form.category, image_url: form.image || projectFallbackImage(), is_active: publish };
    const result = id ? await supabase.from('projects').update(project).eq('id', id) : await supabase.from('projects').insert({ ...project, features: [] });
    setSaving(false);
    if (result.error) return setError(result.error.code === '23505' ? 'That hidden project code is already in use.' : result.error.code === '42703' || result.error.message.includes('hidden_project_code') ? 'Database update required: apply supabase/migrations/20260820140000_hidden_project_codes_live_results.sql, then refresh.' : result.error.message);
    notify(publish ? 'Project published.' : 'Project saved as archived.');
    router.push('/utyccadmin/projects');
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true); setError('');
    const { data: { session } } = await supabase.auth.getSession();
    const body = new FormData(); body.set('file', file);
    const response = await fetch('/api/admin/project-image', { method: 'POST', headers: session ? { Authorization: `Bearer ${session.access_token}` } : {}, body });
    const result = await response.json().catch(() => ({}));
    setUploading(false);
    if (!response.ok || typeof result.url !== 'string') return setError(result.error || 'Could not upload this image.');
    update('image', result.url);
  };

  return <AdminShell title={id ? 'Edit project' : 'New project'}><PageIntro eyebrow="Project catalogue" title={id ? `Edit ${form.title || 'project'}` : 'Add a project'} />{loading ? <p className="text-sm text-muted-foreground">Loading project…</p> : <div className="grid gap-5 lg:grid-cols-[1fr_360px]"><div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"><div className="grid gap-5 sm:grid-cols-2"><Field label="Hidden project code" value={form.hiddenCode} error={errors.includes('hiddenCode')} onChange={value => update('hiddenCode', value)} placeholder="PC013" /><Field label="Team name" value={form.team} error={errors.includes('team')} onChange={value => update('team', value)} placeholder="The Makers" /><Field label="Project title" value={form.title} error={errors.includes('title')} onChange={value => update('title', value)} placeholder="A memorable title" wide /><Field label="Category" value={form.category} onChange={value => update('category', value)} select wide /><Field label="Short description" value={form.short} error={errors.includes('short')} onChange={value => update('short', value)} textarea wide max={180} /></div><div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-5"><Button variant="quiet" onClick={() => router.push('/utyccadmin/projects')}>Cancel</Button><Button variant="outline" disabled={saving} onClick={() => void submit(false)}>Save draft</Button><Button disabled={saving} onClick={() => void submit(true)}>{saving ? 'Saving…' : 'Publish project'}</Button></div></div><div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm font-bold">Project image</p><div className="mt-3 overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted">{form.image ? <img src={form.image} alt="Project preview" className="aspect-[1.5] w-full object-cover" /> : <div className="grid aspect-[1.5] place-items-center text-center text-sm text-muted-foreground"><ImagePlus className="mx-auto mb-2 text-primary" />Choose a project image</div>}</div><p className="mt-3 text-xs leading-5 text-muted-foreground">JPG, PNG or WEBP · up to 5 MB.</p><input className="mt-4 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={event => void upload(event.target.files?.[0])} /><Button variant="outline" className="mt-4 w-full" disabled={uploading} onClick={() => update('image', projectFallbackImage())}>{uploading ? 'Uploading…' : 'Use Unsplash fallback'}</Button></div></div>}{(errors.length > 0 || error) && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive" role="alert">{error || 'Please complete the highlighted required fields.'}</p>}{message && <Toast message={message} onClose={clear} />}</AdminShell>;
}

export function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  return <ProjectForm id={id} />;
}
