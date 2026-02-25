'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import {
  Calendar,
  Award,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  Award as AwardType,
  loadAwards,
  loadTeamMembers,
  TeamMember,
  getStaticPath,
} from '@/lib/client-content-loader';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

export default function AwardsPage() {
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const [awardData, teamMembers] = await Promise.all([
          loadAwards(),
          loadTeamMembers(),
        ]);
        const sortedAwards = awardData.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setAwards(sortedAwards);
        setMembers(teamMembers);
      } catch (error) {
        console.error('Error loading awards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAwards();
  }, []);

  const getAwardMembers = (award: AwardType): TeamMember[] => {
    if (!award.memberIds || !members.length) return [];
    const memberIdList = award.memberIds.split(',').map((id) => id.trim());
    return members.filter((member) => memberIdList.includes(member.id));
  };

  if (loading) return null;

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Navbar />

      <main className='flex-1 pt-20'>
        <div className='bg-slate-50 border-b border-slate-100 py-12'>
          <div className='max-w-7xl mx-auto px-4'>
            <nav className='flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6'>
              <ScrollAwareLink href='/' className='hover:text-primary transition-colors'>Home</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <span className='text-slate-900'>{locale === 'ja' ? '受賞' : 'Awards'}</span>
            </nav>
            <h1 className='text-4xl md:text-5xl font-black text-slate-900 tracking-tight'>
              {locale === 'ja' ? '受賞歴' : 'Awards & Recognition'}
            </h1>
            <p className='text-slate-500 mt-4 max-w-2xl font-medium'>
              {locale === 'ja' 
                ? '研究室の革新的な研究成果が評価され、国内外の権威ある学会や団体から贈られた賞をご紹介します。'
                : 'Our innovative research achievements have been recognized with prestigious awards from academic societies and organizations.'}
            </p>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          <div className='max-w-5xl mx-auto'>
            <div className='space-y-6'>
              {awards.map((award) => (
                <ScrollAwareLink
                  key={award.id}
                  href={`/awards/${award.id}`}
                  className='group block'
                >
                  <div className='bg-white border border-slate-100 p-6 md:p-8 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col md:flex-row gap-8 md:items-center'>
                    <div className='w-24 h-24 bg-amber-50 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform'>
                      <Image
                        src={getStaticPath(`/generated_contents/award/${award.thumbnail || `${award.id}.jpg`}`)}
                        alt={getLocalized(award, 'name', locale)}
                        width={96}
                        height={96}
                        className='object-cover w-full h-full'
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getStaticPath('/img/noimage_news.png');
                        }}
                      />
                    </div>

                    <div className='flex-1'>
                      <div className='flex items-center text-primary text-xs font-black uppercase tracking-widest mb-3'>
                        <Calendar className='w-3 h-3 mr-2' />
                        {new Date(award.date).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
                          year: 'numeric', month: 'long'
                        })}
                      </div>
                      
                      <h3 className='text-xl md:text-2xl font-black text-slate-900 group-hover:text-primary transition-colors mb-4 leading-tight'>
                        {getLocalized(award, 'name', locale)}
                      </h3>

                      <div className='flex flex-wrap gap-2'>
                        {getAwardMembers(award).map((member) => (
                          <span key={member.id} className='px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100'>
                            {getLocalized(member, 'name', locale)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className='flex items-center justify-end'>
                      <div className='w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary transition-all'>
                        <ArrowRight className='w-5 h-5 text-slate-300 group-hover:text-white transition-colors' />
                      </div>
                    </div>
                  </div>
                </ScrollAwareLink>
              ))}
            </div>

            {awards.length === 0 && (
              <div className='text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200'>
                <p className='text-slate-400 font-bold uppercase tracking-widest'>No awards found.</p>
              </div>
            )}
          </div>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
