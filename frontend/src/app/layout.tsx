import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from '@/components/ui/ReduxProvider';
import { AuthInitializer } from '@/components/ui/AuthInitializer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bumbleo — Random Video Chat',
  description:
    'Meet new people around the world instantly. Anonymous, fun, and free video chat with strangers.',
  keywords: ['video chat', 'random chat', 'meet strangers', 'anonymous chat', 'bumbleo'],
  openGraph: {
    title: 'Bumbleo — Random Video Chat',
    description: 'Meet new people around the world instantly.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Google AdSense — replace ca-pub-XXXXXXXXXXXXXXXX with your ID */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous"></script> */}
      </head>
      <body className="font-sans antialiased">
        <ReduxProvider>
          <AuthInitializer />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
