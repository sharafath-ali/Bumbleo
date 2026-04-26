import type { Metadata } from 'next';

// Chat page is an authenticated app view — not a public page for Google to index
export const metadata: Metadata = {
  title: 'Chat',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
