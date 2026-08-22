'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/admin-client';
import { AdminShell, PageIntro } from '../../components/admin';
import { Button } from '../../components/ui';
import type { VoterCategory } from '../../data/types';

type CodeStatus = 'unused' | 'used' | 'disabled';
interface VotingCode { id: string; code: string; category: VoterCategory; status: CodeStatus; created_at: string; used_at: string | null }

const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN?.replace(/\/$/, '');

export function AdminCodesPage() {
  const [codes, setCodes] = useState<VotingCode[]>([]);
  const [category, setCategory] = useState<VoterCategory>('visitor');
  const [count, setCount] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    const { data, error: rpcError } = await supabase.rpc('list_voting_codes', {
      input_category: categoryFilter || null,
      input_status: statusFilter || null,
    });
    if (rpcError) { setError(rpcError.message); return; }
    setCodes((data ?? []) as VotingCode[]);
  }, [categoryFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setBusy(true); setError('');
    const { error: rpcError } = await supabase.rpc('generate_voting_codes', { input_category: category, input_count: count });
    setBusy(false);
    if (rpcError) { setError(rpcError.message); return; }
    await load();
  };

  const disable = async (code: string) => {
    if (!window.confirm(`Disable unused code ${code}?`)) return;
    const { data, error: rpcError } = await supabase.rpc('disable_voting_code', { input_code: code });
    if (rpcError || !data) { setError(rpcError?.message ?? 'Only unused codes can be disabled.'); return; }
    await load();
  };

  const visitorCodes = codes.filter((item) => item.category === 'visitor');
  const printable = visitorCodes.filter((item) => selected.has(item.code));
  const allVisitorsSelected = visitorCodes.length > 0 && visitorCodes.every((item) => selected.has(item.code));
  const toggleAllVisitors = () => setSelected((current) => {
    const next = new Set(current);
    for (const item of visitorCodes) allVisitorsSelected ? next.delete(item.code) : next.add(item.code);
    return next;
  });
  const downloadVisitorPdf = async () => {
    if (!siteOrigin || !printable.length) return;
    setGeneratingPdf(true); setError('');
    try {
      const template = await fetch('/Visitor_frame.pdf');
      if (!template.ok) throw new Error('Visitor PDF template is unavailable.');
      const { generateVisitorPassPdf } = await import('@/lib/visitor-pass-pdf');
      const bytes = await generateVisitorPassPdf(await template.arrayBuffer(), printable.map((item) => item.code), siteOrigin);
      const url = URL.createObjectURL(new Blob([bytes.slice().buffer], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url; link.download = 'visitor-passes.pdf'; document.body.append(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    } catch {
      setError('Could not generate the visitor pass PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return <AdminShell title="Voting codes"><div><PageIntro eyebrow="Secure access" title="Voting codes" /><section className="rounded-2xl border border-border bg-card p-5"><div className="grid gap-3 sm:grid-cols-4"><select value={category} onChange={(event) => setCategory(event.target.value as VoterCategory)} className="rounded-xl border border-border bg-background p-3"><option value="student">Student</option><option value="teacher">Teacher</option><option value="visitor">Visitor</option></select><input type="number" min="1" max="100" value={count} onChange={(event) => setCount(Number(event.target.value))} className="rounded-xl border border-border bg-background p-3" aria-label="Number of codes" /><Button disabled={busy || count < 1 || count > 100} onClick={generate}>{busy ? 'Generating…' : 'Generate codes'}</Button>{printable.length > 0 && <Button variant="outline" disabled={!siteOrigin || generatingPdf} onClick={downloadVisitorPdf}>{generatingPdf ? 'Generating PDF…' : `Download ${printable.length} visitor passes`}</Button>}</div>{!siteOrigin && <p className="mt-3 text-sm text-destructive">Set NEXT_PUBLIC_SITE_ORIGIN before downloading visitor passes.</p>}</section><div className="mt-5 flex flex-wrap gap-3"><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-border bg-card p-3"><option value="">All categories</option><option value="student">Student</option><option value="teacher">Teacher</option><option value="visitor">Visitor</option></select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-border bg-card p-3"><option value="">All statuses</option><option value="unused">Unused</option><option value="used">Used</option><option value="disabled">Disabled</option></select><Button variant="outline" disabled={!visitorCodes.length} onClick={toggleAllVisitors}>{allVisitorsSelected ? `Clear ${visitorCodes.length} visitors` : `Select all ${visitorCodes.length} visitors`}</Button></div>{error && <p className="mt-4 text-destructive" role="alert">{error}</p>}<div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border"><th className="p-4">PDF</th><th className="p-4">Code</th><th className="p-4">Category</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{codes.map((item) => <tr key={item.id} className="border-b border-border last:border-0"><td className="p-4"><input type="checkbox" aria-label={`Select ${item.code} for PDF`} disabled={item.category !== 'visitor'} checked={selected.has(item.code)} onChange={() => setSelected((current) => { const next = new Set(current); next.has(item.code) ? next.delete(item.code) : next.add(item.code); return next; })} /></td><td className="p-4 font-mono font-bold">{item.code}</td><td className="p-4 capitalize">{item.category}</td><td className="p-4 capitalize">{item.status}</td><td className="p-4">{item.status === 'unused' && <button className="font-bold text-destructive" type="button" onClick={() => disable(item.code)}>Disable</button>}</td></tr>)}</tbody></table></div></div></AdminShell>;
}
