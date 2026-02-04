import type { Metadata, Viewport } from 'next';
import { Outfit, Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import Providers from '@/components/providers/Providers';
import './globals.css';

// Configure fonts to match the existing design system
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display', // Matches standard variable name used in globals.css
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body', // Matches standard variable name used in globals.css
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#9EE53B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.markmorph.in'),
  title: {
    default: 'Mark Morph - WiFi & Marketing Platform',
    template: '%s | Mark Morph',
  },
  description: 'Turn your WiFi into a marketing machine. Engage customers, collect leads, and boost sales with our captive portal solution.',
  applicationName: 'MarkMorph',
  authors: [{ name: 'Mark Morph Team' }],
  keywords: ['WiFi Marketing', 'Captive Portal', 'Advertising', 'Digital Marketing', 'Customer Engagement'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'apple-touch-icon-precomposed', url: '/apple-icon-precomposed.png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.markmorph.in',
    siteName: 'Mark Morph',
    title: 'Mark Morph - WiFi & Marketing Platform',
    description: 'Turn your WiFi into a marketing machine. Engage customers, collect leads, and boost sales.',
    images: [
      {
        url: '/android-icon-192x192.png',
        width: 192,
        height: 192,
        alt: 'Mark Morph Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    site: '@MarkMorph',
    title: 'Mark Morph - WiFi & Marketing Platform',
    description: 'Turn your WiFi into a marketing machine. Engage customers, collect leads, and boost sales.',
    images: ['/android-icon-192x192.png'],
  },
  verification: {
    google: 'google8f716fa368876aea',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
