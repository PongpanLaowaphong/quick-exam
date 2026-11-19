# Quick Exam

A lightweight, serverless static web app for running multiple-choice exams from JSON files. Designed for **GitHub Pages** with zero backend or database required.

## Features

- **Flexible JSON Import**: Drag-and-drop `.json` upload or paste raw JSON directly with real-time schema validation, error highlighting, and one-click JSON prettification.
- **Built-in AI Prompt Helper**: One-click copyable prompt template to convert PDFs, Markdown files, or study notes into valid Quick Exam JSON using ChatGPT, Gemini, Claude, or any LLM.
- **Single & Multi-Select Support**: Automatically detects single-choice (`correctAnswers.length === 1`) vs. multiple-choice (`correctAnswers.length > 1`) questions.
- **Two Exam Modes**:
  - **Instant Feedback (Practice)**: Check answers immediately with color-coded feedback and explanations.
  - **End-of-Quiz (Exam Simulation)**: Navigate freely, flag/bookmark questions, use the collapsible Question Navigator grid, and submit for full grading.
- **Customization**: Shuffle questions, shuffle options, optional stopwatch or auto-submitting countdown timer.
- **Smart Results & Review**: Circular score visualization, filterable review (**All**, **Incorrect Only**, **Correct Only**), **Retry Incorrect Questions Only**, and **Retry Full Exam**.
- **Auto-Save & Theme Support**: Progress and Light/Dark theme preferences persist automatically via `localStorage`. Supports both English and Thai typography (`Plus Jakarta Sans` + `Noto Sans Thai`).

## Getting Started

```bash
npm install
npm run dev
```

## Production Build & GitHub Pages

```bash
npm run build
npm run preview
```

`vite.config.ts` is configured with `base: './'` and includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment to GitHub Pages.
