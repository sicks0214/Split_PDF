import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Split PDF - Free Online PDF Splitter Tool',
  description: 'Split PDF files by page range, fixed pages, or extract specific pages. Fast, secure, and free online PDF splitting tool.',
  keywords: ['split pdf', 'pdf splitter', 'divide pdf', 'extract pdf pages', 'pdf tools'],
  openGraph: {
    title: 'Split PDF - Free Online PDF Splitter Tool',
    description: 'Split PDF files by page range, fixed pages, or extract specific pages.',
    type: 'website'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
