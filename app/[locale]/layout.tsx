import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getMessages } from 'next-intl/server';
import { SHARE_VIRAL } from '@/lib/config/share';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const viral = SHARE_VIRAL[locale] || SHARE_VIRAL.en;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cogniseek.app';

  return {
    title: viral.title,
    description: viral.description,
    openGraph: {
      title: viral.title,
      description: viral.description,
      url: siteUrl,
      siteName: 'CogniSeek',
      locale: locale === 'zh-CN' ? 'zh_CN' : locale === 'zh-TW' ? 'zh_TW' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: viral.title,
      description: viral.description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
