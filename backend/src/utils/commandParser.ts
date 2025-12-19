import { SplitCommands, SplitMode } from '../types';

/**
 * 解析命令字符串
 * 支持格式:
 * --mode range --range 1-3,5,8-10
 * --mode fixed --pages-per-file 5
 * --mode extract --pages 1,3,7
 */
export function parseCommands(commandString: string): SplitCommands {
  const parts = commandString.trim().split(/\s+/);
  const commands: Partial<SplitCommands> = {};

  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const value = parts[i + 1];

    switch (key) {
      case '--mode':
        if (!['range', 'fixed', 'extract'].includes(value)) {
          throw new Error(`Invalid mode: ${value}. Must be 'range', 'fixed', or 'extract'.`);
        }
        commands.mode = value as SplitMode;
        i++;
        break;

      case '--range':
        commands.range = value;
        i++;
        break;

      case '--pages-per-file':
        const pagesPerFile = parseInt(value, 10);
        if (isNaN(pagesPerFile) || pagesPerFile < 1) {
          throw new Error('pages-per-file must be a positive integer');
        }
        commands.pagesPerFile = pagesPerFile;
        i++;
        break;

      case '--pages':
        commands.pages = value;
        i++;
        break;

      default:
        if (key.startsWith('--')) {
          throw new Error(`Unknown parameter: ${key}`);
        }
    }
  }

  // 验证必填参数
  if (!commands.mode) {
    throw new Error('Missing required parameter: --mode');
  }

  // 根据模式验证对应的参数
  if (commands.mode === 'range' && !commands.range) {
    throw new Error('Range mode requires --range parameter');
  }

  if (commands.mode === 'fixed' && !commands.pagesPerFile) {
    throw new Error('Fixed mode requires --pages-per-file parameter');
  }

  if (commands.mode === 'extract' && !commands.pages) {
    throw new Error('Extract mode requires --pages parameter');
  }

  return commands as SplitCommands;
}

/**
 * 解析页码范围字符串为页码数组
 * 例如: "1-3,5,8-10" => [1,2,3,5,8,9,10]
 */
export function parsePageRange(rangeString: string): number[] {
  const pages: Set<number> = new Set();
  const parts = rangeString.split(',').map(p => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      // 范围格式: "1-3"
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
      // 单个页码: "5"
      const page = parseInt(part, 10);

      if (isNaN(page) || page < 1) {
        throw new Error(`Invalid page number: ${part}`);
      }

      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * 解析单独的页码列表
 * 例如: "1,3,7" => [1,3,7]
 */
export function parsePageList(pageString: string): number[] {
  const pages = pageString.split(',')
    .map(p => parseInt(p.trim(), 10))
    .filter(p => !isNaN(p) && p >= 1);

  if (pages.length === 0) {
    throw new Error('No valid pages specified');
  }

  return Array.from(new Set(pages)).sort((a, b) => a - b);
}
