'use client';

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
  return (
    <div className='min-h-screen relative overflow-x-hidden flex flex-col'>
      <ParticleBackground />
      <Navbar />

      <main className='flex-1'>
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
