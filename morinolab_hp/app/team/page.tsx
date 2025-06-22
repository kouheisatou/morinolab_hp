'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  ArrowRight,
  Users,
  Filter,
  X,
  GraduationCap,
  Home,
  ChevronRight,
} from 'lucide-react';
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
import Link from 'next/link';

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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
    }

    fetchData();
  }, []);

  // タグでフィルタリングされたメンバー
  const filteredMembers = teamMembers.filter((member) => {
    if (selectedTags.length === 0) return true;
    const memberTagIds = member.tagIds.split(',').map((id) => id.trim());
    return selectedTags.some((selectedTag) =>
      memberTagIds.includes(selectedTag)
    );
  });

  // メンバータイプ別にグループ化
  const membersByType = memberTypes.reduce(
    (acc, type) => {
      const membersOfType = filteredMembers.filter(
        (member) => member.memberTypeId === type.id
      );
      if (membersOfType.length > 0) {
        acc[type.id] = {
          type,
          members: membersOfType,
        };
      }
      return acc;
    },
    {} as Record<string, { type: MemberType; members: TeamMember[] }>
  );

  // タグの切り替え
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // 全タグをクリア
  const clearAllTags = () => {
    setSelectedTags([]);
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
            <span className='text-white font-medium'>Team</span>
          </nav>
        </div>

        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold text-white mb-6'>Meet Our Team</h1>
          <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
            Our diverse team of researchers, faculty, and students are united by
            their passion for advancing the frontiers of quantum computing and
            related technologies.
          </p>
        </div>

        {/* タグフィルター */}
        <div className='mb-12'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center space-x-2'>
              <Filter className='w-5 h-5 text-cyan-400' />
              <h3 className='text-xl font-bold text-white'>
                Filter by Research Tags
              </h3>
            </div>
            <div className='h-8 flex items-center'>
              {selectedTags.length > 0 ? (
                <button
                  onClick={clearAllTags}
                  className='flex items-center space-x-1 px-3 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all duration-200 text-sm'
                >
                  <X className='w-3 h-3' />
                  <span>Clear</span>
                </button>
              ) : (
                <div className='w-16'></div>
              )}
            </div>
          </div>

          <div className='flex flex-wrap gap-3'>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedTags.includes(tag.id)
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-cyan-400/30'
                }`}
              >
                {tag.nameJa}
              </button>
            ))}
          </div>
        </div>

        {/* メンバータイプ別セクション */}
        {Object.entries(membersByType).map(([typeId, { type, members }]) => (
          <div key={typeId} className='mb-16'>
            <div className='flex items-center space-x-3 mb-8'>
              <div className='w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center'>
                {typeId === '1' ? (
                  <User className='w-5 h-5 text-white' />
                ) : (
                  <GraduationCap className='w-5 h-5 text-white' />
                )}
              </div>
              <h2 className='text-3xl font-bold text-white'>{type.nameJa}</h2>
              <h3 className='text-xl text-gray-400'>{type.nameEn}</h3>
              <Badge
                variant='secondary'
                className='bg-blue-500/20 text-blue-300 border-blue-500/30'
              >
                {members.length} member{members.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {members.map((member) => (
                <GlassCard
                  key={member.id}
                  className='p-6 text-center relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'
                >
                  <div className='relative mb-4'>
                    <Avatar className='w-20 h-20 mx-auto ring-4 ring-white/20 group-hover:ring-white/40 group-hover:scale-110 transition-all duration-300'>
                      <AvatarImage
                        src={getStaticPath(
                          `/generated_contents/member/${member.id}.jpg`
                        )}
                        alt={member.nameJa}
                        onError={(e) => {
                          e.currentTarget.src = '/img/noimage_campany.svg';
                        }}
                      />
                      <AvatarFallback className='bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-lg'>
                        <User className='w-8 h-8' />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <h3 className='text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors duration-300'>
                    {member.nameJa}
                  </h3>

                  <p className='text-cyan-400 text-sm mb-3'>{member.nameEn}</p>

                  <p className='text-gray-300 text-xs mb-3 leading-relaxed line-clamp-2'>
                    {member.descJa}
                  </p>

                  {member.gradYear && (
                    <p className='text-gray-400 text-xs mb-3'>
                      Graduation: {member.gradYear}
                    </p>
                  )}

                  {/* メンバーのタグ */}
                  <div className='flex flex-wrap gap-1 mb-4'>
                    {member.tagIds
                      .split(',')
                      .slice(0, 3)
                      .map((tagId, index) => (
                        <span
                          key={index}
                          className='px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-xs border border-purple-400/30'
                        >
                          {getTagName(tagId.trim())}
                        </span>
                      ))}
                    {member.tagIds.split(',').length > 3 && (
                      <span className='px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs'>
                        +{member.tagIds.split(',').length - 3}
                      </span>
                    )}
                  </div>

                  {member.memberTypeId === '1' && (
                    <Link href={`/team/${member.id}`}>
                      <Button
                        variant='outline'
                        size='sm'
                        className='border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300'
                      >
                        View Profile
                        <ArrowRight className='w-4 h-4 ml-2' />
                      </Button>
                    </Link>
                  )}

                  {/* Subtle glow effect on hover */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                </GlassCard>
              ))}
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-400 text-lg'>
              No team members found with the selected tags.
            </p>
            {selectedTags.length > 0 && (
              <Button
                variant='outline'
                onClick={clearAllTags}
                className='mt-4 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10'
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </SectionWrapper>

      <Footer />
    </div>
  );
}
