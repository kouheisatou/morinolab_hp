'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ArrowRight, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import { useState, useEffect } from 'react';
import {
  loadTeamMembers,
  loadTags,
  TeamMember,
  Tag,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

export function Team() {
  const [professor, setProfessor] = useState<TeamMember | null>(null);
  const [students, setStudents] = useState<TeamMember[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const [members, tagsData] = await Promise.all([
          loadTeamMembers(),
          loadTags(),
        ]);

        const prof = members.find((member) => member.memberTypeId === '1');
        const studs = members
          .filter((member) => member.memberTypeId !== '1')
          .slice(0, 6);

        setProfessor(prof || null);
        setStudents(studs);
        setTags(tagsData);
      } catch (err) {
        console.error('Team component: Error loading team:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  const getTagName = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId.trim());
    return tag ? getLocalized(tag, 'name', locale) : '';
  };

  if (loading) return null;

  return (
    <section id='team' className='bg-white py-24'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='text-center max-w-2xl mx-auto mb-16'>
          <h2 className='text-primary font-bold tracking-wider mb-2 uppercase text-sm'>Our Team</h2>
          <h3 className='text-3xl md:text-4xl font-bold text-slate-900'>
            {locale === 'ja' ? '研究室メンバー' : 'Lab Members'}
          </h3>
        </div>

        {/* Professor */}
        {professor && (
          <div className='mb-20'>
            <div className='max-w-4xl mx-auto bg-secondary/50 rounded-3xl p-8 md:p-12 border border-primary/5 flex flex-col md:flex-row items-center gap-10 hover:shadow-lg transition-shadow'>
              <div className='relative flex-shrink-0'>
                <div className='absolute -inset-2 bg-primary/10 rounded-full blur-md'></div>
                <Avatar className='w-48 h-48 border-4 border-white shadow-xl relative'>
                  <AvatarImage
                    src={getStaticPath(`/generated_contents/member/${professor.id}.jpg`)}
                    alt={getLocalized(professor, 'name', locale)}
                    className='object-cover'
                  />
                  <AvatarFallback className='text-4xl bg-primary text-white'>
                    {getLocalized(professor, 'name', locale).slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className='flex-1 text-center md:text-left'>
                <div className='inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-4 uppercase tracking-widest'>
                  {locale === 'ja' ? '教授' : 'Professor'}
                </div>
                <h4 className='text-3xl font-bold text-slate-900 mb-4'>
                  {getLocalized(professor, 'name', locale)}
                </h4>
                <p className='text-slate-600 mb-6 leading-relaxed'>
                  {getLocalized(professor, 'desc', locale)}
                </p>
                <div className='flex flex-wrap gap-2 justify-center md:justify-start mb-8'>
                  {professor.tagIds.split(',').slice(0, 4).map((tagId, i) => (
                    <span key={i} className='text-xs font-semibold px-3 py-1 bg-white border border-primary/10 text-primary rounded-full'>
                      #{getTagName(tagId)}
                    </span>
                  ))}
                </div>
                <ScrollAwareLink href={`/team/${professor.id}`}>
                  <Button className='bg-primary text-white font-bold group'>
                    {locale === 'ja' ? 'プロフィールを見る' : 'View Profile'}
                    <ArrowRight className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </Button>
                </ScrollAwareLink>
              </div>
            </div>
          </div>
        )}

        {/* Students */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {students.map((member) => (
            <div key={member.id} className='group bg-white border border-slate-100 p-6 rounded-2xl flex items-center gap-5 hover:border-primary/20 hover:shadow-md transition-all'>
              <Avatar className='w-20 h-20 border border-slate-100 flex-shrink-0'>
                <AvatarImage
                  src={getStaticPath(`/generated_contents/member/${member.id}.jpg`)}
                  alt={getLocalized(member, 'name', locale)}
                  className='object-cover'
                />
                <AvatarFallback className='bg-slate-50 text-slate-400'>
                  <User className='w-8 h-8' />
                </AvatarFallback>
              </Avatar>
              <div className='overflow-hidden'>
                <h5 className='font-bold text-slate-900 group-hover:text-primary transition-colors truncate'>
                  {getLocalized(member, 'name', locale)}
                </h5>
                <p className='text-slate-500 text-xs mb-2 truncate'>
                  {getLocalized(member, 'desc', locale)}
                </p>
                <div className='flex flex-wrap gap-1'>
                  {member.tagIds.split(',').slice(0, 2).map((tagId, i) => (
                    <span key={i} className='text-[10px] text-primary/70 font-medium'>
                      #{getTagName(tagId)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-16 text-center'>
          <ScrollAwareLink href='/team'>
            <Button variant="outline" size="lg" className="border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
              {locale === 'ja' ? 'すべてのメンバーに会う' : 'Meet All Members'}
              <ArrowRight className='ml-2 w-4 h-4' />
            </Button>
          </ScrollAwareLink>
        </div>
      </div>
    </section>
  );
}
