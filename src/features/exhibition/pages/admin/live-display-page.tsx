'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Radio, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase/admin-client';
import { AdminShell } from '../../components/admin';
import { cx } from '../../components/ui';
import { projectImageForCode } from '../../data/project-images';

type LiveRow = { rank: number; hidden_project_code: string; category: string; total_points: number };

export function AdminLiveDisplay() {
  const [rows, setRows] = useState<LiveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connection, setConnection] = useState<'connecting' | 'live' | 'disconnected'>('connecting');
  const [fullscreen, setFullscreen] = useState(false);
  const displayRef = useRef<HTMLElement>(null);

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase.rpc('admin_live_top_projects');
    if (loadError) return setError(loadError.code === '42883' || loadError.message.includes('admin_live_top_projects') ? 'Database update required: apply supabase/migrations/20260820140000_hidden_project_codes_live_results.sql, then refresh.' : 'Live results are unavailable. Check the latest database migration.');
    setRows(data ?? []); setError('');
  }, []);

  useEffect(() => {
    void load().finally(() => setLoading(false));
    const channel = supabase.channel('admin-live-results').on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => void load()).subscribe((status) => {
      setConnection(status === 'SUBSCRIBED' ? 'live' : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' ? 'disconnected' : 'connecting');
    });
    return () => { void supabase.removeChannel(channel); };
  }, [load]);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === displayRef.current);
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) return document.exitFullscreen();
    await displayRef.current?.requestFullscreen();
  };

  return <AdminShell title="Live display"><main ref={displayRef} className={cx('-mx-4 -mb-8 min-h-[calc(100dvh-4rem)] bg-[#071126] px-4 py-6 text-white sm:-mx-8 sm:px-8 sm:py-10', fullscreen && 'm-0 h-[100dvh] overflow-auto')}><div className="mx-auto flex min-h-full max-w-[1500px] flex-col"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.22em] text-[#69e6ff]"><Radio size={15} className={cx(connection === 'live' && 'animate-pulse')} /> Live results</p><h2 className="mt-2 font-display text-[clamp(2rem,5vw,4.5rem)] leading-none tracking-[-.04em]">Top five projects</h2><p className="mt-3 max-w-xl text-sm text-[#9eabc8]">Presentation board · weighted votes · updates automatically</p></div><div className="flex flex-wrap items-center justify-end gap-2"><button type="button" onClick={() => void toggleFullscreen()} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#aeb9d4] hover:border-[#69e6ff]/50 hover:text-white" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} data-testid="toggle-live-fullscreen">{fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button><div className={cx('rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[.12em]', connection === 'live' ? 'border-[#69e6ff]/30 bg-[#69e6ff]/10 text-[#a9f1ff]' : connection === 'disconnected' ? 'border-rose-300/30 bg-rose-300/10 text-rose-200' : 'border-white/15 bg-white/5 text-[#aeb9d4]')}>{connection === 'live' ? 'Live connection' : connection === 'disconnected' ? 'Updates disconnected' : 'Connecting…'}</div></div></header>{loading ? <div className="mt-10 grid gap-4 lg:grid-cols-5">{[1,2,3,4,5].map((item) => <div key={item} className="h-64 animate-pulse rounded-[1.5rem] bg-white/10" />)}</div> : error && !rows.length ? <section className="mt-10 rounded-[1.5rem] border border-rose-300/20 bg-rose-300/10 p-8 text-center"><h3 className="font-display text-3xl font-bold">Live board unavailable</h3><p className="mt-2 text-sm text-rose-100/80">{error}</p></section> : rows.length ? <div className={cx('mt-10 grid gap-4 lg:grid-cols-5', fullscreen && 'lg:auto-rows-fr')}>
    {rows.map((row) => <article key={row.hidden_project_code} className={cx('relative overflow-hidden rounded-[1.5rem] border shadow-2xl transition motion-reduce:transition-none', fullscreen && 'lg:min-h-[30rem]', row.rank === 1 ? 'border-[#e9b84c]/60 bg-[linear-gradient(145deg,#25334d,#17243d)] shadow-[#e9b84c]/10' : 'border-white/15 bg-white/[.06]')}><img src={projectImageForCode(row.hidden_project_code)} alt="" className="h-36 w-full object-cover sm:h-44" /><div className="p-5 sm:p-6"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9b84c] font-display text-2xl font-bold text-[#18243b]">{row.rank}</span><div className="mt-8"><p className="break-all font-mono text-[clamp(1.7rem,3.5vw,3.4rem)] font-bold leading-none text-[#69e6ff]">{row.hidden_project_code}</p><div className="mt-8 flex items-end justify-between gap-2 border-t border-white/15 pt-4"><span className="text-xs uppercase tracking-[.12em] text-[#9eabc8]">Points</span><strong className="font-display text-4xl">{row.total_points}</strong></div></div></div>{row.rank === 1 && <Trophy className="absolute right-5 top-5 text-[#e9b84c]" size={24} />}</article>)}</div> : <section className="mt-10 rounded-[1.5rem] border border-white/15 bg-white/[.06] p-10 text-center"><Trophy className="mx-auto text-[#e9b84c]" size={34} /><h3 className="mt-4 font-display text-3xl font-bold">Waiting for the first vote</h3><p className="mt-2 text-sm text-[#9eabc8]">The top five will appear here as votes are recorded.</p></section>}{error && rows.length > 0 && <p className="mt-4 text-center text-xs text-rose-200">{error}</p>}</div></main></AdminShell>;
}
