'use client';

import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Is Split PDF free?',
      answer: 'Yes, Split PDF is completely free to use. There are no hidden fees or subscription requirements.'
    },
    {
      question: 'Are my files secure?',
      answer: 'Yes, your files are processed securely. We do not store your files on our servers after processing, and all transfers are encrypted.'
    },
    {
      question: 'Can I split large PDF files?',
      answer: 'Yes, you can split PDF files up to 50MB in size. For larger files, you may need to compress them first or split them in multiple operations.'
    },
    {
      question: 'Can I extract multiple page ranges?',
      answer: 'Yes, using the "By Page Range" mode, you can specify multiple ranges like 1-3, 5, 8-10 to create separate PDF files for each range.'
    },
    {
      question: 'Will my original file be preserved?',
      answer: 'Yes, the split operation creates new files and does not modify your original PDF. Your source file remains unchanged.'
    },
    {
      question: 'Can I split encrypted PDFs?',
      answer: 'If the PDF is password-protected, you may need to remove the password first before splitting. Standard PDF files work without any issues.'
    }
  ];

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
