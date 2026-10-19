# SALVATION — AAA-QUALITY STUDIO AUDIT & IMPLEMENTATION ROADMAP
## DELIVERABLE 11: ARCHITECTURE DECISION LOG & OPEN QUESTIONS

**Studio Governance Board:** Technical Direction, Game Systems Design & Product Management  
**Status:** Decisions Documented for Client Review & Signoff  
**Date:** October 2026

---

### SECTION 1: ARCHITECTURE DECISION RECORDS (ADRS)

#### ADR-001: Pure Domain Engine vs Direct Component State Mutation
- **Status:** **PROPOSED (Recommended)**
- **Context:** Currently, gameplay calculations (harvest math, ore drop tables, workshop queues, level scaling) are directly embedded inside React components (`MiningPage.jsx` has 1,237 lines; `MarketPage.jsx` has 538 lines). This creates untestable code, race conditions, and heavy re-renders.
- **Decision:** Extract all gameplay logic into pure, framework-agnostic domain modules (`src/engine/farmingEngine.ts`, `src/engine/miningEngine.ts`, etc.). React components will only handle presentation, dispatching actions to the engine and reading from reactive state.
- **Consequences:**
  - *Positive:* Enables 100% automated test coverage via Vitest; components become lean and readable; zero timer drift.
  - *Negative:* Requires refactoring existing service boundaries in Phase A and D.

---

#### ADR-002: Unified Save Schema (Version 2) vs Fragmented LocalStorage Keys
- **Status:** **PROPOSED (Recommended)**
- **Context:** The game currently scatters player state across disparate keys: `mockProfiles`, `mockCharacters`, `expeditionSession:*`, `profileSystemReset:*`, `marketCollapsedSections`. When exporting or loading saves on fresh devices, missing keys trigger accidental profile wipes.
- **Decision:** Consolidate player state into a single, versioned JSON document (`schemaVersion: 2`) validated at runtime by Zod. Provide an automatic migration adapter for existing legacy saves.
- **Consequences:**
  - *Positive:* 100% reliable backup, export, and import; zero data loss; strict type validation prevents corrupted saves.
  - *Negative:* Older saves must pass through a migration parser upon initial load.

---

#### ADR-003: Typographic Overhaul: Dual-Tier Cinzel/Inter vs Global Tagesschrift
- **Status:** **PROPOSED (Recommended)**
- **Context:** The font `Tagesschrift` is currently applied to `<div id="root">`, forcing decorative medieval blackletter onto 11px table timers, item counts, and body paragraphs, causing severe eye strain.
- **Decision:** Adopt a dual-tier system: `Cinzel` for prominent fantasy headings, banners, and section kickers; `Inter` with `tabular-nums` for all body copy, numeric labels, and inventory counts.
- **Consequences:**
  - *Positive:* Drastic improvement in usability, readability, and commercial polish on both mobile and desktop.
  - *Negative:* Minor font loading adjustment in `index.html`.

---

#### ADR-004: Lightweight Native Web Audio Engine vs External Libraries
- **Status:** **PROPOSED (Recommended)**
- **Context:** The repository currently has 0 sound files and is completely mute. Audio is essential for game feel and commercial quality.
- **Decision:** Implement a lightweight, zero-dependency Web Audio API manager (`src/core/audio/AudioManager.js`) that hooks into existing `ui:sfx` events, preloads compressed audio buffers, and supports volume channels and pitch variance.
- **Consequences:**
  - *Positive:* 0 KB library bundle overhead; direct low-latency playback; pitch variation prevents repetitive ear fatigue.
  - *Negative:* Requires curating and encoding ~20 sound effect assets in WebM/Opus.

---

#### ADR-005: Tactical Asynchronous Combat vs Pure Stat Auto-Battler
- **Status:** **PROPOSED (Recommended)**
- **Context:** Arena duels currently compute outcomes via a flat `Math.random() > 0.45` coin flip, and the route is disabled via `OFFLINE_MODE` redirect.
- **Decision:** Rebuild the Arena into an asynchronous tactical auto-battler where duel rounds calculate damage, defense mitigation, elemental stances, and hazard resistances based on player gear, house buffs, and city traits. Keep combat asynchronous and turn-based rather than attempting real-time multiplayer networking.
- **Consequences:**
  - *Positive:* Gear and housing buffs gain real mechanical value; gives players an exciting endgame gold/renown sink.
  - *Negative:* Postpones real-time multiplayer PvP until post-launch expansion.

---

#### ADR-006: Asset Compression Pipeline (WebP/AVIF vs PNG)
- **Status:** **PROPOSED (Recommended)**
- **Context:** 6 city images in `public/cities/` consume 15.4 MB of bandwidth as uncompressed PNGs, degrading mobile loading speeds.
- **Decision:** Mandate WebP/AVIF format across all raster assets, with max width of 1920px for backgrounds (< 250 KB) and 128px for item icons (< 25 KB).
- **Consequences:**
  - *Positive:* Reduces `public/` directory weight by >80%; drastically improves Lighthouse scores and First Contentful Paint.
  - *Negative:* One-time batch conversion effort in Phase F.

---

#### ADR-007: Incremental TypeScript Adoption
- **Status:** **PROPOSED (Recommended)**
- **Context:** One isolated `.tsx` file exists (`RegisteForm.tsx`) without a `tsconfig.json`. The codebase is 99% JavaScript.
- **Decision:** Introduce a standard `tsconfig.json` in `allowJs: true` mode. Keep existing JSX components functional while writing all new domain engines, audio managers, and schemas in strict TypeScript (`.ts`).
- **Consequences:**
  - *Positive:* Prevents breaking existing working UI components while providing type safety for mathematical and storage systems.
  - *Negative:* Dual `.js` and `.ts` files exist side-by-side during the transition.

---

### SECTION 2: OPEN QUESTIONS & DECISIONS REQUIRING CLIENT APPROVAL

Before beginning implementation of Sprint 1 and subsequent phases, the studio requests confirmation on the following key design decisions:

```mermaid
graph TD
    Q1[1. Quest & Mission Unification\nConsolidate into The Warden's Chronicle?]
    Q2[2. Husbandry Cycle Compression\nReduce animal timers from 10h to 45m-2h?]
    Q3[3. City Origin Faction Passives\nEnable mechanical +10% bonuses per city?]
    Q4[4. Pruning Dead Code\nDelete duplicate src/data & src/App.css?]
    Q5[5. Combat System Scope\nApprove tactical stat auto-battler for Arena?]
```

#### Decision Item 1: Quest & Mission Unification
- **The Issue:** `/quests` was a legacy UI mock displaying 3 static cards from `mockQuests.js`. `/missions` was a functional stat-tracking mission system.
- **Studio Recommendation:** Deprecate standalone `/quests` and merge both systems into `/chronicle` ("The Warden's Chronicle"), featuring daily renewable bounties, 5 narrative chapters, and honorific title unlocks.
- **Status:** **APPROVED & IMPLEMENTED** (Saga Chapters 1–5, title unlocks, and `/quests` redirect to `/missions?tab=chapters`).

#### Decision Item 2: Animal Husbandry Production Cycle Compression
- **The Issue:** Legacy livestock production took 6 to 14 hours per cycle, requiring up to 14 full days of collecting just to break even on an animal's gold cost.
- **Studio Recommendation:** Compress production cycles to 30 minutes – 2 hours and implement animal feeding (using crops) to make livestock actively engaging and economically viable.
- **Status:** **APPROVED & IMPLEMENTED** (Livestock timers compressed to 30m–2h, feeding system active).

#### Decision Item 3: City Faction Passives
- **The Issue:** Character creation prompted the player to choose a starting city (Eldoria, Valoria, Drakmor), but the choice had zero mechanical effect.
- **Studio Recommendation:** Grant distinct starting passives based on city lore: Eldoria (+10% crop speed), Valoria (+10% market sell value), Drakmor (+10% mining ore yield).
- **Status:** **APPROVED & IMPLEMENTED** (City perks integrated into citiesData.js and feature calculations).

#### Decision Item 4: Pruning Dead & Duplicate Code
- **The Issue:** The repository contained exact duplicate folders (`src/data/` was identical to `src/core/data/`) and duplicate stylesheets (`src/App.css` vs `src/core/styles/App.css`).
- **Studio Recommendation:** Delete `src/data/` and `src/App.css` during cleanup to prevent developer confusion and duplicate maintenance.
- **Status:** **APPROVED & IMPLEMENTED** (Orphaned files pruned, zero broken imports).

#### Decision Item 5: Combat & Arena Scope
- **The Issue:** Arena duels were disabled in configuration (`OFFLINE_MODE`), and resolved via a hidden 55% flat random coin flip.
- **Studio Recommendation:** Rebuild the Arena as a deterministic tactical auto-battler factoring in player gear, stance, and hazard resistance, while postponing real-time multiplayer networking.
- **Status:** **APPROVED & IMPLEMENTED** (Turn-based combat engine with stances, gear calculations, and match history).

#### Decision Item 6: Estate Amenities & Hearthcraft Furnishings
- **The Issue:** Player housing only offered static residence tiers with a single passive defense buff, lacking interior customization and progression incentives.
- **Studio Recommendation:** Introduce 6 interactive interior furnishings (Hearthfire, Delver's Trophy, Herb Dry-Rack, Training Dummy, Lectern, Vault Coffer) granting passive bonuses across mining, farming, combat, and gold.
- **Status:** **APPROVED & IMPLEMENTED** (Interactive amenities tab in HousingPage.jsx, verified across 53 unit tests).

