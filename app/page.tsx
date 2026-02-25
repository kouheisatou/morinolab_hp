'use client';

import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Hero } from '@/components/sections/hero';
import { Research } from '@/components/sections/research';
import { Team } from '@/components/sections/team';
import { News } from '@/components/sections/news';
import { Awards } from '@/components/sections/awards';
import { Career } from '@/components/sections/career';
import { Contact } from '@/components/sections/contact';

export default function Home() {
  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Navbar />

      <main className='flex-1'>
        <section id='home'>
          <Hero />
        </section>
        
        <div className="space-y-0">
          <Research />
          <News />
          <Team />
          
          <section className='bg-slate-50 border-y border-slate-100'>
            <div className='max-w-7xl mx-auto px-4 py-20'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
                <Awards />
                <Career />
              </div>
            </div>
          </section>
          
          <Contact />
        </div>
      </main>

      <Footer />
    </div>
  );
}
