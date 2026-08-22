'use client';

import { useEffect, useState } from 'react';
import { Eye, Trophy, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase/admin-client';
import { Button } from '../../components/ui';
import { AdminShell, PageIntro, SettingsCard, Toggle } from '../../components/admin';

const defaults = { is_open: true, results_revealed: false, student_points: 1, teacher_points: 2, visitor_points: 3 };
type ToggleKey = 'is_open' | 'results_revealed';

export function AdminSettings() {
  const [settings, setSettings] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingToggle, setSavingToggle] = useState<ToggleKey | null>(null);
  const [savedToggle, setSavedToggle] = useState<ToggleKey | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      const { data, error: loadError } = await supabase.from('voting_settings').select('is_open,results_revealed,student_points,teacher_points,visitor_points').eq('id', true).maybeSingle();
      setLoading(false);
      if (loadError || !data) return setError(loadError?.message || 'Voting settings were not found. Apply the latest Supabase migration.');
      setSettings(data);
    })();
  }, []);

  const saveToggle = async (key: ToggleKey, value: boolean) => {
    const previous = settings[key];
    setSettings((current) => ({ ...current, [key]: value }));
    setSavingToggle(key);
    setSavedToggle(null);
    setError('');
    const update = key === 'is_open' ? { is_open: value } : { results_revealed: value };
    const { error: saveError } = await supabase.from('voting_settings').update(update).eq('id', true);
    setSavingToggle(null);
    if (saveError) {
      setSettings((current) => ({ ...current, [key]: previous }));
      return setError(saveError.message);
    }
    setSavedToggle(key);
  };

  const save = async () => {
    if (Object.values(settings).some((value) => typeof value === 'number' && (!Number.isInteger(value) || value < 1 || value > 100))) return setError('Point values must be whole numbers from 1 to 100.');
    setSaving(true);
    setError('');
    const { error: saveError } = await supabase.from('voting_settings').update({ student_points: settings.student_points, teacher_points: settings.teacher_points, visitor_points: settings.visitor_points }).eq('id', true);
    setSaving(false);
    if (saveError) setError(saveError.message);
  };

  const setPoints = (key: 'student_points' | 'teacher_points' | 'visitor_points', value: string) => setSettings((current) => ({ ...current, [key]: Number(value) }));

  return <AdminShell title="Settings"><PageIntro eyebrow="Voting controls" title="Voting settings" />{loading ? <p className="text-sm text-muted-foreground">Loading settings…</p> : <div className="grid max-w-3xl gap-5"><SettingsCard icon={<Zap />} title="Voting"><Toggle label="Voting is open" checked={settings.is_open} onChange={() => void saveToggle('is_open', !settings.is_open)} /><p className="mt-3 text-xs text-muted-foreground" role="status">{savingToggle === 'is_open' ? 'Saving voting status…' : savedToggle === 'is_open' ? 'Voting status saved.' : 'Voters fetch this status before voting.'}</p></SettingsCard><SettingsCard icon={<Eye />} title="Live results reveal"><Toggle label="Reveal project details" checked={settings.results_revealed} onChange={() => void saveToggle('results_revealed', !settings.results_revealed)} /><p className="mt-3 text-xs text-muted-foreground" role="status">{savingToggle === 'results_revealed' ? 'Updating live display…' : savedToggle === 'results_revealed' ? 'Live display updated.' : 'The live display updates immediately through Supabase Realtime.'}</p></SettingsCard><SettingsCard icon={<Trophy />} title="Point system"><p className="text-sm text-muted-foreground">The database calculates every vote with these values. Voters cannot choose a score.</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{([['student_points', 'Student'], ['teacher_points', 'Teacher'], ['visitor_points', 'Visitor']] as const).map(([key, label]) => <label key={key} className="text-sm font-bold">{label}<input type="number" min="1" max="100" step="1" value={settings[key]} onChange={(event) => setPoints(key, event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-3" /></label>)}</div><Button className="mt-4" disabled={saving || savingToggle !== null} onClick={() => void save()}>{saving ? 'Saving…' : 'Save voting settings'}</Button></SettingsCard></div>}{error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive" role="alert">{error}</p>}</AdminShell>;
}
