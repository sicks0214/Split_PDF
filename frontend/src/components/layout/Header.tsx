'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

export function Header() {
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = params.locale as string;

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    return segments.join('/');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/${currentLocale}`} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PDF Tools
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={switchLocale('en')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentLocale === 'en'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            EN
          </Link>
          <Link
            href={switchLocale('zh')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentLocale === 'zh'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            中文
          </Link>
        </div>
      </div>
    </header>
  );
}
