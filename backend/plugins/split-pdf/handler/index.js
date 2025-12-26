const { PDFDocument } = require('pdf-lib');
const JSZip = require('jszip');

module.exports = async function handler(ctx) {
  const { file, body } = ctx;
  const { mode, range, pagesPerFile, pages } = body;

  if (!file) {
    throw new Error('No file uploaded');
  }

  if (!mode) {
    throw new Error('Missing required parameter: mode');
  }

  const pdfDoc = await PDFDocument.load(file.buffer);
  const totalPages = pdfDoc.getPageCount();

  let results;

  switch (mode) {
    case 'range':
      if (!range) throw new Error('Missing required parameter: range');
      results = await splitByRange(pdfDoc, range, totalPages);
      break;
    case 'fixed':
      if (!pagesPerFile) throw new Error('Missing required parameter: pagesPerFile');
      results = await splitByFixedPages(pdfDoc, parseInt(pagesPerFile), totalPages);
      break;
    case 'extract':
      if (!pages) throw new Error('Missing required parameter: pages');
      results = await extractPages(pdfDoc, pages, totalPages);
      break;
    default:
      throw new Error(`Unknown split mode: ${mode}`);
  }

  if (results.length === 1) {
    return {
      type: 'file',
      data: Buffer.from(results[0].buffer),
      filename: results[0].fileName,
      contentType: 'application/pdf'
    };
  }

  const zip = new JSZip();
  results.forEach(result => zip.file(result.fileName, result.buffer));
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

  return {
    type: 'file',
    data: zipBuffer,
    filename: 'split_output.zip',
    contentType: 'application/zip'
  };
};

async function splitByRange(pdfDoc, rangeString, totalPages) {
  const pageNumbers = parsePageRange(rangeString);
  const invalidPages = pageNumbers.filter(p => p > totalPages);
  if (invalidPages.length > 0) {
    throw new Error(`Invalid page numbers: ${invalidPages.join(', ')}. PDF has only ${totalPages} pages.`);
  }

  const ranges = groupConsecutivePages(pageNumbers);
  const results = [];

  for (const range of ranges) {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, range.map(p => p - 1));
    copiedPages.forEach(page => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();

    results.push({
      fileName: generateFileName(range),
      buffer: pdfBytes,
      pageNumbers: range
    });
  }

  return results;
}

async function splitByFixedPages(pdfDoc, pagesPerFile, totalPages) {
  const results = [];

  for (let start = 0; start < totalPages; start += pagesPerFile) {
    const end = Math.min(start + pagesPerFile, totalPages);
    const pageIndices = Array.from({ length: end - start }, (_, i) => start + i);

    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    const pageNumbers = pageIndices.map(i => i + 1);

    results.push({
      fileName: generateFileName(pageNumbers),
      buffer: pdfBytes,
      pageNumbers
    });
  }

  return results;
}

async function extractPages(pdfDoc, pageString, totalPages) {
  const pageNumbers = parsePageList(pageString);
  const invalidPages = pageNumbers.filter(p => p > totalPages);
  if (invalidPages.length > 0) {
    throw new Error(`Invalid page numbers: ${invalidPages.join(', ')}. PDF has only ${totalPages} pages.`);
  }

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, pageNumbers.map(p => p - 1));
  copiedPages.forEach(page => newPdf.addPage(page));
  const pdfBytes = await newPdf.save();

  return [{
    fileName: generateFileName(pageNumbers),
    buffer: pdfBytes,
    pageNumbers
  }];
}

function parsePageRange(rangeString) {
  const pages = new Set();
  const parts = rangeString.split(',').map(p => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
      if (isNaN(start) || isNaN(end)) throw new Error(`Invalid page range: ${part}`);
      if (start < 1 || end < start) throw new Error(`Invalid page range: ${part}`);
      for (let i = start; i <= end; i++) pages.add(i);
    } else {
      const page = parseInt(part, 10);
      if (isNaN(page) || page < 1) throw new Error(`Invalid page number: ${part}`);
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

function parsePageList(pageString) {
  const pages = pageString.split(',')
    .map(p => parseInt(p.trim(), 10))
    .filter(p => !isNaN(p) && p >= 1);

  if (pages.length === 0) throw new Error('No valid pages specified');
  return Array.from(new Set(pages)).sort((a, b) => a - b);
}

function groupConsecutivePages(pages) {
  if (pages.length === 0) return [];
  const groups = [];
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

function generateFileName(pages) {
  return pages.length === 1
    ? `page_${pages[0]}.pdf`
    : `pages_${pages[0]}-${pages[pages.length - 1]}.pdf`;
}
