'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { MapPin, Mail, Phone, ExternalLink, ArrowRight } from 'lucide-react';
import { useLocale } from '@/contexts/locale';

export function Contact() {
  const { locale } = useLocale();

  return (
    <section id='contact' className='bg-white py-24'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='text-center max-w-2xl mx-auto mb-16'>
          <h2 className='text-primary font-bold tracking-wider mb-2 uppercase text-sm'>Contact & Access</h2>
          <h3 className='text-3xl md:text-4xl font-bold text-slate-900'>
            {locale === 'ja' ? 'お問い合わせ・アクセス' : 'Get In Touch'}
          </h3>
          <p className='text-lg text-slate-600 mt-4'>
            {locale === 'ja'
              ? '共同研究や詳細情報にご興味がありますか？お気軽にご連絡ください。'
              : "Interested in collaborating or learning more about our research? We'd love to hear from you."}
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-8'>
          <div className='bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-100'>
            <h4 className='text-xl font-bold text-slate-900 mb-8 flex items-center'>
              <Mail className='w-5 h-5 mr-3 text-primary' />
              {locale === 'ja' ? '連絡先情報' : 'Contact Information'}
            </h4>

            <div className='space-y-8'>
              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0'>
                  <User className='w-5 h-5 text-primary' />
                </div>
                <div>
                  <h5 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-1'>Laboratory</h5>
                  <p className='text-slate-700 font-medium leading-relaxed'>
                    {locale === 'ja'
                      ? '芝浦工業大学 工学部 情報工学科 森野博章研究室'
                      : 'Morino Laboratory, Shibaura Institute of Technology'}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0'>
                  <MapPin className='w-5 h-5 text-primary' />
                </div>
                <div>
                  <h5 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-1'>Address</h5>
                  <p className='text-slate-700 font-medium leading-relaxed'>
                    〒135-8548<br />
                    {locale === 'ja'
                      ? '東京都江東区豊洲3-7-5 研究棟12階 12-I-32号室'
                      : '12-I-32, 12F Research Bldg, 3-7-5 Toyosu, Koto-ku, Tokyo'}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <div className='w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0'>
                  <Phone className='w-5 h-5 text-primary' />
                </div>
                <div>
                  <h5 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-1'>Phone / Fax</h5>
                  <p className='text-slate-700 font-medium'>
                    03-5859-8254
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-slate-50 rounded-3xl p-8 md:p-10 border border-slate-100 flex flex-col'>
            <h4 className='text-xl font-bold text-slate-900 mb-8 flex items-center'>
              <MapPin className='w-5 h-5 mr-3 text-primary' />
              {locale === 'ja' ? 'アクセス' : 'Access'}
            </h4>

            <div className='space-y-6 flex-grow'>
              <p className='text-slate-600 leading-relaxed'>
                {locale === 'ja'
                  ? '芝浦工業大学 豊洲キャンパスへは以下の公共交通機関が便利です。'
                  : 'The Toyosu Campus is easily accessible via the following public transportation.'}
              </p>

              <ul className='space-y-4'>
                <li className='flex items-center text-slate-700 font-medium'>
                  <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                  {locale === 'ja' ? '有楽町線 豊洲駅 1c出口 徒歩7分' : '7-min walk from Toyosu Stn. (Yurakucho Line)'}
                </li>
                <li className='flex items-center text-slate-700 font-medium'>
                  <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                  {locale === 'ja' ? 'ゆりかもめ 豊洲駅 徒歩9分' : '9-min walk from Toyosu Stn. (Yurikamome Line)'}
                </li>
                <li className='flex items-center text-slate-700 font-medium'>
                  <div className='w-2 h-2 bg-primary rounded-full mr-3'></div>
                  {locale === 'ja' ? 'JR 越中島駅 徒歩15分' : '15-min walk from Etchujima Stn. (JR Line)'}
                </li>
              </ul>
            </div>

            <div className='mt-8 pt-8 border-t border-slate-200'>
              <Button
                asChild
                className='w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl group'
              >
                <a
                  href='https://maps.app.goo.gl/KnDBYQ3JDZ9r1TKZ6'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {locale === 'ja' ? 'Google マップで開く' : 'Open in Google Maps'}
                  <ExternalLink className='w-4 h-4 ml-2' />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function User(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
