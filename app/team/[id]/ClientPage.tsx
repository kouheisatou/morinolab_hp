'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, Tags, ChevronRight, ArrowLeft } from 'lucide-react';
import {
  TeamMember,
  MemberType,
  Tag,
  loadTeamMemberDetail,
  loadMemberTypes,
  loadTags,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';

interface ClientPageProps {
  id: string;
}

export default function TeamMemberDetailClientPage({ id }: ClientPageProps) {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    if (id) {
      const fetchTeamMemberDetail = async () => {
        try {
          const [memberDetail, memberTypesData, tagsData] = await Promise.all([
            loadTeamMemberDetail(id),
            loadMemberTypes(),
            loadTags(),
          ]);
          setMember(memberDetail);
          setMemberTypes(memberTypesData);
          setTags(tagsData);
        } catch (error) {
          console.error('Error loading team member detail:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchTeamMemberDetail();
    }
  }, [id]);

  if (loading) return null;

  if (!member) {
    return (
      <div className='min-h-screen bg-white flex flex-col'>
        <Navbar />
        <main className='flex-1 flex items-center justify-center pt-20'>
          <div className='text-center'>
            <h1 className='text-2xl font-black text-slate-900 mb-4'>Member Not Found</h1>
            <ScrollAwareLink href='/team' className='text-primary font-bold hover:underline'>Return to Team</ScrollAwareLink>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const memberType = memberTypes.find(t => t.id === member.memberTypeId);

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Navbar />

      <main className='flex-1 pt-20'>
        <div className='bg-slate-50 border-b border-slate-100 py-12'>
          <div className='max-w-4xl mx-auto px-4'>
            <nav className='flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-10'>
              <ScrollAwareLink href='/' className='hover:text-primary transition-colors'>Home</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <ScrollAwareLink href='/team' className='hover:text-primary transition-colors'>Team</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <span className='text-slate-900 truncate max-w-[200px]'>
                {getLocalized(member, 'name', locale)}
              </span>
            </nav>

            <div className='flex flex-col md:flex-row items-center md:items-start gap-10'>
              <div className='relative flex-shrink-0'>
                <div className='absolute -inset-2 bg-primary/10 rounded-full blur-md'></div>
                <Avatar className='w-40 h-40 border-4 border-white shadow-xl relative'>
                  <AvatarImage
                    src={getStaticPath(`/generated_contents/member/${member.id}.jpg`)}
                    alt={getLocalized(member, 'name', locale)}
                    className='object-cover'
                  />
                  <AvatarFallback className='text-4xl bg-primary text-white font-black'>
                    {getLocalized(member, 'name', locale).slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className='flex-1 text-center md:text-left'>
                <div className='inline-block px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full mb-4 uppercase tracking-widest'>
                  {memberType ? getLocalized(memberType, 'name', locale) : ''}
                </div>
                <h1 className='text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2'>
                  {getLocalized(member, 'name', locale)}
                </h1>
                <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-6'>
                  {member.nameEn}
                </p>
                
                <div className='flex flex-wrap justify-center md:justify-start gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest'>
                  {member.gradYear && (
                    <div className='flex items-center'>
                      <Calendar className='w-4 h-4 mr-2 text-primary/40' />
                      Graduation: {member.gradYear}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          <div className='max-w-4xl mx-auto space-y-16'>
            {/* About Section */}
            <div>
              <h2 className='text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center'>
                <span className='w-8 h-1 bg-primary mr-3'></span>
                {locale === 'ja' ? 'プロフィール' : 'Profile'}
              </h2>
              <p className='text-lg text-slate-600 leading-relaxed'>
                {getLocalized(member, 'desc', locale)}
              </p>
            </div>

            {/* Research Areas */}
            {member.tagIds && (
              <div>
                <h2 className='text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center'>
                  <span className='w-8 h-1 bg-primary mr-3'></span>
                  {locale === 'ja' ? '研究分野' : 'Research Areas'}
                </h2>
                <div className='flex flex-wrap gap-2'>
                  {member.tagIds.split(',').map((tagIdRaw, index) => {
                    const tagId = tagIdRaw.trim();
                    const tag = tags.find((t) => t.id === tagId);
                    const tagName = tag ? getLocalized(tag, 'name', locale) : '';
                    return tagName ? (
                      <span
                        key={index}
                        className='px-4 py-2 bg-slate-50 text-primary border border-slate-100 rounded-xl text-sm font-bold'
                      >
                        #{tagName}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Detailed Content */}
            {member.content && (
              <div>
                <h2 className='text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center'>
                  <span className='w-8 h-1 bg-primary mr-3'></span>
                  {locale === 'ja' ? '詳細情報' : 'Details'}
                </h2>
                <div
                  className='prose prose-slate prose-lg max-w-none 
                    prose-headings:text-slate-900 prose-headings:font-black
                    prose-p:text-slate-600 prose-p:leading-relaxed
                    prose-strong:text-slate-900
                    prose-a:text-primary prose-a:font-bold hover:prose-a:underline'
                  dangerouslySetInnerHTML={{
                    __html: member.content,
                  }}
                />
              </div>
            )}

            <div className='pt-10 border-t border-slate-100'>
              <ScrollAwareLink href='/team'>
                <button className='flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group'>
                  <ArrowLeft className='w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform' />
                  Back to Team
                </button>
              </ScrollAwareLink>
            </div>
          </div>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
