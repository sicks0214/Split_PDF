'use client';

import { useTranslations } from 'next-intl';

type SplitMode = 'range' | 'fixed' | 'extract';

interface ModeSelectorProps {
  mode: SplitMode;
  onModeChange: (mode: SplitMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({ mode, onModeChange, disabled }: ModeSelectorProps) {
  const t = useTranslations('split-pdf.mode');

  const modes = [
    {
      id: 'range' as SplitMode,
      icon: '📄',
      title: t('range'),
      description: t('rangeDesc')
    },
    {
      id: 'fixed' as SplitMode,
      icon: '📊',
      title: t('fixed'),
      description: t('fixedDesc')
    },
    {
      id: 'extract' as SplitMode,
      icon: '🎯',
      title: t('extract'),
      description: t('extractDesc')
    }
  ];

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('title')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            disabled={disabled}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              mode === m.id
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{m.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{m.description}</p>
              </div>
            </div>
            {mode === m.id && (
              <div className="mt-3 flex items-center text-primary-600 text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Selected
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
