import type { ExamConfig, ExamData } from '../types/exam';

export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function prepareActiveExam(exam: ExamData, config: ExamConfig): ExamData {
  let questions = exam.questions.map((q) => ({
    ...q,
    options: config.shuffleOptions ? shuffleArray(q.options) : [...q.options],
    correctAnswers: [...q.correctAnswers],
  }));

  if (config.shuffleQuestions) {
    questions = shuffleArray(questions);
  }

  return {
    ...exam,
    questions,
  };
}

export function isAnswerCorrect(selected: string[] | undefined, correct: string[]): boolean {
  if (!selected || selected.length !== correct.length) return false;
  const selectedSet = new Set(selected);
  return correct.every((id) => selectedSet.has(id));
}

export function formatTime(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function getExamStats(exam: ExamData) {
  const total = exam.questions.length;
  const multiSelect = exam.questions.filter((q) => q.correctAnswers.length > 1).length;
  const singleChoice = total - multiSelect;
  return { total, singleChoice, multiSelect };
}
