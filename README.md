# Salvation Frontend

Salvation is a fantasy-themed browser UI for managing farming, mining, crafting, and character progression. This repo contains the React + Vite frontend.

## Game Overview

Salvation is a cozy, dark-fantasy management experience focused on steady progression. You grow crops, raise animals, mine resources, and craft upgrades while expanding your land and unlocking new gameplay tiers.

Core gameplay loops:

- Farm plots: plant seeds, track grow timers, and harvest for goods.
- Animal husbandry: buy animals, collect produce, and scale output over time.
- Mining: claim ore nodes, collect materials, and unlock deeper zones.
- Crafting and upgrades: turn raw goods into value and improve efficiency.
- Quests and tasks: daily/weekly/monthly goals that reward progress.

Progression highlights:

- Farm and mining levels gate new crops, animals, and zones.
- Seasonal modifiers shift grow speed and yield bonuses.
- Economy balance revolves around gold, inventory, and market decisions.

UI features in this frontend:

- Styled hub pages for farm, mining, and character management.
- Reward float feedback for key actions.
- Performance-friendly tick updates for timed systems.
- Fantasy-themed components and ambient visual effects.

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
