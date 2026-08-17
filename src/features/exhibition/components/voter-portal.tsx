'use client';

import Link from 'next/link';
import { useRef, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown, Copy, LockKeyhole, LogOut, ShieldCheck, UserRound, X } from 'lucide-react';
import { categoryLabels } from '../data/data';
import { demoPins, type MockVotingState } from '../data/pin-session';
import type { Project, VoterCategory } from '../data/types';
import { Button, cx } from './ui';

export function UniversityBrand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="university-brand" aria-label="UTYCC voting portal home">
    <span className="university-mark" aria-hidden="true">U</span>
    <span className="min-w-0">
      <strong>UTYCC</strong>
      <span>{compact ? 'Project Exhibition' : 'University of Technology (Yatanarpon Cyber City)'}</span>
    </span>
  </Link>;
}

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<'MY' | 'EN'>('EN');
  return <div className="language-switch" aria-label="Language preview">
    {(['MY', 'EN'] as const).map((item) => <button key={item} type="button" aria-pressed={language === item} onClick={() => setLanguage(item)}>{item}</button>)}
  </div>;
}

export function VoterCategoryBadge({ category }: { category: VoterCategory }) {
  return <span className={`category-badge category-${category}`}>{categoryLabels[category]} Voter</span>;
}

export function GlassNavbar({ category, onLogout }: { category?: VoterCategory; onLogout?: () => void }) {
  return <header className="glass-navbar">
    <UniversityBrand compact />
    <div className="glass-navbar-actions">
      <LanguageSwitcher />
      {category && <VoterCategoryBadge category={category} />}
      {category && onLogout && <details className="session-menu">
        <summary aria-label="Open PIN session menu"><UserRound size={18} /><ChevronDown size={14} /></summary>
        <div><p>Demo voting session</p><strong>{categoryLabels[category]} Voter</strong><button type="button" onClick={onLogout}><LogOut size={16} />Exit Voting Portal</button></div>
      </details>}
    </div>
  </header>;
}

export function VotingPinInput({ value, onChange, onSubmit, disabled, invalid }: { value: string; onChange: (value: string) => void; onSubmit: () => void; disabled?: boolean; invalid?: boolean }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const characters = Array.from({ length: 7 }, (_, index) => value[index] || '');
  const setCharacters = (next: string[], focus?: number) => {
    onChange(next.join('').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7));
    if (focus !== undefined) requestAnimationFrame(() => refs.current[focus]?.focus());
  };
  const update = (index: number, input: string) => {
    const character = input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const next = [...characters]; next[index] = character;
    setCharacters(next, character && index < 6 ? index + 1 : index);
  };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const next = [...characters];
      if (next[index]) next[index] = '';
      else if (index > 0) next[index - 1] = '';
      setCharacters(next, next[index] ? index : Math.max(0, index - 1));
    } else if (event.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    else if (event.key === 'ArrowRight' && index < 6) refs.current[index + 1]?.focus();
    else if (event.key === 'Enter' && value.length === 7) onSubmit();
    else if (event.key.length === 1 && !/[a-z0-9]/i.test(event.key)) event.preventDefault();
  };
  const paste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    requestAnimationFrame(() => refs.current[Math.min(pasted.length, 7) - 1]?.focus());
  };
  return <fieldset className={cx('pin-fieldset', invalid && 'is-invalid')} disabled={disabled} aria-invalid={invalid}>
    <legend className="sr-only">Seven-character voting code</legend>
    <div className="pin-grid">
      {characters.map((character, index) => <input
        key={index}
        ref={(element) => { refs.current[index] = element; }}
        value={character}
        onChange={(event) => update(index, event.target.value)}
        onKeyDown={(event) => keyDown(event, index)}
        onPaste={paste}
        onFocus={(event) => event.currentTarget.select()}
        inputMode="text"
        pattern="[A-Z0-9]*"
        autoCapitalize="characters"
        spellCheck={false}
        autoComplete={index === 0 ? 'one-time-code' : 'off'}
        maxLength={1}
        aria-label={`Voting code character ${index + 1}`}
      />)}
    </div>
  </fieldset>;
}

export function PinErrorMessage({ children, tone = 'error' }: { children: ReactNode; tone?: 'error' | 'success' | 'info' }) {
  return <p className={`pin-message pin-message-${tone}`} role={tone === 'error' ? 'alert' : 'status'} aria-live="polite">
    {tone === 'success' ? <Check size={17} /> : <ShieldCheck size={17} />}{children}
  </p>;
}

export function GlassLoginCard({ children }: { children: ReactNode }) {
  return <section className="glass-login-card animate-in">
    <div className="login-logo" aria-hidden="true">U</div>
    <p className="login-kicker">UTYCC Project Exhibition</p>
    <h1>Voting Portal</h1>
    <p className="login-copy">Enter the voting code provided by the event organizers. Your voter category will be assigned automatically.</p>
    {children}
  </section>;
}

export function DemoPinPanel({ preview, onPreview }: { preview: MockVotingState; onPreview: (state: MockVotingState) => void }) {
  const [copied, setCopied] = useState('');
  const copy = async (pin: string) => {
    await navigator.clipboard?.writeText(pin);
    setCopied(pin);
    setTimeout(() => setCopied(''), 1200);
  };
  return <details className="demo-pin-panel">
    <summary>View Demo Codes <ChevronDown size={16} /></summary>
    <div className="demo-pin-content">
      <p><strong>Demo access only — remove before production.</strong></p>
      {Object.entries(demoPins).map(([pin, category]) => <div className="demo-pin-row" key={pin}><span><b>{categoryLabels[category]}</b><code>{pin}</code></span><button type="button" onClick={() => copy(pin)} aria-label={`Copy ${categoryLabels[category]} demo code`}>{copied === pin ? <Check size={16} /> : <Copy size={16} />}</button></div>)}
      <label className="preview-state">Preview login state<select value={preview} onChange={(event) => onPreview(event.target.value as MockVotingState)}><option value="open">Normal voting</option><option value="used">Already-used PIN</option><option value="not-started">Voting not started</option><option value="closed">Voting closed</option><option value="network-error">Network error</option></select></label>
    </div>
  </details>;
}

export function VotingPortalLogoutDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
    <section className="glass-dialog" role="dialog" aria-modal="true" aria-labelledby="logout-title">
      <button type="button" className="dialog-close" onClick={onCancel} aria-label="Close logout confirmation"><X size={18} /></button>
      <span className="dialog-icon"><LockKeyhole /></span><h2 id="logout-title">Exit Voting Portal?</h2>
      <p>Your demo session will be cleared and you’ll return to the PIN login page.</p>
      <div><Button variant="quiet" onClick={onCancel}>Stay here</Button><Button variant="danger" onClick={onConfirm}>Exit Voting Portal</Button></div>
    </section>
  </div>;
}

export function GlassProjectCard({ project, selected, onSelect, onDetails }: { project: Project; selected: boolean; onSelect: () => void; onDetails: () => void }) {
  return <article className={cx('glass-project-card', selected && 'is-selected')} onClick={onSelect} data-testid={`card-project-${project.id}`}>
    <div className="project-image"><img src={project.imageUrl} alt={`${project.title} project`} /><span>Project {project.projectNumber}</span>{selected && <b><Check size={16} />Selected</b>}</div>
    <div className="project-card-body"><p className="project-category">{project.category}</p><h3>{project.title}</h3><p>{project.shortDescription}</p><footer><span>{project.teamName}</span><button type="button" onClick={(event) => { event.stopPropagation(); onDetails(); }}>View Details</button></footer></div>
  </article>;
}

export function GlassVoteBar({ project, onCancel, onVote }: { project: Project; onCancel: () => void; onVote: () => void }) {
  return <aside className="glass-vote-bar" aria-label="Selected project"><img src={project.imageUrl} alt="" /><p><span>Selected project</span><strong>{project.title}</strong></p><button type="button" onClick={onCancel}>Cancel</button><Button onClick={onVote}>Vote Now</Button></aside>;
}
