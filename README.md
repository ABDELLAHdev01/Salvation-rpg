# Salvation Frontend

Salvation is a fantasy-themed browser UI for managing farming, mining, crafting, and character progression. This repo contains the React + Vite frontend.

## Stack

- React 19 + React Router
- Vite 6
- Tailwind CSS v4 + custom CSS theming
- ESLint

## Getting Started

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Configuration

Environment variables (Vite):

- `VITE_MOCK_AUTH=true` to use local mock profiles and data in development.

## Project Structure

```
src/
	components/       Reusable UI components
	pages/            Route-level screens
	services/         Client-side data + helpers
	styles.css        Global styles
	App.css           Theme + UI effects
```

## Notes

- Assets live in `public/`.
- Routing lives in `src/App.jsx`.
- Tailwind is configured via `@tailwindcss/vite`.
