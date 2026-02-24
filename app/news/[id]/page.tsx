import { getNewsIds } from '@/lib/client-content-loader';
import NewsDetailClientPage from './ClientPage';

// Static generation function
export async function generateStaticParams() {
  try {
    const newsIds = await getNewsIds();
    return newsIds.map((id) => ({
      id: id,
    }));
  } catch (error) {
    console.error('Error generating static params for news:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <NewsDetailClientPage id={id} />;
}
