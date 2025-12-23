'use client';

import { useTranslations } from 'next-intl';

type SplitMode = 'range' | 'fixed' | 'extract';

interface SplitConfig {
  mode: SplitMode;
  range?: string;
  pagesPerFile?: number;
  pages?: string;
}

interface ParameterInputProps {
  mode: SplitMode;
  config: SplitConfig;
  onConfigChange: (config: SplitConfig) => void;
  disabled?: boolean;
}

export default function ParameterInput({ mode, config, onConfigChange, disabled }: ParameterInputProps) {
  const t = useTranslations('split-pdf.parameters');
  const handleRangeChange = (value: string) => {
    onConfigChange({ ...config, range: value });
  };

  const handlePagesPerFileChange = (value: string) => {
    const num = parseInt(value, 10);
    onConfigChange({ ...config, pagesPerFile: isNaN(num) ? undefined : num });
  };

  const handlePagesChange = (value: string) => {
    onConfigChange({ ...config, pages: value });
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>

      {mode === 'range' && (
        <div>
          <label htmlFor="range-input" className="block text-sm font-medium text-gray-700 mb-2">
            {t('rangeLabel')}
          </label>
          <input
            id="range-input"
            type="text"
            placeholder={t('rangePlaceholder')}
            value={config.range || ''}
            onChange={(e) => handleRangeChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-gray-600">
            {t('rangeHelp')}
          </p>
        </div>
      )}

      {mode === 'fixed' && (
        <div>
          <label htmlFor="pages-per-file" className="block text-sm font-medium text-gray-700 mb-2">
            {t('fixedLabel')}
          </label>
          <input
            id="pages-per-file"
            type="number"
            min="1"
            placeholder={t('fixedPlaceholder')}
            value={config.pagesPerFile || ''}
            onChange={(e) => handlePagesPerFileChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-gray-600">
            {t('fixedHelp')}
          </p>
        </div>
      )}

      {mode === 'extract' && (
        <div>
          <label htmlFor="pages-input" className="block text-sm font-medium text-gray-700 mb-2">
            {t('extractLabel')}
          </label>
          <input
            id="pages-input"
            type="text"
            placeholder={t('extractPlaceholder')}
            value={config.pages || ''}
            onChange={(e) => handlePagesChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-gray-600">
            {t('extractHelp')}
          </p>
        </div>
      )}
    </div>
  );
}
