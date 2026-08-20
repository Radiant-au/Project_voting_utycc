'use client';

import { useEffect, useState } from 'react';
import { Trophy, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase/admin-client';
import { Button } from '../../components/ui';
import { AdminShell, PageIntro, SettingsCard, Toggle } from '../../components/admin';

const defaults = { is_open: true, student_points: 1, teacher_points: 2, visitor_points: 3 };

export function AdminSettings() {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOpen, setSavingOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      const { data, error: loadError } = await supabase.from('voting_settings').select('is_open,student_points,teacher_points,visitor_points').eq('id', true).maybeSingle();
      setLoading(false);
      if (loadError || !data) return setError(loadError?.message || 'Voting settings were not found. Apply the latest Supabase migration.');
      setSettings(data);
    })();
  }, []);

  const saveOpenState = async (isOpen: boolean) => {
    const previous = settings.is_open;
    setSettings((current) => ({ ...current, is_open: isOpen }));
    setSavingOpen(true);
    setSavedOpen(false);
    setError('');
    const { error: saveError } = await supabase.from('voting_settings').update({ is_open: isOpen }).eq('id', true);
    setSavingOpen(false);
    if (saveError) {
      setSettings((current) => ({ ...current, is_open: previous }));
      return setError(saveError.message);
    }
    setSavedOpen(true);
  };

  const save = async () => {
    if (Object.values(settings).some((value) => typeof value === 'number' && (!Number.isInteger(value) || value < 1 || value > 100))) return setError('Point values must be whole numbers from 1 to 100.');
    setSaving(true);
    setError('');
    const { error: saveError } = await supabase.from('voting_settings').update({ student_points: settings.student_points, teacher_points: settings.teacher_points, visitor_points: settings.visitor_points, is_open: settings.is_open }).eq('id', true);
    setSaving(false);
    if (saveError) setError(saveError.message);
  };

  const setPoints = (key: 'student_points' | 'teacher_points' | 'visitor_points', value: string) => setSettings((current) => ({ ...current, [key]: Number(value) }));

  return <AdminShell title="Settings"><PageIntro eyebrow="Voting controls" title="Voting settings" />{loading ? <p className="text-sm text-muted-foreground">Loading settings…</p> : <div className="grid max-w-3xl gap-5"><SettingsCard icon={<Zap />} title="Voting"><Toggle label="Voting is open" checked={settings.is_open} onChange={() => void saveOpenState(!settings.is_open)} /><p className="mt-3 text-xs text-muted-foreground" role="status">{savingOpen ? 'Saving voting status…' : savedOpen ? 'Voting status saved.' : 'Voters fetch this status before voting.'}</p></SettingsCard><SettingsCard icon={<Trophy />} title="Point system"><p className="text-sm text-muted-foreground">The database calculates every vote with these values. Voters cannot choose a score.</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{([['student_points', 'Student'], ['teacher_points', 'Teacher'], ['visitor_points', 'Visitor']] as const).map(([key, label]) => <label key={key} className="text-sm font-bold">{label}<input type="number" min="1" max="100" step="1" value={settings[key]} onChange={(event) => setPoints(key, event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3" /></label>)}</div><Button className="mt-4" disabled={saving || savingOpen} onClick={() => void save()}>{saving ? 'Saving…' : 'Save voting settings'}</Button></SettingsCard></div>}{error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive" role="alert">{error}</p>}</AdminShell>;
}
