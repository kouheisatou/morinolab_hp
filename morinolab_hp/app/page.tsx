'use client';

import { useEffect } from 'react';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Hero } from '@/components/sections/hero';
import { Research } from '@/components/sections/research';
import { Lectures } from '@/components/sections/lectures';
import { Team } from '@/components/sections/team';
import { News } from '@/components/sections/news';
import { Publications } from '@/components/sections/publications';
import { Awards } from '@/components/sections/awards';
import { Career } from '@/components/sections/career';
import { Contact } from '@/components/sections/contact';

export default function Home() {
  useEffect(() => {
    // URLのハッシュに基づいてスクロール
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash) as HTMLElement;
          if (element) {
            const elementPosition = element.offsetTop - 80; // ナビバーの高さ分を引く
            window.scrollTo({
              top: elementPosition,
              behavior: 'smooth',
            });
          }
        }, 100);
      }
    };

    // 初回ロード時
    handleHashChange();

    // ハッシュ変更時
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className='min-h-screen relative overflow-x-hidden'>
      <ParticleBackground />
      <Navbar />

      <main>
        <section id='home'>
          <Hero />
        </section>
        <Research />
        <Team />
        <Lectures />
        <News />
        <Publications />
        <Awards />
        <Career />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
