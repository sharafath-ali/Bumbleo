import type { Metadata } from 'next';

// All auth pages are private — prevent Google from indexing them
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
