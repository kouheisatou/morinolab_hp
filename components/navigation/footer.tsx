'use client';

import { Laptop, Mail, MapPin, ExternalLink } from 'lucide-react';
import { useLocale } from '@/contexts/locale';

export function Footer() {
  const { locale } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className='bg-slate-900 text-slate-400 py-20'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16'>
          <div className='lg:col-span-2 space-y-6'>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                <Laptop className='text-white w-5 h-5' />
              </div>
              <span className='text-xl font-black text-white tracking-tighter'>MORINO<span className='text-primary'>LAB</span></span>
            </div>
            <p className='text-slate-400 leading-relaxed max-w-md'>
              {locale === 'ja'
                ? '芝浦工業大学 工学部 情報工学科。移動通信ネットワーク研究室（森野博章研究室）は、次世代のネットワーク技術を通じて社会の発展に貢献します。'
                : 'Department of Information Science and Engineering, Shibaura Institute of Technology. Morino Laboratory contributes to the development of society through next-generation network technologies.'}
            </p>
          </div>

          <div>
            <h4 className='text-white font-bold mb-6'>{locale === 'ja' ? 'リンク' : 'Links'}</h4>
            <ul className='space-y-4 text-sm font-medium'>
              <li><a href="https://www.shibaura-it.ac.jp/" target="_blank" className='hover:text-primary transition-colors flex items-center'>Shibaura Institute of Technology <ExternalLink className='w-3 h-3 ml-2' /></a></li>
              <li><a href="https://www.is.shibaura-it.ac.jp/" target="_blank" className='hover:text-primary transition-colors flex items-center'>Department of Information Science <ExternalLink className='w-3 h-3 ml-2' /></a></li>
            </ul>
          </div>

          <div>
            <h4 className='text-white font-bold mb-6'>{locale === 'ja' ? '所在地' : 'Location'}</h4>
            <p className='text-sm leading-relaxed'>
              〒135-8548<br />
              {locale === 'ja'
                ? '東京都江東区豊洲3-7-5 研究棟12階 12-I-32'
                : '12-I-32, 12F Research Bldg, 3-7-5 Toyosu, Koto-ku, Tokyo'}
            </p>
          </div>
        </div>

        <div className='pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4'>
          <p className='text-xs font-medium uppercase tracking-widest'>
            © {year} Morino Laboratory. All rights reserved.
          </p>
          <div className='flex gap-6 text-xs font-bold uppercase tracking-widest'>
            <a href="#home" className='hover:text-white transition-colors'>{locale === 'ja' ? 'トップ' : 'Home'}</a>
            <a href="#contact" className='hover:text-white transition-colors'>{locale === 'ja' ? 'お問い合わせ' : 'Contact'}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
