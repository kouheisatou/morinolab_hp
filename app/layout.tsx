import './globals.css';
import type { Metadata } from 'next';
import { Inter, M_PLUS_Rounded_1c } from 'next/font/google';
import ClientProviders from './ClientProviders';

const inter = Inter({ subsets: ['latin'] });
const mplusRounded = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '森野研究室 - 移動通信ネットワーク研究室',
  description:
    '移動通信ネットワーク研究室（森野研究室）の公式ウェブサイトです。ネットワーク分野の研究に取り組んでいます。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ja'>
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
