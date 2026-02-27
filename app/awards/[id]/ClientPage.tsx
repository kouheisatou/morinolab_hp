'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import {
  Calendar,
  ChevronRight,
  ArrowLeft,
  Users,
} from 'lucide-react';
import {
  Award as AwardType,
  loadAwardDetail,
  getStaticPath,
  loadTeamMembers,
  TeamMember,
} from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';

interface ClientPageProps {
  id: string;
}

export default function AwardDetailClientPage({ id }: ClientPageProps) {
  const [award, setAward] = useState<AwardType | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchAward = async () => {
      try {
        const [awardData, teamMembers] = await Promise.all([
          loadAwardDetail(id),
          loadTeamMembers(),
        ]);
        setAward(awardData);
        setMembers(teamMembers);
      } catch (error) {
        console.error('Error loading award:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAward();
    }
  }, [id]);

  const getAwardMembers = (award: AwardType): TeamMember[] => {
    if (!award.memberIds || !members.length) return [];
    const memberIdList = award.memberIds.split(',').map((id) => id.trim());
    return members.filter((member) => memberIdList.includes(member.id));
  };

  if (loading) return null;

  if (!award) {
    return (
      <div className='min-h-screen bg-white flex flex-col'>
        <Navbar />
        <main className='flex-1 flex items-center justify-center pt-20'>
          <div className='text-center'>
            <h1 className='text-2xl font-black text-slate-900 mb-4'>
              {locale === 'ja' ? '受賞が見つかりません' : 'Award Not Found'}
            </h1>
            <ScrollAwareLink href='/awards' className='text-primary font-bold hover:underline'>
              {locale === 'ja' ? '受賞一覧に戻る' : 'Return to Awards'}
            </ScrollAwareLink>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const awardMembers = getAwardMembers(award);

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Navbar />

      <main className='flex-1 pt-20'>
        <div className='bg-slate-50 border-b border-slate-100 py-12'>
          <div className='max-w-7xl mx-auto px-4'>
            <nav className='flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8'>
              <ScrollAwareLink href='/' className='hover:text-primary transition-colors'>Home</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <ScrollAwareLink href='/awards' className='hover:text-primary transition-colors'>
                {locale === 'ja' ? '受賞' : 'Awards'}
              </ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <span className='text-slate-900 truncate max-w-[200px]'>
                {getLocalized(award, 'name', locale)}
              </span>
            </nav>

            <div className='flex items-start gap-8'>
              <div className='w-20 h-20 bg-amber-50 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-100'>
                <Image
                  src={getStaticPath(`/generated_contents/award/${award.thumbnail || `${award.id}.jpg`}`)}
                  alt={getLocalized(award, 'name', locale)}
                  width={80}
                  height={80}
                  className='object-cover w-full h-full'
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getStaticPath('/img/noimage_news.png');
                  }}
                />
              </div>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center text-primary text-xs font-black uppercase tracking-widest mb-4'>
                  <Calendar className='w-4 h-4 mr-2' />
                  {new Date(award.date).toLocaleDateString(
                    locale === 'ja' ? 'ja-JP' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </div>

                <h1 className='text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-6'>
                  {getLocalized(award, 'name', locale)}
                </h1>

                {awardMembers.length > 0 && (
                  <div className='flex flex-wrap items-center gap-2'>
                    <Users className='w-4 h-4 text-primary/40' />
                    {awardMembers.map((member) => (
                      <span
                        key={member.id}
                        className='px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200'
                      >
                        {getLocalized(member, 'name', locale)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          <article className='max-w-5xl mx-auto'>
            {/* Featured Image */}
            <div className='relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-slate-200'>
              <Image
                src={getStaticPath(`/generated_contents/award/${award.thumbnail || `${award.id}.jpg`}`)}
                alt={getLocalized(award, 'name', locale)}
                fill
                className='object-cover'
                priority
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getStaticPath('/img/noimage_news.png');
                }}
              />
            </div>

            {/* Content */}
            <div>
              <h2 className='text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center'>
                <span className='w-8 h-1 bg-primary mr-3'></span>
                {locale === 'ja' ? '詳細' : 'Details'}
              </h2>
              <div
                className='prose prose-slate prose-lg max-w-none 
                  prose-headings:text-slate-900 prose-headings:font-black
                  prose-p:text-slate-600 prose-p:leading-relaxed
                  prose-strong:text-slate-900
                  prose-a:text-primary prose-a:font-bold hover:prose-a:underline'
                dangerouslySetInnerHTML={{
                  __html: award.content || '<p class="text-slate-400">No content available.</p>',
                }}
              />
            </div>

            <div className='mt-20 pt-10 border-t border-slate-100'>
              <ScrollAwareLink href='/awards'>
                <button className='flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group'>
                  <ArrowLeft className='w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform' />
                  {locale === 'ja' ? '受賞一覧に戻る' : 'Back to Awards'}
                </button>
              </ScrollAwareLink>
            </div>
          </article>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
