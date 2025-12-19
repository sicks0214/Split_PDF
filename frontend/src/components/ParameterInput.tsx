'use client';

import { SplitMode, SplitConfig } from '@/types';

interface ParameterInputProps {
  mode: SplitMode;
  config: SplitConfig;
  onConfigChange: (config: SplitConfig) => void;
  disabled?: boolean;
}

export default function ParameterInput({ mode, config, onConfigChange, disabled }: ParameterInputProps) {
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
            Page Range
          </label>
          <input
            id="range-input"
            type="text"
            placeholder="e.g., 1-3, 5, 8-10"
            value={config.range || ''}
            onChange={(e) => handleRangeChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-gray-600">
            Enter page ranges separated by commas. Use hyphen for ranges (e.g., 1-3, 5, 8-10)
          </p>
        </div>
      )}

      {mode === 'fixed' && (
        <div>
          <label htmlFor="pages-per-file" className="block text-sm font-medium text-gray-700 mb-2">
            Pages Per File
          </label>
          <input
            id="pages-per-file"
            type="number"
            min="1"
            placeholder="e.g., 5"
            value={config.pagesPerFile || ''}
            onChange={(e) => handlePagesPerFileChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-gray-600">
            The PDF will be split into parts with this many pages each
          </p>
        </div>
      )}

      {mode === 'extract' && (
        <div>
          <label htmlFor="pages-input" className="block text-sm font-medium text-gray-700 mb-2">
            Page Numbers
          </label>
          <input
            id="pages-input"
            type="text"
            placeholder="e.g., 1, 3, 7"
            value={config.pages || ''}
            onChange={(e) => handlePagesChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-sm text-gray-600">
            Enter specific page numbers separated by commas (e.g., 1, 3, 7)
          </p>
        </div>
      )}
    </div>
  );
}
