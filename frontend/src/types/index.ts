export type SplitMode = 'range' | 'fixed' | 'extract';

export interface SplitConfig {
  mode: SplitMode;
  range?: string;
  pagesPerFile?: number;
  pages?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  pageCount?: number;
}

export interface FeedbackMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}
