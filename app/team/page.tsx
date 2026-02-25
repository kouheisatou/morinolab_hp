'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, ArrowRight, Filter, X, GraduationCap, ChevronRight } from 'lucide-react';
import {
  TeamMember,
  MemberType,
  Tag,
  loadTeamMembers,
  loadMemberTypes,
  loadTags,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersData, memberTypesData, tagsData] = await Promise.all([
          loadTeamMembers(),
          loadMemberTypes(),
          loadTags(),
        ]);
        setTeamMembers(membersData);
        setMemberTypes(memberTypesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMembers = teamMembers.filter((member) => {
    if (selectedTags.length === 0) return true;
    const memberTagIds = member.tagIds.split(',').map((id) => id.trim());
    return selectedTags.some((selectedTag) => memberTagIds.includes(selectedTag));
  });

  const membersByType = memberTypes.reduce((acc, type) => {
    const membersOfType = filteredMembers.filter((member) => member.memberTypeId === type.id);
    if (membersOfType.length > 0) {
      acc[type.id] = { type, members: membersOfType };
    }
    return acc;
  }, {} as Record<string, { type: MemberType; members: TeamMember[] }>);

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]);
  };

  const clearAllTags = () => setSelectedTags([]);

  const getTagName = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId.trim());
    return tag ? getLocalized(tag, 'name', locale) : '';
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
              <span className='text-slate-900'>{locale === 'ja' ? 'チーム' : 'Team'}</span>
            </nav>
            <h1 className='text-4xl md:text-5xl font-black text-slate-900 tracking-tight'>
              {locale === 'ja' ? '研究室メンバー' : 'Lab Members'}
            </h1>
            <p className='text-slate-500 mt-4 max-w-2xl font-medium'>
              {locale === 'ja' 
                ? '当研究室で活動する教授、学生、研究員をご紹介します。多様なバックグラウンドを持つメンバーが次世代の技術に挑んでいます。'
                : 'Meet the professors, students, and researchers at our lab. Members from diverse backgrounds are challenging next-generation technologies.'}
            </p>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          {/* Filters Area */}
          <div className='mb-16'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-sm font-black uppercase tracking-widest text-slate-900 flex items-center'>
                <Filter className='w-4 h-4 mr-2 text-primary' />
                {locale === 'ja' ? '研究分野で絞り込む' : 'Filter by Research area'}
              </h3>
              {selectedTags.length > 0 && (
                <button onClick={clearAllTags} className='text-[10px] font-black uppercase tracking-widest text-primary hover:underline'>
                  Clear All
                </button>
              )}
            </div>
            <div className='flex flex-wrap gap-2'>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-bold transition-all border',
                    selectedTags.includes(tag.id)
                      ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-primary/30'
                  )}
                >
                  {getLocalized(tag, 'name', locale)}
                </button>
              ))}
            </div>
          </div>

          {/* Members Groups */}
          <div className='space-y-24'>
            {Object.entries(membersByType).map(([typeId, { type, members }]) => (
              <div key={typeId}>
                <div className='flex items-center gap-4 mb-10'>
                  <div className='h-px flex-1 bg-slate-100'></div>
                  <h2 className='text-2xl font-black text-slate-900 tracking-tight uppercase'>
                    {getLocalized(type, 'name', locale)}
                  </h2>
                  <div className='h-px flex-1 bg-slate-100'></div>
                </div>

                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                  {members.map((member) => (
                    <div key={member.id} className='group bg-white border border-slate-100 p-8 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col items-center text-center'>
                      <div className='relative mb-6'>
                        <div className='absolute -inset-2 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors'></div>
                        <Avatar className='w-28 h-28 border-4 border-white shadow-lg relative'>
                          <AvatarImage
                            src={getStaticPath(`/generated_contents/member/${member.id}.jpg`)}
                            alt={getLocalized(member, 'name', locale)}
                            className='object-cover'
                          />
                          <AvatarFallback className='bg-slate-50 text-slate-300'>
                            <User className='w-10 h-10' />
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <h3 className='text-xl font-bold text-slate-900 group-hover:text-primary transition-colors'>
                        {getLocalized(member, 'name', locale)}
                      </h3>
                      <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 mb-4'>
                        {member.nameEn}
                      </p>

                      <p className='text-sm text-slate-500 mb-6 leading-relaxed line-clamp-2'>
                        {getLocalized(member, 'desc', locale)}
                      </p>

                      <div className='flex flex-wrap gap-1 justify-center mb-6'>
                        {member.tagIds.split(',').slice(0, 3).map((tagId, i) => (
                          <span key={i} className='text-[10px] font-bold px-2 py-0.5 bg-secondary text-primary rounded'>
                            #{getTagName(tagId)}
                          </span>
                        ))}
                      </div>

                      {member.memberTypeId === '1' && (
                        <ScrollAwareLink href={`/team/${member.id}`}>
                          <Button variant="outline" size="sm" className='rounded-full border-slate-200 text-slate-600 font-bold hover:bg-slate-50'>
                            View Profile
                            <ArrowRight className='w-3 h-3 ml-2' />
                          </Button>
                        </ScrollAwareLink>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className='text-center py-20'>
              <p className='text-slate-400 font-bold uppercase tracking-widest'>No members found with the selected tags.</p>
              <Button variant="link" onClick={clearAllTags} className="mt-2 text-primary">Clear all filters</Button>
            </div>
          )}
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
