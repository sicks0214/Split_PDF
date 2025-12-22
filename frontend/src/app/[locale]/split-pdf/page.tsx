'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/Breadcrumb';
import FileUploader from '@/components/FileUploader';
import ModeSelector from '@/components/ModeSelector';
import ParameterInput from '@/components/ParameterInput';
import UsageScenariosSection from '@/components/UsageScenariosSection';
import HowToSection from '@/components/HowToSection';
import FAQSection from '@/components/FAQSection';
import { splitPDF, type SplitConfig } from '@/lib/pdfSplitter';

type SplitMode = 'range' | 'fixed' | 'extract';

interface FileInfo {
  name: string;
  size: number;
  pageCount?: number;
}

interface FeedbackMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function SplitPDFPage() {
  const t = useTranslations('split-pdf');
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | undefined>();
  const [mode, setMode] = useState<SplitMode>('range');
  const [config, setConfig] = useState<SplitConfig>({ mode: 'range' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const breadcrumbItems = [
    { label: t('breadcrumb.home'), href: '/', external: true },
    { label: t('breadcrumb.category'), href: '/' },
    { label: t('breadcrumb.tool') },
  ];

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) {
      setFile(null);
      setFileInfo(undefined);
      return;
    }

    setFile(selectedFile);
    setFileInfo({
      name: selectedFile.name,
      size: selectedFile.size
    });
    setFeedback(null);
  };

  const handleModeChange = (newMode: SplitMode) => {
    setMode(newMode);
    setConfig({ mode: newMode });
  };

  const handleConfigChange = (newConfig: SplitConfig) => {
    setConfig(newConfig);
  };

  const validateConfig = (): boolean => {
    if (config.mode === 'range' && !config.range?.trim()) {
      setFeedback({ type: 'error', message: t('feedback.noRange') });
      return false;
    }
    if (config.mode === 'fixed' && (!config.pagesPerFile || config.pagesPerFile < 1)) {
      setFeedback({ type: 'error', message: t('feedback.noFixed') });
      return false;
    }
    if (config.mode === 'extract' && !config.pages?.trim()) {
      setFeedback({ type: 'error', message: t('feedback.noExtract') });
      return false;
    }
    return true;
  };

  const handleSplit = async () => {
    if (!file) {
      setFeedback({ type: 'error', message: t('feedback.noFile') });
      return;
    }

    if (!validateConfig()) {
      return;
    }

    setIsProcessing(true);
    setFeedback({ type: 'info', message: t('feedback.processing') });

    try {
      const blob = await splitPDF(file, config);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const contentType = blob.type;
      if (contentType === 'application/pdf') {
        a.download = 'split_output.pdf';
      } else {
        a.download = 'split_output.zip';
      }

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedback({ type: 'success', message: t('feedback.success') });
    } catch (error: any) {
      console.error('Split error:', error);
      setFeedback({
        type: 'error',
        message: error.message || t('feedback.error')
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8 mb-12">
          <FileUploader
            onFileSelect={handleFileSelect}
            fileInfo={fileInfo}
            disabled={isProcessing}
          />

          {file && (
            <ModeSelector
              mode={mode}
              onModeChange={handleModeChange}
              disabled={isProcessing}
            />
          )}

          {file && (
            <ParameterInput
              mode={mode}
              config={config}
              onConfigChange={handleConfigChange}
              disabled={isProcessing}
            />
          )}

          {feedback && (
            <div
              className={`p-4 rounded-lg flex items-center space-x-2 ${
                feedback.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : feedback.type === 'error'
                  ? 'bg-red-50 text-red-800'
                  : 'bg-blue-50 text-blue-800'
              }`}
            >
              {feedback.type === 'success' && <span>✓</span>}
              {feedback.type === 'error' && <span>✗</span>}
              {feedback.type === 'info' && <span>ⓘ</span>}
              <span>{feedback.message}</span>
            </div>
          )}

          {file && (
            <button
              onClick={handleSplit}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? t('actions.splitting') : t('actions.split')}
            </button>
          )}
        </div>

        <UsageScenariosSection />
        <HowToSection />
        <FAQSection />
      </div>

      <Footer />
    </div>
  );
}
