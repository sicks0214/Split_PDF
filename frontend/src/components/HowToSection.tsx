'use client';

import { useTranslations } from 'next-intl';

export default function HowToSection() {
  const t = useTranslations('split-pdf.howTo');

  const steps = [
    {
      number: 1,
      title: t('step1.title'),
      description: t('step1.description')
    },
    {
      number: 2,
      title: t('step2.title'),
      description: t('step2.description')
    },
    {
      number: 3,
      title: t('step3.title'),
      description: t('step3.description')
    },
    {
      number: 4,
      title: t('step4.title'),
      description: t('step4.description')
    }
  ];

  return (
    <section className="w-full py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {t('title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
