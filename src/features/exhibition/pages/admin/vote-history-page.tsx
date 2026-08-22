'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase/admin-client';
import { AdminShell, PageIntro } from '../../components/admin';
import { Button } from '../../components/ui';

type HistoryRow = { voting_code_id: string; code: string; category: string; status: string; vote_id: string | null; voted_at: string | null; project_id: string | null; project_title: string | null };

export function AdminVoteHistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const { data, error: rpcError } = await supabase.rpc('list_code_vote_history', {
      input_query: query.trim() || null,
      input_category: category || null,
      input_status: status || null,
    });
    setRows((data ?? []) as HistoryRow[]);
    setError(rpcError ? 'Could not load vote history. Check Supabase and try again.' : '');
    setLoading(false);
  }, [query, category, status]);

  useEffect(() => { void load(); }, [load]);

  return <AdminShell title="Vote history">
    <PageIntro eyebrow="Code audit" title="Code vote history" action={<Button variant="quiet" onClick={() => void load()} disabled={loading}><RefreshCw size={16} /> Refresh</Button>} />
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1fr_12rem_12rem]">
        <label className="relative"><Search className="absolute left-3 top-3 text-muted-foreground" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search code or project" className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm" /></label>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm"><option value="">All categories</option><option value="student">Student</option><option value="teacher">Teacher</option><option value="visitor">Visitor</option></select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm"><option value="">All statuses</option><option value="unused">Unused</option><option value="used">Used</option><option value="disabled">Disabled</option></select>
      </div>
      {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive" role="alert">{error}</p>}
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-border text-xs uppercase text-muted-foreground"><tr><th className="pb-3">Code</th><th className="pb-3">Category</th><th className="pb-3">Status</th><th className="pb-3">Voted project</th><th className="pb-3">Voted at</th></tr></thead><tbody>{rows.map((row) => <tr key={row.voting_code_id} className="border-b border-border last:border-0"><td className="py-3 font-mono font-bold">{row.code}</td><td className="py-3 capitalize">{row.category}</td><td className="py-3 capitalize">{row.status}</td><td className="py-3 font-semibold">{row.project_title ?? (row.status === 'used' ? 'Vote unavailable' : '—')}</td><td className="py-3">{row.voted_at ? new Date(row.voted_at).toLocaleString() : '—'}</td></tr>)}</tbody></table></div>
      {!loading && !error && rows.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No code history matches these filters.</p>}
      {loading && <p className="py-10 text-center text-sm text-muted-foreground">Loading vote history…</p>}
    </section>
  </AdminShell>;
}
