import { Request, Response } from 'express';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

interface SplitResult {
  fileName: string;
  buffer: Uint8Array;
  pageNumbers: number[];
}

// 分割 PDF
export const split = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const { mode, range, pagesPerFile, pages } = req.body;

    if (!mode) {
      res.status(400).json({ success: false, message: 'Missing required parameter: mode' });
      return;
    }

    // 加载 PDF（从内存 buffer）
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const totalPages = pdfDoc.getPageCount();

    let results: SplitResult[];

    switch (mode) {
      case 'range':
        if (!range) {
          res.status(400).json({ success: false, message: 'Missing required parameter: range' });
          return;
        }
        results = await splitByRange(pdfDoc, range, totalPages);
        break;

      case 'fixed':
        if (!pagesPerFile) {
          res.status(400).json({ success: false, message: 'Missing required parameter: pagesPerFile' });
          return;
        }
        results = await splitByFixedPages(pdfDoc, parseInt(pagesPerFile), totalPages);
        break;

      case 'extract':
        if (!pages) {
          res.status(400).json({ success: false, message: 'Missing required parameter: pages' });
          return;
        }
        results = await extractPages(pdfDoc, pages, totalPages);
        break;

      default:
        res.status(400).json({ success: false, message: `Unknown split mode: ${mode}` });
        return;
    }

    // 返回结果
    if (results.length === 1) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${results[0].fileName}"`);
      res.send(Buffer.from(results[0].buffer));
    } else {
      const zip = new JSZip();
      results.forEach(result => {
        zip.file(result.fileName, result.buffer);
      });
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="split_output.zip"');
      res.send(zipBuffer);
    }

  } catch (error: any) {
    console.error('Split error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to split PDF' });
  }
};

// 按页码范围分割
async function splitByRange(pdfDoc: PDFDocument, rangeString: string, totalPages: number): Promise<SplitResult[]> {
  const pageNumbers = parsePageRange(rangeString);

  const invalidPages = pageNumbers.filter(p => p > totalPages);
  if (invalidPages.length > 0) {
    throw new Error(`Invalid page numbers: ${invalidPages.join(', ')}. PDF has only ${totalPages} pages.`);
  }

  const ranges = groupConsecutivePages(pageNumbers);
  const results: SplitResult[] = [];

  for (const range of ranges) {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, range.map(p => p - 1));
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

// 按固定页数分割
async function splitByFixedPages(pdfDoc: PDFDocument, pagesPerFile: number, totalPages: number): Promise<SplitResult[]> {
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

// 提取指定页面
async function extractPages(pdfDoc: PDFDocument, pageString: string, totalPages: number): Promise<SplitResult[]> {
  const pageNumbers = parsePageList(pageString);

  const invalidPages = pageNumbers.filter(p => p > totalPages);
  if (invalidPages.length > 0) {
    throw new Error(`Invalid page numbers: ${invalidPages.join(', ')}. PDF has only ${totalPages} pages.`);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, pageNumbers.map(p => p - 1));
  copiedPages.forEach(page => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  const fileName = generateFileName(pageNumbers);

  return [{
    fileName,
    buffer: pdfBytes,
    pageNumbers
  }];
}

// 解析页码范围
function parsePageRange(rangeString: string): number[] {
  const pages = new Set<number>();
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

// 解析页码列表
function parsePageList(pageString: string): number[] {
  const pages = pageString.split(',')
    .map(p => parseInt(p.trim(), 10))
    .filter(p => !isNaN(p) && p >= 1);

  if (pages.length === 0) {
    throw new Error('No valid pages specified');
  }

  return Array.from(new Set(pages)).sort((a, b) => a - b);
}

// 将连续页码分组
function groupConsecutivePages(pages: number[]): number[][] {
  if (pages.length === 0) return [];

  const groups: number[][] = [];
  let currentGroup = [pages[0]];

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

// 生成文件名
function generateFileName(pages: number[]): string {
  if (pages.length === 1) {
    return `page_${pages[0]}.pdf`;
  } else {
    return `pages_${pages[0]}-${pages[pages.length - 1]}.pdf`;
  }
}
