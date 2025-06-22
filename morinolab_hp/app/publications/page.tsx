'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import {
  BookOpen,
  ArrowRight,
  Users,
  Tags,
  Filter,
  X,
  Calendar,
  Home,
  ChevronRight,
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
import Link from 'next/link';
import Image from 'next/image';

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 利用可能な年度を取得
  const availableYears = Array.from(
    new Set(
      publications.map((pub) =>
        new Date(pub.publishedDate).getFullYear().toString()
      )
    )
  ).sort((a, b) => parseInt(b) - parseInt(a)); // 新しい年度順

  // フィルタリングされたPublications
  const filteredPublications = publications.filter((publication) => {
    // タグフィルター
    if (selectedTags.length > 0) {
      const publicationTagIds = publication.tagIds
        .split(',')
        .map((id) => id.trim());
      if (
        !selectedTags.some((selectedTag) =>
          publicationTagIds.includes(selectedTag)
        )
      ) {
        return false;
      }
    }

    // 年度フィルター
    if (selectedYears.length > 0) {
      const publicationYear = new Date(publication.publishedDate)
        .getFullYear()
        .toString();
      if (!selectedYears.includes(publicationYear)) {
        return false;
      }
    }

    return true;
  });

  // タグの切り替え
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // 年度の切り替え
  const toggleYear = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  // 全フィルターをクリア
  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedYears([]);
  };

  // メンバー名を取得するヘルパー関数
  const getMemberName = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    return member ? member.nameJa : `Member #${memberId}`;
  };

  // タグ名を取得するヘルパー関数
  const getTagName = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    return tag ? tag.nameJa : `Tag #${tagId}`;
  };

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-black'>
        <ParticleBackground />
        <Navbar />
        <SectionWrapper className='py-32'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
            <p className='text-white mt-4'>Loading...</p>
          </div>
        </SectionWrapper>
        <Footer />
      </div>
    );
  }

  const hasAnyFilter = selectedTags.length > 0 || selectedYears.length > 0;

  return (
    <div className='min-h-screen relative overflow-x-hidden bg-black'>
      <ParticleBackground />
      <Navbar />

      <SectionWrapper className='py-32'>
        {/* パンくずリスト */}
        <div className='mb-8'>
          <nav className='flex items-center space-x-2 text-sm'>
            <Link
              href='/'
              className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
            >
              <Home className='w-4 h-4 mr-1' />
              Home
            </Link>
            <ChevronRight className='w-4 h-4 text-gray-500' />
            <span className='text-white font-medium'>Publications</span>
          </nav>
        </div>

        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold text-white mb-6'>Publications</h1>
          <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
            Our research contributions to the scientific community through
            peer-reviewed publications in top-tier journals and conferences.
          </p>
        </div>

        {/* フィルターセクション */}
        <div className='mb-12 space-y-8'>
          {/* フィルターヘッダー */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <Filter className='w-5 h-5 text-cyan-400' />
              <h3 className='text-xl font-bold text-white'>
                Filter Publications
              </h3>
            </div>
            <div className='h-8 flex items-center'>
              {hasAnyFilter ? (
                <button
                  onClick={clearAllFilters}
                  className='flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all duration-200 text-sm'
                >
                  <X className='w-3 h-3' />
                  <span>Clear All</span>
                </button>
              ) : (
                <div className='w-20'></div>
              )}
            </div>
          </div>

          {/* タグフィルター */}
          <div>
            <div className='flex items-center space-x-2 mb-3'>
              <Tags className='w-4 h-4 text-gray-400' />
              <h4 className='text-lg font-medium text-white'>Filter by Tag</h4>
            </div>
            <div className='flex flex-wrap gap-2'>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedTags.includes(tag.id)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-purple-400/30'
                  }`}
                >
                  {tag.nameJa}
                </button>
              ))}
            </div>
          </div>

          {/* 年度フィルター */}
          <div>
            <div className='flex items-center space-x-2 mb-3'>
              <Calendar className='w-4 h-4 text-gray-400' />
              <h4 className='text-lg font-medium text-white'>Filter by Year</h4>
            </div>
            <div className='flex flex-wrap gap-2'>
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedYears.includes(year)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-green-400/30'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          {filteredPublications.map((publication) => (
            <GlassCard
              key={publication.id}
              className='p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'
            >
              <div className='flex items-start space-x-6'>
                <div className='w-16 h-16 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                  <BookOpen className='w-8 h-8 text-white' />
                </div>

                <div className='flex-grow'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex items-center space-x-2'>
                        <Tags className='w-4 h-4 text-gray-400' />
                        <span className='text-gray-400 text-sm'>
                          {publication.tagIds
                            .split(',')
                            .map((id) => getTagName(id.trim()))
                            .slice(0, 2)
                            .join(', ')}
                          {publication.tagIds.split(',').length > 2 &&
                            ` +${publication.tagIds.split(',').length - 2}`}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Calendar className='w-4 h-4 text-gray-400' />
                        <span className='text-gray-400 text-sm'>
                          {new Date(publication.publishedDate).getFullYear()}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Users className='w-4 h-4 text-gray-400' />
                      <span className='text-gray-400 text-sm'>
                        {publication.authorMemberIds
                          .split(',')
                          .map((id) => getMemberName(id.trim()))
                          .slice(0, 2)
                          .join(', ')}
                        {publication.authorMemberIds.split(',').length > 2 &&
                          ` +${publication.authorMemberIds.split(',').length - 2}`}
                      </span>
                    </div>
                  </div>

                  <h3 className='text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300'>
                    {publication.titleJa}
                  </h3>

                  <p className='text-lg text-blue-400 mb-3'>
                    {publication.titleEn}
                  </p>

                  <div className='flex items-center space-x-4 mb-4'>
                    <p className='text-cyan-400 font-medium'>
                      {publication.publicationNameJa}
                    </p>
                    <span className='text-gray-500'>•</span>
                    <p className='text-gray-300'>
                      {publication.publicationNameEn}
                    </p>
                  </div>

                  <Link href={`/publications/${publication.id}`}>
                    <Button
                      variant='outline'
                      size='sm'
                      className='border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300'
                    >
                      View Details
                      <ArrowRight className='w-4 h-4 ml-2' />
                    </Button>
                  </Link>
                </div>

                {/* Thumbnail */}
                <div className='w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex-shrink-0'>
                  <Image
                    src={getStaticPath(
                      `/generated_contents/publication/${publication.id}.jpg`
                    )}
                    alt={publication.titleJa}
                    width={96}
                    height={96}
                    className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                    onError={(e) => {
                      e.currentTarget.src = getStaticPath(
                        '/img/noimage_publication.png'
                      );
                    }}
                  />
                </div>
              </div>

              {/* Subtle glow effect on hover */}
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
            </GlassCard>
          ))}
        </div>

        {filteredPublications.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-400 text-lg'>
              No publications found with the selected filters.
            </p>
            {hasAnyFilter && (
              <Button
                variant='outline'
                onClick={clearAllFilters}
                className='mt-4 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10'
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </SectionWrapper>

      <Footer />
    </div>
  );
}
