const { PDFDocument } = require('pdf-lib');
const JSZip = require('jszip');
const fs = require('fs').promises;
const path = require('path');

// 分割 PDF
exports.split = async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    filePath = req.file.path;
    const { mode, range, pagesPerFile, pages } = req.body;

    if (!mode) {
      return res.status(400).json({ success: false, message: 'Missing required parameter: mode' });
    }

    // 加载 PDF
    const pdfBytes = await fs.readFile(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    let results;

    switch (mode) {
      case 'range':
        if (!range) {
          return res.status(400).json({ success: false, message: 'Missing required parameter: range' });
        }
        results = await splitByRange(pdfDoc, range, totalPages);
        break;

      case 'fixed':
        if (!pagesPerFile) {
          return res.status(400).json({ success: false, message: 'Missing required parameter: pagesPerFile' });
        }
        results = await splitByFixedPages(pdfDoc, parseInt(pagesPerFile), totalPages);
        break;

      case 'extract':
        if (!pages) {
          return res.status(400).json({ success: false, message: 'Missing required parameter: pages' });
        }
        results = await extractPages(pdfDoc, pages, totalPages);
        break;

      default:
        return res.status(400).json({ success: false, message: `Unknown split mode: ${mode}` });
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

  } catch (error) {
    console.error('Split error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to split PDF' });
  } finally {
    // 清理临时文件
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }
    }
  }
};

// 按页码范围分割
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
  const fileName = generateFileName(pageNumbers);

  return [{
    fileName,
    buffer: pdfBytes,
    pageNumbers
  }];
}

// 解析页码范围
function parsePageRange(rangeString) {
  const pages = new Set();
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
function parsePageList(pageString) {
  const pages = pageString.split(',')
    .map(p => parseInt(p.trim(), 10))
    .filter(p => !isNaN(p) && p >= 1);

  if (pages.length === 0) {
    throw new Error('No valid pages specified');
  }

  return Array.from(new Set(pages)).sort((a, b) => a - b);
}

// 将连续页码分组
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

// 生成文件名
function generateFileName(pages) {
  if (pages.length === 1) {
    return `page_${pages[0]}.pdf`;
  } else {
    return `pages_${pages[0]}-${pages[pages.length - 1]}.pdf`;
  }
}
