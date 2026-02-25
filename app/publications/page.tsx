'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import {
  BookOpen,
  Users,
  Tags,
  Filter,
  X,
  Calendar,
  Home,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  Publication,
  TeamMember,
  Tag,
  loadPublications,
  loadTeamMembers,
  loadTags,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import { cn } from '@/lib/utils';

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pubsData, membersData, tagsData] = await Promise.all([
          loadPublications(),
          loadTeamMembers(),
          loadTags(),
        ]);
        setPublications(pubsData);
        setTeamMembers(membersData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableYears = Array.from(
    new Set(
      publications.map((pub) =>
        new Date(pub.publishedDate).getFullYear().toString()
      )
    )
  ).sort((a, b) => parseInt(b) - parseInt(a));

  const filteredPublications = publications.filter((publication) => {
    if (selectedTags.length > 0) {
      const publicationTagIds = publication.tagIds.split(',').map((id) => id.trim());
      if (!selectedTags.some((selectedTag) => publicationTagIds.includes(selectedTag))) return false;
    }
    if (selectedYears.length > 0) {
      const publicationYear = new Date(publication.publishedDate).getFullYear().toString();
      if (!selectedYears.includes(publicationYear)) return false;
    }
    return true;
  });

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]);
  };

  const toggleYear = (year: string) => {
    setSelectedYears((prev) => prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]);
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedYears([]);
  };

  const getMemberName = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    return member ? getLocalized(member, 'name', locale) : '';
  };

  const getTagName = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    return tag ? getLocalized(tag, 'name', locale) : '';
  };

  if (loading) return null;

  const hasAnyFilter = selectedTags.length > 0 || selectedYears.length > 0;

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Navbar />

      <main className='flex-1 pt-20'>
        <div className='bg-slate-50 border-b border-slate-100 py-12'>
          <div className='max-w-7xl mx-auto px-4'>
            <nav className='flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6'>
              <ScrollAwareLink href='/' className='hover:text-primary transition-colors'>Home</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <span className='text-slate-900'>{locale === 'ja' ? '論文' : 'Publications'}</span>
            </nav>
            <h1 className='text-4xl md:text-5xl font-black text-slate-900 tracking-tight'>
              {locale === 'ja' ? '研究論文' : 'Publications'}
            </h1>
            <p className='text-slate-500 mt-4 max-w-2xl font-medium'>
              {locale === 'ja' 
                ? '国内外の学会やジャーナルで発表された、当研究室の最新の研究成果をご覧いただけます。'
                : 'Explore our latest research findings published in domestic and international conferences and journals.'}
            </p>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          <div className='grid lg:grid-cols-4 gap-12'>
            {/* Sidebar Filters */}
            <div className='lg:col-span-1 space-y-10'>
              <div>
                <div className='flex items-center justify-between mb-6'>
                  <h3 className='text-sm font-black uppercase tracking-widest text-slate-900 flex items-center'>
                    <Filter className='w-4 h-4 mr-2 text-primary' />
                    {locale === 'ja' ? 'フィルター' : 'Filters'}
                  </h3>
                  {hasAnyFilter && (
                    <button onClick={clearAllFilters} className='text-[10px] font-black uppercase tracking-widest text-primary hover:underline'>
                      Clear All
                    </button>
                  )}
                </div>

                <div className='space-y-8'>
                  <div className='space-y-4'>
                    <h4 className='text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center'>
                      <Tags className='w-3 h-3 mr-2' />
                      {locale === 'ja' ? 'タグで絞り込む' : 'By Tags'}
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
                            selectedTags.includes(tag.id)
                              ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                              : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30'
                          )}
                        >
                          {getLocalized(tag, 'name', locale)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <h4 className='text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center'>
                      <Calendar className='w-3 h-3 mr-2' />
                      {locale === 'ja' ? '年度で絞り込む' : 'By Year'}
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {availableYears.map((year) => (
                        <button
                          key={year}
                          onClick={() => toggleYear(year)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border',
                            selectedYears.includes(year)
                              ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                              : 'bg-white border-slate-100 text-slate-600 hover:border-primary/30'
                          )}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className='lg:col-span-3'>
              <div className='mb-6 flex items-center justify-between'>
                <p className='text-sm text-slate-400 font-bold'>
                  Showing <span className='text-slate-900'>{filteredPublications.length}</span> results
                </p>
              </div>

              <div className='space-y-4'>
                {filteredPublications.map((publication) => (
                  <ScrollAwareLink
                    key={publication.id}
                    href={`/publications/${publication.id}`}
                    className='group block'
                  >
                    <div className='bg-white border border-slate-100 p-6 md:p-8 rounded-2xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col md:flex-row gap-6 md:items-center'>
                      <div className='w-20 h-20 bg-secondary rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform'>
                        <Image
                          src={getStaticPath(`/generated_contents/publication/${publication.id}.jpg`)}
                          alt={getLocalized(publication, 'title', locale)}
                          width={80}
                          height={80}
                          className='object-cover w-full h-full'
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getStaticPath('/img/noimage_publication.png');
                          }}
                        />
                      </div>

                      <div className='flex-1'>
                        <div className='flex flex-wrap gap-2 mb-3'>
                          {publication.tagIds.split(',').map(id => getTagName(id.trim())).filter(Boolean).map(tagName => (
                            <span key={tagName} className='text-[10px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-2 py-0.5 rounded'>
                              {tagName}
                            </span>
                          ))}
                        </div>
                        <h3 className='text-xl font-bold text-slate-900 group-hover:text-primary transition-colors mb-3 leading-tight'>
                          {getLocalized(publication, 'title', locale)}
                        </h3>
                        <div className='flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-bold text-slate-400 uppercase tracking-widest'>
                          <div className='flex items-center'>
                            <BookOpen className='w-3 h-3 mr-1.5 text-primary/40' />
                            {getLocalized(publication, 'publicationName', locale)}
                          </div>
                          <div className='flex items-center'>
                            <Users className='w-3 h-3 mr-1.5 text-primary/40' />
                            {publication.authorMemberIds.split(',').map(id => getMemberName(id.trim())).join(', ')}
                          </div>
                          <div className='flex items-center'>
                            <Calendar className='w-3 h-3 mr-1.5 text-primary/40' />
                            {publication.publishedDate}
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center justify-end'>
                        <div className='w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all'>
                          <ArrowRight className='w-4 h-4 text-slate-300 group-hover:text-white transition-colors' />
                        </div>
                      </div>
                    </div>
                  </ScrollAwareLink>
                ))}
              </div>

              {filteredPublications.length === 0 && (
                <div className='text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200'>
                  <p className='text-slate-400 font-bold uppercase tracking-widest'>No publications found</p>
                  <Button variant="link" onClick={clearAllFilters} className="mt-2 text-primary">Clear all filters</Button>
                </div>
              )}
            </div>
          </div>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
