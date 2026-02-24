import { getPublicationIds } from '@/lib/client-content-loader';
import PublicationDetailClientPage from './ClientPage';

// Static generation function
export async function generateStaticParams() {
  try {
    const publicationIds = await getPublicationIds();
    return publicationIds.map((id) => ({
      id: id,
    }));
  } catch (error) {
    console.error('Error generating static params for publications:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PublicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PublicationDetailClientPage id={id} />;
}
