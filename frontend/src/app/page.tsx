import type { Metadata } from 'next';
import HeroSection from '@/components/landing/HeroSection';
import HowItWorks from '@/components/landing/HowItWorks';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import UserProfileMenu from '@/components/ui/UserProfileMenu';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Meet Strangers Online — Free Random Video Chat',
  description:
    'Bumbleo is the best free random video chat to meet strangers online. Anonymous, instant, and no download required. Start chatting face-to-face in seconds.',
  alternates: {
    canonical: 'https://bumbleo.onrender.com',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Bumbleo',
  url: 'https://bumbleo.onrender.com',
  description: 'Free anonymous random video chat to meet strangers online.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://bumbleo.onrender.com',
  },
};

export default function LandingPage() {
  return (
    <main style={{ position: 'relative', overflow: 'hidden' }}>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Top Navigation Header */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50,
      }}>
        <Link href="/" className="nav-brand gradient-text" style={{ fontSize: '24px', fontWeight: 800, textDecoration: 'none' }}>
          Bumbleo
        </Link>
        <UserProfileMenu />
      </header>

      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}

