import { getLectureIds } from '@/lib/client-content-loader';
import LectureDetailClientPage from './ClientPage';

// Static generation function
export async function generateStaticParams() {
  try {
    const lectureIds = await getLectureIds();
    return lectureIds.map((id) => ({
      id: id,
    }));
  } catch (error) {
    console.error('Error generating static params for lectures:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LectureDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <LectureDetailClientPage id={id} />;
}
