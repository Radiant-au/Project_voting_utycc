'use client';

import { useState } from 'react';
import { Download, MoreHorizontal, Search, Users } from 'lucide-react';
import { categoryLabels, users as seedUsers } from '../../data/data';
import type { UserProfile } from '../../data/types';
import { Badge, Button, EmptyState, Modal } from '../../components/ui';
import { AdminShell, PageIntro } from '../../components/admin';

export function AdminUsers() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [detail, setDetail] = useState<UserProfile | null>(null);
  const visible = seedUsers.filter(
    (user) =>
      (!query || `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())) &&
      (filter === 'All' ||
        (filter === 'Voted'
          ? user.hasVoted
          : filter === 'Not voted'
            ? !user.hasVoted
            : categoryLabels[user.category] === filter || user.categoryStatus === filter.toLowerCase())),
  );

  return (
    <AdminShell title="Users">
      <PageIntro eyebrow="People & participation" title="User management" action={<Button><Download size={16} /> Export users</Button>} />
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3.5 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" className="h-11 w-full rounded-xl border border-border bg-background pl-9 text-sm" data-testid="input-user-search" />
          </div>
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-11 rounded-xl border border-border bg-background px-3 text-sm" data-testid="select-user-filter">
            <option>All</option><option>Student</option><option>Teacher</option><option>Visitor</option><option>Voted</option><option>Not voted</option><option>Pending</option><option>Verified</option><option>Rejected</option>
          </select>
        </div>
        <div className="mt-4 hidden overflow-auto md:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="pb-3">Person</th><th className="pb-3">Category</th><th className="pb-3">Status</th><th className="pb-3">Vote</th><th className="pb-3">Registered</th><th className="pb-3"> </th></tr></thead>
            <tbody>{visible.map((user) => <tr key={user.id} className="border-b border-border last:border-0">
              <td className="py-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{user.name.split(' ').map((part) => part[0]).join('')}</span><div><p className="font-bold">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div></div></td>
              <td><Badge tone={user.category === 'teacher' ? 'gold' : user.category === 'visitor' ? 'lavender' : 'teal'}>{categoryLabels[user.category]}</Badge></td>
              <td><Badge tone={user.categoryStatus === 'verified' ? 'teal' : user.categoryStatus === 'pending' ? 'gold' : 'red'}>{user.categoryStatus}</Badge></td>
              <td>{user.hasVoted ? <Badge>Voted</Badge> : <Badge tone="muted">Not voted</Badge>}</td>
              <td className="text-muted-foreground">{user.registeredAt.slice(0, 10)}</td>
              <td><button onClick={() => setDetail(user)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`View ${user.name}`} data-testid={`button-view-user-${user.id}`}><MoreHorizontal size={17} /></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">{visible.map((user) => <button key={user.id} onClick={() => setDetail(user)} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left" data-testid={`card-user-${user.id}`}><span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{user.name.split(' ').map((part) => part[0]).join('')}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{user.name}</strong><span className="block truncate text-xs text-muted-foreground">{user.email}</span></span><Badge tone={user.hasVoted ? 'teal' : 'muted'}>{user.hasVoted ? 'Voted' : 'Pending'}</Badge></button>)}</div>
        {!visible.length && <EmptyState icon={<Users />} title="No users found" text="Try changing your search or filter." />}
      </div>
      {detail && <Modal onClose={() => setDetail(null)}><span className="grid h-14 w-14 place-items-center rounded-full bg-secondary font-display text-xl font-bold text-primary">{detail.name.split(' ').map((part) => part[0]).join('')}</span><h2 className="mt-4 font-display text-2xl font-bold">{detail.name}</h2><p className="text-sm text-muted-foreground">{detail.email}</p><div className="mt-6 space-y-3 rounded-xl bg-muted p-4 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Category</span><strong>{categoryLabels[detail.category]}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Status</span><strong>{detail.categoryStatus}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Vote status</span><strong>{detail.hasVoted ? 'Voted' : 'Not voted'}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Registered</span><strong>{detail.registeredAt.slice(0, 10)}</strong></div></div></Modal>}
    </AdminShell>
  );
}
