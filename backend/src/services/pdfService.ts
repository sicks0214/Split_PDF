import { PDFDocument } from 'pdf-lib';
import { SplitCommands, SplitResult } from '../types';
import { parsePageRange, parsePageList } from '../utils/commandParser';

export class PDFService {
  /**
   * 主分割函数
   */
  async splitPDF(fileBuffer: Buffer, commands: SplitCommands): Promise<SplitResult[]> {
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const totalPages = pdfDoc.getPageCount();

    switch (commands.mode) {
      case 'range':
        return this.splitByRange(pdfDoc, commands.range!, totalPages);

      case 'fixed':
        return this.splitByFixedPages(pdfDoc, commands.pagesPerFile!, totalPages);

      case 'extract':
        return this.extractPages(pdfDoc, commands.pages!, totalPages);

      default:
        throw new Error(`Unknown split mode: ${commands.mode}`);
    }
  }

  /**
   * 模式 1: 按页码范围拆分
   * 例如: "1-3,5,8-10" => 3个文件
   */
  private async splitByRange(
    pdfDoc: PDFDocument,
    rangeString: string,
    totalPages: number
  ): Promise<SplitResult[]> {
    const pages = parsePageRange(rangeString);

    // 验证页码
    const invalidPages = pages.filter(p => p > totalPages);
    if (invalidPages.length > 0) {
      throw new Error(
        `Invalid page numbers: ${invalidPages.join(', ')}. PDF has only ${totalPages} pages.`
      );
    }

    // 按连续范围分组
    const ranges = this.groupConsecutivePages(pages);
    const results: SplitResult[] = [];

    for (const range of ranges) {
      const newPdf = await PDFDocument.create();

      // 复制页面（注意：pdf-lib 使用 0-based 索引）
      const copiedPages = await newPdf.copyPages(
        pdfDoc,
        range.map(p => p - 1)
      );

      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const fileName = this.generateFileName(range);

      results.push({
        fileName,
        buffer: Buffer.from(pdfBytes),
        pageNumbers: range
      });
    }

    return results;
  }

  /**
   * 模式 2: 按固定页数拆分
   * 例如: pagesPerFile = 5 => 每5页一个文件
   */
  private async splitByFixedPages(
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
      const pageNumbers = pageIndices.map(i => i + 1); // 转为 1-based
      const fileName = this.generateFileName(pageNumbers);

      results.push({
        fileName,
        buffer: Buffer.from(pdfBytes),
        pageNumbers
      });
    }

    return results;
  }

  /**
   * 模式 3: 提取指定页面
   * 例如: "1,3,7" => 1个文件包含这3页
   */
  private async extractPages(
    pdfDoc: PDFDocument,
    pageString: string,
    totalPages: number
  ): Promise<SplitResult[]> {
    const pages = parsePageList(pageString);

    // 验证页码
    const invalidPages = pages.filter(p => p > totalPages);
    if (invalidPages.length > 0) {
      throw new Error(
        `Invalid page numbers: ${invalidPages.join(', ')}. PDF has only ${totalPages} pages.`
      );
    }

    const newPdf = await PDFDocument.create();

    // 复制页面（0-based 索引）
    const copiedPages = await newPdf.copyPages(
      pdfDoc,
      pages.map(p => p - 1)
    );

    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    const fileName = this.generateFileName(pages);

    return [{
      fileName,
      buffer: Buffer.from(pdfBytes),
      pageNumbers: pages
    }];
  }

  /**
   * 将页码分组为连续范围
   * 例如: [1,2,3,5,8,9,10] => [[1,2,3], [5], [8,9,10]]
   */
  private groupConsecutivePages(pages: number[]): number[][] {
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

  /**
   * 生成文件名
   */
  private generateFileName(pages: number[]): string {
    if (pages.length === 1) {
      return `page_${pages[0]}.pdf`;
    } else if (pages.length === 2) {
      return `pages_${pages[0]}-${pages[1]}.pdf`;
    } else {
      return `pages_${pages[0]}-${pages[pages.length - 1]}.pdf`;
    }
  }
}
