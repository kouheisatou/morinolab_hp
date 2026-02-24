import { getAwardIds } from '@/lib/client-content-loader';
import AwardDetailClientPage from './ClientPage';

// Static generation function
export async function generateStaticParams() {
  try {
    const awardIds = await getAwardIds();
    return awardIds.map((id) => ({
      id: id,
    }));
  } catch (error) {
    console.error('Error generating static params for awards:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AwardDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AwardDetailClientPage id={id} />;
}
