'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import CoreToolArea from '@/components/CoreToolArea';
import UsageScenariosSection from '@/components/UsageScenariosSection';
import HowToSection from '@/components/HowToSection';
import FAQSection from '@/components/FAQSection';

export default function SplitPDFPage() {
  const t = useTranslations('split-pdf');

  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: '/', external: true },
    { label: t('breadcrumb.category'), href: '/' },
    { label: t('breadcrumb.tool') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </header>

        <CoreToolArea />

        <div className="mt-12">
          <UsageScenariosSection />
          <HowToSection />
          <FAQSection />
        </div>
      </div>

      <Footer />
    </div>
  );
}
