'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Atom } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks/use-scroll-position';

const navItems = [
  { name: 'Home', href: 'home' },
  { name: 'Research', href: 'research' },
  { name: 'Team', href: 'team' },
  { name: 'Lectures', href: 'lectures' },
  { name: 'News', href: 'news' },
  { name: 'Publications', href: 'publications' },
  { name: 'Awards', href: 'awards' },
  { name: 'Career', href: 'career' },
  { name: 'Contact', href: 'contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollToSection } = useScrollPosition();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    scrollToSection(href);
    setIsOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-black/80 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
      )}
    >
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          <button
            onClick={() => scrollToSection('home')}
            className='flex items-center space-x-2 group transition-all duration-200 hover:scale-105'
          >
            <Atom className='w-8 h-8 text-blue-400 group-hover:text-cyan-400 transition-colors duration-200' />
            <span className='text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-200'>
              MorinoLab
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className='text-gray-300 hover:text-white transition-colors duration-200 font-medium relative group'
              >
                {item.name}
                <div className='absolute bottom-[-4px] left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300'></div>
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsOpen(!isOpen)}
              className='text-white hover:bg-white/10 transition-all duration-200'
            >
              {isOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className='md:hidden bg-black/90 backdrop-blur-md border-t border-white/10 animate-in slide-in-from-top-5 duration-200'>
            <div className='py-4 space-y-2'>
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.href)}
                  className='block w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 relative group'
                >
                  {item.name}
                  <div className='absolute left-4 bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-8 transition-all duration-300'></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
