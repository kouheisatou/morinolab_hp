import { getTeamMemberIds } from '@/lib/client-content-loader';
import TeamMemberDetailClientPage from './ClientPage';

// Static generation function
export async function generateStaticParams() {
  try {
    const memberIds = await getTeamMemberIds();
    return memberIds.map((id) => ({
      id: id,
    }));
  } catch (error) {
    console.error('Error generating static params for team members:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TeamMemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <TeamMemberDetailClientPage id={id} />;
}
