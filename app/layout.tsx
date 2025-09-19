import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TinyGrid - Mini Spreadsheet',
  description: 'A minimal spreadsheet application with formulas and ranges',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-neutral-50 via-primary-50/30 to-accent-50/20 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}