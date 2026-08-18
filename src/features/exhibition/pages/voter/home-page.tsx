'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { voterApi } from '../../data/voter-api';
import {
  GlassLoginCard,
  GlassNavbar,
  PinErrorMessage,
  VotingPinInput,
} from '../../components/voter-portal';

const messages = {
  invalid: 'This voting code is invalid. Please check all seven characters and try again.',
  rate_limited: 'Too many attempts. Please wait a moment and try again.',
  'network-error': 'The verification service is unavailable. Please try again.',
} as const;

export function HomePage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [error, setError] = useState<keyof typeof messages | ''>('');
  const [category, setCategory] = useState('');

  const changePin = (value: string) => { setPin(value); setError(''); setStatus('idle'); };
  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (pin.length !== 7 || status === 'verifying') return;
    setError(''); setStatus('verifying');
    try {
      const { session } = await voterApi.verifyCode(pin);
      setCategory(session.category[0].toUpperCase() + session.category.slice(1));
      setStatus('success');
      setTimeout(() => router.replace('/projects'), 650);
    } catch (failure) {
      const reason = failure instanceof Error ? failure.message : 'network-error';
      setStatus('idle');
      setError(reason === 'rate_limited' ? 'rate_limited' : reason === 'invalid_code' ? 'invalid' : 'network-error');
    }
  };

  return <main className="utycc-page login-page">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="ambient ambient-three" />
    <GlassNavbar />
    <div className="login-stage">
      <div className="login-heading animate-in">
        <span><Sparkles size={15} />Project Show · Event Year</span>
        <h2>University of Technology<br />(Yatanarpon Cyber City)</h2>
        <p>Enter your 7-character voting code to explore the projects and cast your vote.</p>
      </div>
      <GlassLoginCard>
        <form onSubmit={submit} noValidate>
          <VotingPinInput value={pin} onChange={changePin} onSubmit={submit} disabled={status === 'verifying' || status === 'success'} invalid={Boolean(error)} />
          {error && <PinErrorMessage>{messages[error]}</PinErrorMessage>}
          {status === 'success' && <PinErrorMessage tone="success">Code verified · Welcome, {category} Voter</PinErrorMessage>}
          <button className="continue-button" type="submit" disabled={pin.length !== 7 || status !== 'idle'}>
            {status === 'verifying' ? <><span className="button-spinner" />Verifying code...</> : status === 'success' ? <><ShieldCheck size={18} />Code verified</> : 'Continue to Vote'}
          </button>
        </form>
        <p className="privacy-note"><LockKeyhole size={15} />Your code can be used to vote only once. Please do not share it with anyone.</p>
      </GlassLoginCard>
    </div>
    <footer className="login-footer">Secure single-use voting · Protected by UTYCC</footer>
  </main>;
}
