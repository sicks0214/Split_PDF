'use client';

import { useState } from 'react';
import FileUploader from '@/components/FileUploader';
import ModeSelector from '@/components/ModeSelector';
import ParameterInput from '@/components/ParameterInput';
import UsageScenariosSection from '@/components/UsageScenariosSection';
import HowToSection from '@/components/HowToSection';
import FAQSection from '@/components/FAQSection';
import { SplitMode, SplitConfig, FileInfo, FeedbackMessage } from '@/types';
import { splitPDF } from '@/lib/api';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | undefined>();
  const [mode, setMode] = useState<SplitMode>('range');
  const [config, setConfig] = useState<SplitConfig>({ mode: 'range' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

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
    setFeedback({
      type: 'info',
      message: `${newMode.charAt(0).toUpperCase() + newMode.slice(1)} mode enabled`
    });
  };

  const handleConfigChange = (newConfig: SplitConfig) => {
    setConfig(newConfig);
  };

  const validateConfig = (): boolean => {
    if (config.mode === 'range' && !config.range?.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a page range' });
      return false;
    }
    if (config.mode === 'fixed' && (!config.pagesPerFile || config.pagesPerFile < 1)) {
      setFeedback({ type: 'error', message: 'Please enter a valid number of pages per file' });
      return false;
    }
    if (config.mode === 'extract' && !config.pages?.trim()) {
      setFeedback({ type: 'error', message: 'Please enter page numbers to extract' });
      return false;
    }
    return true;
  };

  const handleSplit = async () => {
    if (!file) {
      setFeedback({ type: 'error', message: 'Please upload a PDF file first' });
      return;
    }

    if (!validateConfig()) {
      return;
    }

    setIsProcessing(true);
    setFeedback({ type: 'info', message: 'Processing your PDF...' });

    try {
      const blob = await splitPDF(file, config);

      // 触发下载
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // 检测文件类型
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

      setFeedback({ type: 'success', message: 'PDF split successfully! Your download should start automatically.' });
    } catch (error: any) {
      console.error('Split error:', error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.error || error.message || 'Failed to split PDF. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <nav className="text-sm text-gray-600 mb-2">
            <span>Home</span> / <span>PDF Tools</span> / <span className="text-gray-900">Split PDF</span>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900">Split PDF</h1>
          <p className="text-gray-600 mt-2">Split your PDF files by page range, fixed pages, or extract specific pages</p>
        </div>
      </header>

      {/* Core Tool Area */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* File Upload */}
          <FileUploader
            onFileSelect={handleFileSelect}
            fileInfo={fileInfo}
            disabled={isProcessing}
          />

          {/* Mode Selection */}
          {file && (
            <ModeSelector
              mode={mode}
              onModeChange={handleModeChange}
              disabled={isProcessing}
            />
          )}

          {/* Parameter Input */}
          {file && (
            <ParameterInput
              mode={mode}
              config={config}
              onConfigChange={handleConfigChange}
              disabled={isProcessing}
            />
          )}

          {/* Feedback Message */}
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

          {/* Split Button */}
          {file && (
            <button
              onClick={handleSplit}
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Split PDF'}
            </button>
          )}
        </div>
      </div>

      {/* Usage Scenarios */}
      <UsageScenariosSection />

      {/* How-to Section */}
      <HowToSection />

      {/* FAQ */}
      <FAQSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 Toolibox. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
