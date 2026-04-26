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

const siteUrl = 'https://bumbleo.onrender.com';

export const metadata: Metadata = {
  // ── Core ────────────────────────────────────────────────────────────────
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Bumbleo — Random Video Chat with Strangers',
    template: '%s | Bumbleo',
  },
  description:
    'Meet new people instantly with Bumbleo — free, anonymous random video chat. No sign-up needed to browse. Connect face-to-face with strangers around the world.',
  keywords: [
    'random video chat',
    'chat with strangers',
    'anonymous video chat',
    'omegle alternative',
    'meet new people online',
    'free video chat',
    'bumbleo',
    'live video chat',
    'stranger chat',
    'webcam chat',
  ],
  authors: [{ name: 'Bumbleo' }],
  creator: 'Bumbleo',
  publisher: 'Bumbleo',

  // ── Canonical & Robots ──────────────────────────────────────────────────
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Open Graph ──────────────────────────────────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Bumbleo',
    title: 'Bumbleo — Random Video Chat with Strangers',
    description:
      'Free anonymous video chat. Meet strangers, make friends, and have real conversations — no registration required.',
    images: [
      {
        url: '/og-image.png',   // place a 1200×630 image in /public/og-image.png
        width: 1200,
        height: 630,
        alt: 'Bumbleo — Random Video Chat',
      },
    ],
  },

  // ── Twitter / X Card ────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Bumbleo — Random Video Chat with Strangers',
    description:
      'Free anonymous video chat. Meet strangers, make friends, and have real conversations.',
    images: ['/og-image.png'],
    // creator: '@bumbleoapp',  // add when you have a Twitter account
  },

  // ── Verification ────────────────────────────────────────────────────────
  // verification: {
  //   google: 'your-google-site-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  // ── App / Mobile ────────────────────────────────────────────────────────
  applicationName: 'Bumbleo',
  appleWebApp: {
    capable: true,
    title: 'Bumbleo',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
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
