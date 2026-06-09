import { Inter, Fraunces } from 'next/font/google';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/lib/seo/jsonld';
import { organization, localBusiness } from '@/lib/seo/schema';
import { locales, isLocale, type Locale } from '@/lib/i18n/config';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/motion/PageTransition';
import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

const sans = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-app-sans',
});

const serif = Fraunces({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  weight: ['400', '500', '600'],
  variable: '--font-app-serif',
});

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} className={`${sans.variable} ${serif.variable}`}>
      <body>
        <JsonLd data={organization()} />
        <JsonLd data={localBusiness()} />
        <Nav locale={locale as Locale} />
        <MotionConfig reducedMotion="user">
          <main className="relative"><PageTransition>{children}</PageTransition></main>
        </MotionConfig>
        <Footer locale={locale as Locale} />
      </body>
    </html>
  );
}
