'use client';

import { useEffect, useState } from 'react';
import {
  Publication,
  loadPublicationDetail,
  TeamMember,
  Tag,
  loadTeamMembers,
  loadTags,
  getStaticPath,
} from '@/lib/client-content-loader';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import Image from 'next/image';
import {
  BookOpen,
  Users,
  Tags as TagsIcon,
  Calendar,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';

interface ClientPageProps {
  id: string;
}

export default function PublicationDetailClientPage({ id }: ClientPageProps) {
  const [publication, setPublication] = useState<Publication | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  const getMemberName = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId.trim());
    return member ? getLocalized(member, 'name', locale) : '';
  };

  const getTagName = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId.trim());
    return tag ? getLocalized(tag, 'name', locale) : '';
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [pubDetail, membersData, tagsData] = await Promise.all([
          loadPublicationDetail(id),
          loadTeamMembers(),
          loadTags(),
        ]);
        setPublication(pubDetail);
        setTeamMembers(membersData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error loading publication detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return null;

  if (!publication) {
    return (
      <div className='min-h-screen bg-white flex flex-col'>
        <Navbar />
        <main className='flex-1 flex items-center justify-center pt-20'>
          <div className='text-center'>
            <h1 className='text-2xl font-black text-slate-900 mb-4'>Publication Not Found</h1>
            <ScrollAwareLink href='/publications' className='text-primary font-bold hover:underline'>Return to Publications</ScrollAwareLink>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Navbar />
      <main className='flex-1 pt-20'>
        <div className='bg-slate-50 border-b border-slate-100 py-12'>
          <div className='max-w-7xl mx-auto px-4'>
            <nav className='flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8'>
              <ScrollAwareLink href='/' className='hover:text-primary transition-colors'>Home</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <ScrollAwareLink href='/publications' className='hover:text-primary transition-colors'>Publications</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <span className='text-slate-900 truncate max-w-[200px]'>
                {getLocalized(publication, 'title', locale)}
              </span>
            </nav>

            <div className='flex items-center gap-2 mb-4'>
              {publication.tagIds.split(',').map(tagId => (
                <span key={tagId} className='text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded'>
                  {getTagName(tagId)}
                </span>
              ))}
            </div>

            <h1 className='text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-6'>
              {getLocalized(publication, 'title', locale)}
            </h1>

            <div className='flex flex-wrap items-center gap-y-4 gap-x-8 text-xs font-bold text-slate-400 uppercase tracking-widest'>
              <div className='flex items-center'>
                <BookOpen className='w-4 h-4 mr-2 text-primary/40' />
                {getLocalized(publication, 'publicationName', locale)}
              </div>
              <div className='flex items-center'>
                <Calendar className='w-4 h-4 mr-2 text-primary/40' />
                {publication.publishedDate}
              </div>
            </div>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          <div className='max-w-7xl mx-auto grid lg:grid-cols-3 gap-12'>
            <div className='lg:col-span-2 space-y-12'>
              {/* Featured Image */}
              <div className='relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-slate-200'>
                <Image
                  src={getStaticPath(`/generated_contents/publication/${publication.id}.jpg`)}
                  alt={getLocalized(publication, 'title', locale)}
                  fill
                  className='object-cover'
                  priority
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getStaticPath('/img/noimage_publication.png');
                  }}
                />
              </div>

              {/* Content */}
              <div>
                <h2 className='text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center'>
                  <span className='w-8 h-1 bg-primary mr-3'></span>
                  {locale === 'ja' ? '概要' : 'Abstract'}
                </h2>
                <div
                  className='prose prose-slate prose-lg max-w-none 
                    prose-headings:text-slate-900 prose-headings:font-black
                    prose-p:text-slate-600 prose-p:leading-relaxed
                    prose-strong:text-slate-900
                    prose-a:text-primary prose-a:font-bold hover:prose-a:underline'
                  dangerouslySetInnerHTML={{
                    __html: publication.content || '<p>No content available.</p>',
                  }}
                />
              </div>
            </div>

            <div className='lg:col-span-1'>
              <div className='sticky top-32 space-y-8'>
                <div className='bg-slate-50 rounded-3xl p-8 border border-slate-100'>
                  <h3 className='text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center'>
                    <Users className='w-4 h-4 mr-2' />
                    {locale === 'ja' ? '著者' : 'Authors'}
                  </h3>
                  <div className='space-y-4'>
                    {publication.authorMemberIds.split(',').map((id) => (
                      <div key={id} className='flex items-center group'>
                        <div className='w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 font-bold text-xs'>
                          {getMemberName(id).slice(0, 1)}
                        </div>
                        <span className='text-sm font-bold text-slate-700 group-hover:text-primary transition-colors'>
                          {getMemberName(id)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className='pt-8 border-t border-slate-100'>
                  <ScrollAwareLink href='/publications'>
                    <button className='flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group'>
                      <ArrowLeft className='w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform' />
                      Back to Publications
                    </button>
                  </ScrollAwareLink>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </div>
  );
}
