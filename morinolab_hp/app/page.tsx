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
import { Contact } from '@/components/sections/contact';

export default function Home() {
  return (
    <div className='min-h-screen relative overflow-x-hidden'>
      <ParticleBackground />
      <Navbar />

      <main>
        <section id='home'>
          <Hero />
        </section>
        <Research />
        <Lectures />
        <Team />
        <News />
        <Publications />
        <Awards />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
