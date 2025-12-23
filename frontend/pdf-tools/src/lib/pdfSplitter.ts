export interface SplitConfig {
  mode: 'range' | 'fixed' | 'extract';
  range?: string;
  pagesPerFile?: number;
  pages?: string;
}

export async function splitPDF(file: File, config: SplitConfig): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mode', config.mode);

  if (config.range) {
    formData.append('range', config.range);
  }
  if (config.pagesPerFile) {
    formData.append('pagesPerFile', config.pagesPerFile.toString());
  }
  if (config.pages) {
    formData.append('pages', config.pages);
  }

  // 本地开发使用 localhost:8000，生产环境使用 /api
  const apiUrl = process.env.NODE_ENV === 'production'
    ? '/api/pdf/split'
    : 'http://localhost:8000/api/pdf/split';

  const response = await fetch(apiUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Split failed' }));
    throw new Error(error.message || 'Failed to split PDF');
  }

  return await response.blob();
}
