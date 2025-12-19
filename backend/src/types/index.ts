// 分割模式类型
export type SplitMode = 'range' | 'fixed' | 'extract';

// 命令参数接口
export interface SplitCommands {
  mode: SplitMode;
  range?: string;        // 用于 range 模式: "1-3,5,8-10"
  pagesPerFile?: number; // 用于 fixed 模式: 每个文件的页数
  pages?: string;        // 用于 extract 模式: "1,3,7"
}

// PDF 分割结果
export interface SplitResult {
  fileName: string;
  buffer: Buffer;
  pageNumbers: number[];
}

// API 响应接口
export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  fileName?: string;
  fileCount?: number;
}
