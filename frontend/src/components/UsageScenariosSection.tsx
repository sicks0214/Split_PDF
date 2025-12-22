'use client';

import { useTranslations } from 'next-intl';

export default function UsageScenariosSection() {
  const t = useTranslations('split-pdf.useCases');

  const scenarios = [
    {
      title: t('case1.title'),
      description: t('case1.description')
    },
    {
      title: t('case2.title'),
      description: t('case2.description')
    },
    {
      title: t('case3.title'),
      description: t('case3.description')
    }
  ];

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {t('title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {scenarios.map((scenario, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {scenario.title}
              </h3>
              <p className="text-gray-600">
                {scenario.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
