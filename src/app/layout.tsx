import '../style.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import Script from 'next/script';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '600', '700'] });

export const metadata: Metadata = {
  title: 'Ali | Creative Developer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <div id="cursor-dot"></div>
        <div id="cursor-outline"></div>
        <div id="spotlight-bg"></div>
        {children}
      </body>
    </html>
  );
}
