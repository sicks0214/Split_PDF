'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
  external?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

const MAIN_APP_URL = 'http://82.29.67.124';

export function Breadcrumb({ items }: BreadcrumbProps) {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <nav className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.href ? (
              item.external ? (
                <a
                  href={`${MAIN_APP_URL}/${locale}${item.href === '/' ? '' : item.href}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={`/${locale}${item.href}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              )
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
