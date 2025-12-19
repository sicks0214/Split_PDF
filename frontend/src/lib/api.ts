import axios from 'axios';
import { SplitConfig } from '@/types';

// 在生产环境使用相对路径（通过 Nginx 代理），开发环境使用完整 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? ''
    : 'http://localhost:4001');

export async function splitPDF(file: File, config: SplitConfig): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);

  // 构建命令字符串
  let commands = `--mode ${config.mode}`;

  if (config.mode === 'range' && config.range) {
    commands += ` --range ${config.range}`;
  } else if (config.mode === 'fixed' && config.pagesPerFile) {
    commands += ` --pages-per-file ${config.pagesPerFile}`;
  } else if (config.mode === 'extract' && config.pages) {
    commands += ` --pages ${config.pages}`;
  }

  formData.append('commands', commands);

  const response = await axios.post(`${API_BASE_URL}/api/pdf/split`, formData, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000 // 60秒超时
  });

  return response.data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/pdf/health`);
    return response.data.success === true;
  } catch {
    return false;
  }
}
