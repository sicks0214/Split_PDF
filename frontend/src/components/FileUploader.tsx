'use client';

import { useCallback } from 'react';
import { FileInfo } from '@/types';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  fileInfo?: FileInfo;
  disabled?: boolean;
}

export default function FileUploader({ onFileSelect, fileInfo, disabled }: FileUploaderProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onFileSelect(files[0]);
    } else {
      alert('Please upload a PDF file');
    }
  }, [onFileSelect, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          disabled
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-primary-500 bg-primary-50 hover:bg-primary-100 cursor-pointer'
        }`}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        >
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700">
              {fileInfo ? fileInfo.name : 'Upload PDF or drag and drop'}
            </p>
            {!fileInfo && (
              <p className="text-sm text-gray-500">
                Click to browse or drag your PDF file here
              </p>
            )}
          </div>
        </label>
      </div>

      {fileInfo && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{fileInfo.name}</p>
              <p className="text-xs text-gray-500">
                {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                {fileInfo.pageCount && ` • ${fileInfo.pageCount} pages`}
              </p>
            </div>
            <button
              onClick={() => onFileSelect(null as any)}
              disabled={disabled}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
