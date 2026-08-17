'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronLeft, ShieldCheck } from 'lucide-react';
import { categoryLabels } from '../../data/data';
import { mockServices } from '../../data/services';
import type { VoterCategory } from '../../data/types';
import { Button, CategoryCard, Modal, Toast, VoterHeader, useToastMessage } from '../../components/ui';

export function ChooseCategoryPage() {
  const router = useRouter(); const [selected, setSelected] = useState<VoterCategory | ''>(''); const [confirm, setConfirm] = useState(false); const { message, clear } = useToastMessage();
  const save = async () => { if (!selected) return; await mockServices.saveVoterCategory(selected); router.push('/projects'); };
  return <main className="page-shell paper-grain"><VoterHeader /><div className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6 sm:pt-14"><div className="animate-in"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground" data-testid="link-back-home"><ChevronLeft size={16} /> Back</Link><span className="mb-3 block text-xs font-bold uppercase tracking-[.2em] text-primary">Step 1 of 2</span><h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">How are you joining us?</h1><p className="mt-3 max-w-lg leading-6 text-muted-foreground">Your perspective shapes the exhibition. Choose the category that best describes you today.</p><div className="mt-8 space-y-3">{(['student','teacher','visitor'] as VoterCategory[]).map(c => <CategoryCard key={c} category={c} selected={selected === c} onClick={() => setSelected(c)} />)}</div><Button onClick={() => selected && setConfirm(true)} disabled={!selected} className="mt-6 w-full">Continue <ChevronDown size={16} className="-rotate-90" /></Button><p className="mt-5 text-center text-xs text-muted-foreground">You can vote once. Category point values help make every voice count.</p></div></div>{confirm && selected && <Modal onClose={() => setConfirm(false)}><div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck /></div><h2 className="mt-5 font-display text-2xl font-bold">Confirm your category</h2><p className="mt-2 leading-6 text-muted-foreground">You selected <strong className="text-foreground">{categoryLabels[selected]}</strong>. Please make sure this is correct before continuing.</p><div className="mt-6 grid grid-cols-2 gap-3"><Button variant="quiet" onClick={() => setConfirm(false)}>Go back</Button><Button onClick={save}>Confirm category</Button></div></Modal>}{message && <Toast message={message} onClose={clear} />}</main>;
}
