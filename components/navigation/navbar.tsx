'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Laptop } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { LanguageSwitcher } from '@/components/navigation/language-switcher';
import { useLocale } from '@/contexts/locale';
import { useScrollPosition } from '@/contexts/scroll-position';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocale();
  const { saveScrollPosition } = useScrollPosition();

  const navItems = [
    { name: locale === 'ja' ? 'ホーム' : 'Home', href: 'home' },
    { name: locale === 'ja' ? '研究' : 'Research', href: 'research' },
    { name: locale === 'ja' ? 'ニュース' : 'News', href: 'news' },
    { name: locale === 'ja' ? 'メンバー' : 'Team', href: 'team' },
    { name: locale === 'ja' ? '論文' : 'Publications', href: 'publications' },
    { name: locale === 'ja' ? 'お問い合わせ' : 'Contact', href: 'contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    saveScrollPosition();
    if (href === 'publications') {
      router.push('/publications');
    } else if (pathname === '/') {
      const element = document.getElementById(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/#${href}`);
    }
    setIsOpen(false);
  };

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center',
      scrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm' : 'bg-white'
    )}>
      <div className='max-w-7xl mx-auto px-4 w-full flex items-center justify-between'>
        <button
          onClick={() => router.push('/')}
          className='flex items-center space-x-2 group'
        >
          <div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform'>
            <Laptop className='text-white w-6 h-6' />
          </div>
          <div className='flex flex-col items-start leading-none'>
            <span className='text-xl font-black text-slate-900 tracking-tighter'>MORINO<span className='text-primary'>LAB</span></span>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5'>SIT Information Science</span>
          </div>
        </button>

        {/* Desktop Nav */}
        <div className='hidden lg:flex items-center space-x-1'>
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.href)}
              className='px-4 py-2 text-sm font-bold text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-all'
            >
              {item.name}
            </button>
          ))}
          <div className='ml-4 pl-4 border-l border-slate-100'>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className='lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg'
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className='lg:hidden fixed inset-0 top-20 bg-white z-40 animate-in fade-in slide-in-from-top-4'>
          <div className='p-6 space-y-2'>
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className='w-full text-left px-4 py-4 text-lg font-bold text-slate-900 border-b border-slate-50 hover:bg-slate-50'
              >
                {item.name}
              </button>
            ))}
            <div className='pt-6'>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
