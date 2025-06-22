import { getThemeIds } from '@/lib/client-content-loader';
import ThemeDetailClientPage from './ClientPage';

// Static generation function
export async function generateStaticParams() {
  try {
    const themeIds = await getThemeIds();
    return themeIds.map((id) => ({
      id: id,
    }));
  } catch (error) {
    console.error('Error generating static params for themes:', error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ThemeDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ThemeDetailClientPage id={id} />;
}
