import type { ExamData, ExamOption, ExamQuestion } from '../types/exam';

export type ValidationResult =
  | { valid: true; exam: ExamData }
  | { valid: false; errors: string[] };

function getLineFromSyntaxError(raw: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  // V8 / Chromium sometimes reports "at position 123" or "line X column Y"
  const lineColMatch = message.match(/line\s+(\d+)/i);
  if (lineColMatch) {
    return `Invalid JSON syntax near line ${lineColMatch[1]}: ${message}`;
  }

  const posMatch = message.match(/position\s+(\d+)/i);
  if (posMatch) {
    const pos = Number(posMatch[1]);
    if (!Number.isNaN(pos) && pos >= 0) {
      const upToPos = raw.slice(0, pos);
      const lineNumber = upToPos.split('\n').length;
      return `Invalid JSON syntax near line ${lineNumber}: ${message}`;
    }
  }

  return `Invalid JSON syntax: ${message}`;
}

export function validateExamJson(rawInput: string): ValidationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      valid: false,
      errors: ['Input is empty. Please upload a .json file or paste JSON text.'],
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    return {
      valid: false,
      errors: [getLineFromSyntaxError(trimmed, err)],
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      valid: false,
      errors: ['Root JSON value must be an object containing a "questions" array.'],
    };
  }

  const root = parsed as Record<string, unknown>;
  const errors: string[] = [];

  // Validate title
  let title = 'Untitled Exam';
  if (root.title !== undefined && root.title !== null) {
    if (typeof root.title !== 'string') {
      errors.push('"title" must be a string if provided.');
    } else if (root.title.trim().length > 0) {
      title = root.title.trim();
    }
  }

  // Validate description
  let description: string | undefined;
  if (root.description !== undefined && root.description !== null) {
    if (typeof root.description !== 'string') {
      errors.push('"description" must be a string if provided.');
    } else if (root.description.trim().length > 0) {
      description = root.description.trim();
    }
  }

  // Validate questions array
  if (!Array.isArray(root.questions)) {
    errors.push('Missing required "questions" array.');
    return { valid: false, errors };
  }

  if (root.questions.length === 0) {
    errors.push('"questions" array must contain at least 1 question.');
    return { valid: false, errors };
  }

  const normalizedQuestions: ExamQuestion[] = [];

  root.questions.forEach((rawQ, idx) => {
    const qNum = idx + 1;
    if (typeof rawQ !== 'object' || rawQ === null || Array.isArray(rawQ)) {
      errors.push(`Question #${qNum}: Must be an object.`);
      return;
    }

    const q = rawQ as Record<string, unknown>;

    // Question text
    if (typeof q.question !== 'string' || q.question.trim().length === 0) {
      errors.push(`Question #${qNum}: Missing or empty "question" text.`);
    }

    // Options
    const validOptions: ExamOption[] = [];
    const optionIds = new Set<string>();

    if (!Array.isArray(q.options)) {
      errors.push(`Question #${qNum}: Missing required "options" array.`);
    } else {
      if (q.options.length < 2) {
        errors.push(`Question #${qNum}: "options" must contain at least 2 choices.`);
      }

      q.options.forEach((rawOpt, optIdx) => {
        if (typeof rawOpt !== 'object' || rawOpt === null || Array.isArray(rawOpt)) {
          errors.push(`Question #${qNum}, Option #${optIdx + 1}: Must be an object with "id" and "text".`);
          return;
        }
        const opt = rawOpt as Record<string, unknown>;
        const optId =
          typeof opt.id === 'string'
            ? opt.id.trim()
            : typeof opt.id === 'number'
              ? String(opt.id)
              : '';
        const optText = typeof opt.text === 'string' ? opt.text.trim() : '';

        if (!optId) {
          errors.push(`Question #${qNum}, Option #${optIdx + 1}: Missing or empty "id".`);
        } else if (optionIds.has(optId)) {
          errors.push(`Question #${qNum}: Duplicate option id "${optId}". Option IDs must be unique.`);
        } else {
          optionIds.add(optId);
        }

        if (!optText) {
          errors.push(
            `Question #${qNum}, Option ${optId ? `"${optId}"` : `#${optIdx + 1}`}: Missing or empty "text".`
          );
        }

        if (optId && optText) {
          validOptions.push({ id: optId, text: optText });
        }
      });
    }

    // Correct Answers
    const normalizedCorrect: string[] = [];
    if (!Array.isArray(q.correctAnswers)) {
      errors.push(
        `Question #${qNum}: Missing required "correctAnswers" array (e.g. ["A"] or ["A", "C"]).`
      );
    } else if (q.correctAnswers.length === 0) {
      errors.push(`Question #${qNum}: "correctAnswers" must contain at least 1 answer ID.`);
    } else {
      const seenCorrect = new Set<string>();
      q.correctAnswers.forEach((rawAns, ansIdx) => {
        if (typeof rawAns !== 'string' || rawAns.trim().length === 0) {
          errors.push(
            `Question #${qNum}: "correctAnswers"[${ansIdx}] must be a non-empty string matching an option ID.`
          );
          return;
        }
        const ansId = rawAns.trim();
        if (optionIds.size > 0 && !optionIds.has(ansId)) {
          const available = Array.from(optionIds).join(', ');
          errors.push(
            `Question #${qNum}: 'correctAnswers' contains "${ansId}", which is not in the options list (available: ${available}).`
          );
        } else if (!seenCorrect.has(ansId)) {
          seenCorrect.add(ansId);
          normalizedCorrect.push(ansId);
        }
      });
    }

    // Explanation (optional)
    let explanation: string | undefined;
    if (q.explanation !== undefined && q.explanation !== null) {
      if (typeof q.explanation !== 'string') {
        errors.push(`Question #${qNum}: "explanation" must be a string if provided.`);
      } else if (q.explanation.trim().length > 0) {
        explanation = q.explanation.trim();
      }
    }

    const questionId =
      typeof q.id === 'string' || typeof q.id === 'number' ? q.id : qNum;

    if (typeof q.question === 'string' && q.question.trim().length > 0) {
      normalizedQuestions.push({
        id: questionId,
        question: q.question.trim(),
        options: validOptions,
        correctAnswers: normalizedCorrect,
        explanation,
      });
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    exam: {
      title,
      description,
      questions: normalizedQuestions,
    },
  };
}
