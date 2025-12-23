import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Split PDF - Free Online PDF Splitter Tool',
  description: 'Split PDF files by page range, fixed pages, or extract specific pages. Fast, secure, and free online PDF splitting tool.',
  keywords: ['split pdf', 'pdf splitter', 'divide pdf', 'extract pdf pages', 'pdf tools'],
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
