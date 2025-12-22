import { PDFDocument } from 'pdf-lib';

export interface SplitConfig {
  mode: 'range' | 'fixed' | 'extract';
  range?: string;
  pagesPerFile?: number;
  pages?: string;
}

interface SplitResult {
  fileName: string;
  buffer: Uint8Array;
  pageNumbers: number[];
}

export async function splitPDF(file: File, config: SplitConfig): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  let results: SplitResult[];

  switch (config.mode) {
    case 'range':
      results = await splitByRange(pdfDoc, config.range!, totalPages);
      break;
    case 'fixed':
      results = await splitByFixedPages(pdfDoc, config.pagesPerFile!, totalPages);
      break;
    case 'extract':
      results = await extractPages(pdfDoc, config.pages!, totalPages);
      break;
    default:
      throw new Error(`Unknown split mode: ${config.mode}`);
  }

  if (results.length === 1) {
    return new Blob([new Uint8Array(results[0].buffer)], { type: 'application/pdf' });
  }

  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (const result of results) {
    zip.file(result.fileName, result.buffer);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
}

async function splitByRange(
  pdfDoc: PDFDocument,
  rangeString: string,
  totalPages: number
): Promise<SplitResult[]> {
  const pages = parsePageRange(rangeString);

  const invalidPages = pages.filter(p => p > totalPages);
  if (invalidPages.length > 0) {
    throw new Error(
      `Invalid page numbers: ${invalidPages.join(', ')}. PDF has only ${totalPages} pages.`
    );
  }

  const ranges = groupConsecutivePages(pages);
  const results: SplitResult[] = [];

  for (const range of ranges) {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(
      pdfDoc,
      range.map(p => p - 1)
    );
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    const fileName = generateFileName(range);

    results.push({
      fileName,
      buffer: pdfBytes,
      pageNumbers: range
    });
  }

  return results;
}

async function splitByFixedPages(
  pdfDoc: PDFDocument,
  pagesPerFile: number,
  totalPages: number
): Promise<SplitResult[]> {
  const results: SplitResult[] = [];

  for (let start = 0; start < totalPages; start += pagesPerFile) {
    const end = Math.min(start + pagesPerFile, totalPages);
    const pageIndices = Array.from({ length: end - start }, (_, i) => start + i);

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    const pageNumbers = pageIndices.map(i => i + 1);
    const fileName = generateFileName(pageNumbers);

    results.push({
      fileName,
      buffer: pdfBytes,
      pageNumbers
    });
  }

  return results;
}

async function extractPages(
  pdfDoc: PDFDocument,
  pageString: string,
  totalPages: number
): Promise<SplitResult[]> {
  const pages = parsePageList(pageString);

  const invalidPages = pages.filter(p => p > totalPages);
  if (invalidPages.length > 0) {
    throw new Error(
      `Invalid page numbers: ${invalidPages.join(', ')}. PDF has only ${totalPages} pages.`
    );
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(
    pdfDoc,
    pages.map(p => p - 1)
  );
  copiedPages.forEach(page => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const fileName = generateFileName(pages);

  return [{
    fileName,
    buffer: pdfBytes,
    pageNumbers: pages
  }];
}

function parsePageRange(rangeString: string): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeString.split(',').map(p => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));

      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid page range: ${part}`);
      }

      if (start < 1 || end < start) {
        throw new Error(`Invalid page range: ${part}. Start must be >= 1 and end >= start.`);
      }

      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      const page = parseInt(part, 10);

      if (isNaN(page) || page < 1) {
        throw new Error(`Invalid page number: ${part}`);
      }

      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

function parsePageList(pageString: string): number[] {
  const pages = pageString.split(',')
    .map(p => parseInt(p.trim(), 10))
    .filter(p => !isNaN(p) && p >= 1);

  if (pages.length === 0) {
    throw new Error('No valid pages specified');
  }

  return Array.from(new Set(pages)).sort((a, b) => a - b);
}

function groupConsecutivePages(pages: number[]): number[][] {
  if (pages.length === 0) return [];

  const groups: number[][] = [];
  let currentGroup: number[] = [pages[0]];

  for (let i = 1; i < pages.length; i++) {
    if (pages[i] === currentGroup[currentGroup.length - 1] + 1) {
      currentGroup.push(pages[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [pages[i]];
    }
  }

  groups.push(currentGroup);
  return groups;
}

function generateFileName(pages: number[]): string {
  if (pages.length === 1) {
    return `page_${pages[0]}.pdf`;
  } else if (pages.length === 2) {
    return `pages_${pages[0]}-${pages[1]}.pdf`;
  } else {
    return `pages_${pages[0]}-${pages[pages.length - 1]}.pdf`;
  }
}
