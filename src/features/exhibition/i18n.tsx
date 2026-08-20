'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ProjectCategory } from './data/project-categories';
import type { VoterCategory } from './data/types';

export type Locale = 'en' | 'my';

const messages = {
  en: {
    projectShow: '2025–2026 Project Show', university: 'University of Technology', universityFull: '(Yatanarpon Cyber City)', enterCode: 'Enter your 7-character voting code to explore the projects and cast your vote.', continueVote: 'Continue to Vote', verifying: 'Verifying code…', codeVerified: 'Code verified', security: 'Your code can be used to vote only once. Please do not share it with anyone.', invalidCode: 'This voting code is invalid. Please check all seven characters and try again.', rateLimited: 'Too many attempts. Please wait a moment and try again.', serviceUnavailable: 'The verification service is unavailable. Please try again.', welcome: 'Code verified · Welcome, {category} Voter', visitorPass: 'Visitor Pass', invalidVisitor: 'This visitor pass is invalid or unavailable.', backupCode: 'Enter backup code', verifyingVisitor: 'Verifying your visitor pass…', verifiedSession: 'Verified voting session', exitPortal: 'Exit Voting Portal', close: 'Close', chooseProject: 'Choose your project.', discover: 'Discover student innovation and select the project that deserves your vote.', search: 'Search projects or teams', all: 'All', projectsFound: '{count} projects to discover', clearFilters: 'Clear filters', noProjects: 'No projects found', tryAgain: 'Try a different search or clear your filters.', votingOpen: 'Voting is open', votingOpenText: 'Select one project to cast your vote.', votingClosed: 'Voting is currently closed', votingClosedText: 'New selections and votes are disabled.', votingUnknown: 'Voting status unavailable', votingUnknownText: 'Voting is temporarily disabled until the current status can be confirmed.', alreadyRecorded: 'Your vote is already recorded.', browseAfterVote: 'You can continue browsing the exhibition projects.', confirmVote: 'Confirm your vote for {title}?', cannotChange: 'Your vote cannot be changed after confirmation.', cancel: 'Cancel', record: 'Recording…', confirm: 'Confirm vote', voteFailed: 'Could not record your vote. This code may already be used or voting may be closed.', receipt: 'Vote receipt', recordedTitle: 'Your vote has been recorded.', thankYou: 'Thank you for supporting innovation at UTYCC Project Show.', yourCategory: 'Your category', status: 'Status', recorded: 'Recorded', finish: 'Finish', voter: 'Voter', language: 'Language', project: 'project', sevenCode: 'Seven-character voting code', character: 'Voting code character {number}', receiptId: 'Receipt', filterProjects: 'Filter projects by major', homeTitle: 'University of Technology', homeSubtitle: '(Yatanarpon Cyber City)', homeDescription: 'Enter your 7-character voting code to explore the projects and cast your vote.', secureFooter: 'Secure single-use voting · Protected by UTYCC'
  },
  my: {
    projectShow: '၂၀၂၅–၂၀၂၆ ပရောဂျက်ပြပွဲ', university: 'နည်းပညာတက္ကသိုလ်', universityFull: '(ရတနာပုံဆိုက်ဘာစီးတီး)', enterCode: 'ပရောဂျက်များကို ကြည့်ရှု၍ မဲပေးရန် အက္ခရာ ၇ လုံးပါ မဲကုဒ်ကို ထည့်ပါ။', continueVote: 'မဲပေးရန် ဆက်သွားမည်', verifying: 'ကုဒ်ကို စစ်ဆေးနေသည်…', codeVerified: 'ကုဒ် အတည်ပြုပြီးပါပြီ', security: 'သင့်ကုဒ်ကို တစ်ကြိမ်သာ မဲပေးရန် အသုံးပြုနိုင်ပါသည်။ အခြားသူများကို မမျှဝေပါနှင့်။', invalidCode: 'မဲကုဒ် မမှန်ကန်ပါ။ အက္ခရာ ၇ လုံးကို ပြန်စစ်ဆေးပါ။', rateLimited: 'ကြိုးစားမှု များလွန်းပါသည်။ ခဏစောင့်ပြီး ထပ်ကြိုးစားပါ။', serviceUnavailable: 'စစ်ဆေးရေးဝန်ဆောင်မှု မရရှိနိုင်ပါ။ ထပ်ကြိုးစားပါ။', welcome: 'ကုဒ် အတည်ပြုပြီးပါပြီ · {category} မဲပေးသူမှ ကြိုဆိုပါသည်', visitorPass: 'ဧည့်သည် မဲပေးခွင့်', invalidVisitor: 'ဧည့်သည် မဲပေးခွင့် မမှန်ကန်ပါ သို့မဟုတ် မရရှိနိုင်တော့ပါ။', backupCode: 'အရန်ကုဒ် ထည့်မည်', verifyingVisitor: 'ဧည့်သည်ကုဒ်ကို စစ်ဆေးနေသည်…', verifiedSession: 'အတည်ပြုထားသော မဲပေးမှု', exitPortal: 'မဲပေးမှုမှ ထွက်မည်', close: 'ပိတ်မည်', chooseProject: 'သင့်ပရောဂျက်ကို ရွေးချယ်ပါ။', discover: 'ကျောင်းသားများ၏ တီထွင်ဖန်တီးမှုများကို လေ့လာပြီး မဲပေးလိုသော ပရောဂျက်ကို ရွေးချယ်ပါ။', search: 'ပရောဂျက် သို့မဟုတ် အဖွဲ့ကို ရှာပါ', all: 'အားလုံး', projectsFound: 'ရှာဖွေတွေ့ရှိသော ပရောဂျက် {count} ခု', clearFilters: 'စစ်ထုတ်မှုများ ဖယ်ရှားမည်', noProjects: 'ပရောဂျက် မတွေ့ပါ', tryAgain: 'အခြားရှာဖွေမှု ပြုလုပ်ပါ သို့မဟုတ် စစ်ထုတ်မှု ဖယ်ရှားပါ။', votingOpen: 'မဲပေးမှု ဖွင့်ထားပါသည်', votingOpenText: 'မဲပေးရန် ပရောဂျက်တစ်ခု ရွေးချယ်ပါ။', votingClosed: 'မဲပေးမှု ပိတ်ထားပါသည်', votingClosedText: 'ပရောဂျက်အသစ် ရွေးချယ်ခြင်းနှင့် မဲပေးခြင်းကို ပိတ်ထားပါသည်။', votingUnknown: 'မဲပေးမှု အခြေအနေ မရရှိနိုင်ပါ', votingUnknownText: 'လက်ရှိအခြေအနေကို အတည်မပြုနိုင်သေးသဖြင့် မဲပေးမှုကို ခေတ္တပိတ်ထားပါသည်။', alreadyRecorded: 'သင့်မဲကို မှတ်တမ်းတင်ပြီးပါပြီ။', browseAfterVote: 'ပြပွဲပရောဂျက်များကို ဆက်လက်ကြည့်ရှုနိုင်ပါသည်။', confirmVote: '{title} အတွက် သင့်မဲကို အတည်ပြုမည်လား။', cannotChange: 'အတည်ပြုပြီးပါက မဲကို ပြန်ပြင်၍ မရနိုင်ပါ။', cancel: 'မလုပ်တော့ပါ', record: 'မှတ်တမ်းတင်နေသည်…', confirm: 'မဲအတည်ပြုမည်', voteFailed: 'မဲကို မှတ်တမ်းတင်၍ မရပါ။ ကုဒ်ကို အသုံးပြုပြီးဖြစ်နိုင်သည် သို့မဟုတ် မဲပေးမှု ပိတ်ထားနိုင်ပါသည်။', receipt: 'မဲလက်ခံမှတ်တမ်း', recordedTitle: 'သင့်မဲကို မှတ်တမ်းတင်ပြီးပါပြီ။', thankYou: 'UTYCC ပရောဂျက်ပြပွဲကို အားပေးမဲပေးသည့်အတွက် ကျေးဇူးတင်ပါသည်။', yourCategory: 'သင့်အမျိုးအစား', status: 'အခြေအနေ', recorded: 'မှတ်တမ်းတင်ပြီး', finish: 'ပြီးပြီ', voter: 'မဲပေးသူ', language: 'ဘာသာစကား', project: 'ပရောဂျက်', sevenCode: 'အက္ခရာ ၇ လုံးပါ မဲကုဒ်', character: 'မဲကုဒ် အက္ခရာ {number}', receiptId: 'လက်ခံမှတ်တမ်း', filterProjects: 'မေဂျာအလိုက် ပရောဂျက်များကို စစ်ထုတ်ရန်', homeTitle: 'နည်းပညာတက္ကသိုလ်', homeSubtitle: '(ရတနာပုံဆိုက်ဘာစီးတီး)', homeDescription: 'ပရောဂျက်များကို ကြည့်ရှု၍ မဲပေးရန် အက္ခရာ ၇ လုံးပါ မဲကုဒ်ကို ထည့်ပါ။', secureFooter: 'တစ်ကြိမ်သုံး မဲပေးမှု လုံခြုံစွာ · UTYCC ကာကွယ်ပေးထားသည်'
  }
} as const;

export type MessageKey = keyof typeof messages.en;
type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: MessageKey, values?: Record<string, string | number>) => string; categoryLabel: (category: VoterCategory) => string };
const LocaleContext = createContext<LocaleContextValue | null>(null);

const interpolate = (value: string, values?: Record<string, string | number>) => values ? value.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`)) : value;

export function VoterLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => {
    const stored = window.localStorage.getItem('voter-locale');
    if (stored === 'en' || stored === 'my') setLocale(stored);
  }, []);
  const chooseLocale = (next: Locale) => { setLocale(next); window.localStorage.setItem('voter-locale', next); };
  const value = useMemo<LocaleContextValue>(() => ({ locale, setLocale: chooseLocale, t: (key, values) => interpolate(messages[locale][key], values), categoryLabel: (category) => ({ student: locale === 'my' ? 'ကျောင်းသား' : 'Student', teacher: locale === 'my' ? 'ဆရာ/ဆရာမ' : 'Teacher', visitor: locale === 'my' ? 'ဧည့်သည်' : 'Visitor' })[category] }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useVoterLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useVoterLocale must be used inside VoterLocaleProvider');
  return context;
}

const categoryNames: Record<ProjectCategory, { en: string; my: string }> = {
  'Information Science': { en: 'Information Science', my: 'သတင်းအချက်အလက်သိပ္ပံ' },
  'Computer Engineering': { en: 'Computer Engineering', my: 'ကွန်ပျူတာအင်ဂျင်နီယာ' },
  'Electronic Engineering': { en: 'Electronic Engineering', my: 'အီလက်ထရောနစ်အင်ဂျင်နီယာ' },
  'Precision Engineering': { en: 'Precision Engineering', my: 'တိကျအင်ဂျင်နီယာ' },
  'Advanced Material Engineering': { en: 'Advanced Material Engineering', my: 'အဆင့်မြင့်ပစ္စည်းအင်ဂျင်နီယာ' },
};

export const projectCategoryLabel = (category: ProjectCategory, locale: Locale) => categoryNames[category][locale];
