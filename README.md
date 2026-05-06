# VocabFlow

A modern, offline-first English vocabulary learning web application utilizing incremental spaced repetition. 
Built entirely with React, Vite, TailwindCSS, and IndexedDB. Contains no backend dependencies.

## Features
- **Incremental Spaced Repetition**: Memory reinforcement logic to show words as they fade from memory.
- **Library Management**: Create specific Day sets, add words with IPA, meanings, examples.
- **Learn & Review Modes**: Interactive flashcards.
- **Analytics**: Activity graphs, retention strength tracking.
- **Total Privacy**: Everything stays in your browser (IndexedDB).
- **Import/Export**: JSON-based backup support.
- **PWA/Vercel Ready**: Deploy instantly to Vercel as a static site.

## Installation & Local Development

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the complete client locally:
   ```bash
   npm run dev
   ```

## Export for Production / Deployment

Because this app utilizes standard static site generation, you can easily build it.

```bash
npm run build
```

**Deploy to Vercel:**
Since the app uses `react-router-dom` in BrowserRouter mode and fully static Vite hosting, Vercel just works.
1. Install Vercel CLI (or connect repo via dashboard): `npm i -g vercel`
2. Run `vercel` in root folder.
*(Ensure vercel config points all routes to index.html using rewrites if deploying manually, but standard Vite presets on Vercel handle this automatically for SPAs)*

## Folder Structure
- `src/components`: Reusable UI elements (Button, Card, Input) + Modals
- `src/pages`: Distinct application views logic (Dashboard, Study, Library, Settings)
- `src/db`: idb Wrapper & object store configurations
- `src/hooks`: Global state wrapping DB
- `src/lib`: Standard utility helpers
