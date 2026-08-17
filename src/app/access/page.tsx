import { AccessPage } from '@/features/exhibition/pages/voter/access-page';

export default async function Page({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  return <AccessPage code={(await searchParams).code ?? ''} />;
}
