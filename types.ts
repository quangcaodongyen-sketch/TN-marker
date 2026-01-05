
export type Choice = 'A' | 'B' | 'C' | 'D' | '';

export interface AnswerKey {
  [key: number]: Choice;
}

export interface ScanResult {
  sbd: string;
  maDe: string;
  answers: { [key: number]: Choice };
}

export interface GradedResult extends ScanResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  timestamp: number;
}
