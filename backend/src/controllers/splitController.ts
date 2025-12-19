import { Request, Response } from 'express';
import archiver from 'archiver';
import { PDFService } from '../services/pdfService';
import { parseCommands } from '../utils/commandParser';
import { ApiResponse } from '../types';

const pdfService = new PDFService();

/**
 * 处理 PDF 分割请求
 */
export async function splitPDFHandler(req: Request, res: Response): Promise<void> {
  try {
    // 验证文件
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as ApiResponse);
      return;
    }

    // 验证文件类型
    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).json({
        success: false,
        error: 'File must be a PDF'
      } as ApiResponse);
      return;
    }

    // 获取并解析命令
    const commandString = req.body.commands;
    if (!commandString) {
      res.status(400).json({
        success: false,
        error: 'Missing commands parameter'
      } as ApiResponse);
      return;
    }

    let commands;
    try {
      commands = parseCommands(commandString);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: `Invalid commands: ${(error as Error).message}`
      } as ApiResponse);
      return;
    }

    // 执行 PDF 分割
    const results = await pdfService.splitPDF(req.file.buffer, commands);

    // 如果只有一个文件，直接返回 PDF
    if (results.length === 1) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${results[0].fileName}"`);
      res.send(results[0].buffer);
      return;
    }

    // 多个文件时，打包为 ZIP
    const zipFileName = `split_pdf_${Date.now()}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);

    // 添加所有 PDF 文件到 ZIP
    for (const result of results) {
      archive.append(result.buffer, { name: result.fileName });
    }

    await archive.finalize();

  } catch (error) {
    console.error('Split PDF error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || 'Internal server error'
    } as ApiResponse);
  }
}

/**
 * 健康检查端点
 */
export function healthCheck(req: Request, res: Response): void {
  res.json({
    success: true,
    message: 'Split PDF service is running',
    timestamp: new Date().toISOString()
  });
}
