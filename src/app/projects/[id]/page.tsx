import { ProjectDetailPage } from '@/features/exhibition/pages/voter/project-detail-page';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetailPage id={id} />;
}
