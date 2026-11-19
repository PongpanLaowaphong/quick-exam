export const AI_PROMPT_TEMPLATE = `You are an expert exam creator. Please convert the attached document(s) (PDF, Markdown, or notes) into a multiple-choice exam in valid JSON format.

Requirements:
1. Output ONLY raw, valid JSON (no markdown code fences, no conversational text before or after).
2. Include both single-answer and multiple-answer questions where appropriate.
3. For every question, provide a concise "explanation" explaining why the correct answer(s) are right.
4. Follow this exact JSON schema:

{
  "title": "Descriptive Exam Title",
  "description": "Brief description of the exam topic",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctAnswers": ["A"],
      "explanation": "Brief explanation of the correct answer."
    }
  ]
}

Rules:
- "correctAnswers" MUST always be an array of option IDs (e.g., ["B"] for single choice, or ["A", "C"] for multiple choice).
- Every ID in "correctAnswers" must match an "id" in "options".
- Generate [10] questions in [English / Thai - adjust language as needed].`;
