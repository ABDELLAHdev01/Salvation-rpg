# SALVATION — AAA-QUALITY STUDIO AUDIT & IMPLEMENTATION ROADMAP
## DELIVERABLE 08: IMPLEMENTATION ROADMAP & EXECUTION PLAN

**Studio Project Management & Technical Production Board**  
**Execution Horizon:** 6 Structured Development Phases (Estimated 10–12 Weeks Total)  
**Methodology:** Dependency-Aware Priority Scheduling (P0 -> P1 -> P2 -> P3)

---

### 1. SCORING METHODOLOGY & RISK FRAMEWORK

Every implementation ticket in this roadmap is evaluated using an objective 4-dimensional scoring model:

- **Impact (1 to 5):** The degree to which this work elevates commercial quality, fixes game-breaking blockers, or enriches player retention.
  - *5 = Critical Game Blocker or Major Commercial Feature*
  - *4 = Significant Gameplay Polish or Core Mechanic*
  - *3 = Moderate Quality-of-Life or UI Enhancement*
  - *2 = Minor Polish or Non-Critical Refactor*
  - *1 = Trivial Visual Tweak*
- **Confidence (1 to 5):** The team's architectural certainty regarding the solution, backed by repository inspection and verified line references.
  - *5 = Absolute Certainty (Demonstrated directly in audited code)*
  - *4 = High Certainty (Standard pattern, low ambiguity)*
  - *3 = Medium Certainty (Requires UI experimentation or tuning)*
  - *2 = Low Certainty (Experimental gameplay mechanic)*
- **Effort (1 to 5):** Estimated development complexity, testing overhead, and regression risk.
  - *1 = Less than 0.5 developer-days*
  - *2 = 1 to 2 developer-days*
  - *3 = 3 to 4 developer-days*
  - *4 = 5 to 7 developer-days*
  - *5 = 8+ developer-days (Major architectural subsystem)*
- **Risk (Low / Medium / High):** Potential to cause regressions, break save data, or introduce cross-system dependencies.

---

### 2. MASTER DEPENDENCY-AWARE ROADMAP OVERVIEW

```mermaid
graph TD
    PhaseA[Phase A: Stabilize & Defect Remediation\nWeek 1-2 | P0 Blocker Fixes] --> PhaseB[Phase B: Visual Identity & Typography\nWeek 3-4 | Design System & Layouts]
    PhaseB --> PhaseC[Phase C: Game Feel & Audio Engine\nWeek 5-6 | Web Audio, SFX & Motion]
    PhaseC --> PhaseD[Phase D: Core Systems & Economic Rework\nWeek 7-8 | Farming, Husbandry & Mining]
    PhaseD --> PhaseE[Phase E: Narrative & Progression Depth\nWeek 9-10 | Warden's Chronicle & Classes]
    PhaseE --> PhaseF[Phase F: Performance & Release Hardening\nWeek 11-12 | Asset Compression, A11y, Vitest]
```

---

### 3. PHASE A — STABILIZE & DEFECT REMEDIATION

**Objectives:** Eliminate all P0 runtime bugs, resolve broken assets, fix build compilation warnings, repair save export gaps, and eliminate ESLint errors.  
**Prerequisites:** None.  
**Total Effort:** ~8 Developer-Days.

#### Ticket Inventory — Phase A

##### `TICK-A01` — Fix Active Mining Clicker Loot Dispatch & XP Engine
- **Priority:** **P0 (Critical Blocker)**
- **Score:** Impact: 5 | Confidence: 5 | Effort: 2 | Risk: Medium
- **Affected Files:** `src/features/mining/MiningClickPage.jsx`, `src/core/data/miningData.js`
- **Detailed Tasks:**
  1. Fix `rollMiningTick` invocation in `MiningClickPage.jsx` to pass an options object `{ miningLevel, pickaxeLevel, forgeLevel }` instead of raw numbers.
  2. Map returned `yieldMap` to `pendingItems` instead of looking for non-existent `reward` property.
  3. Correct node durability calculation: add `durability` to `miningOres` catalog.
  4. Fix `addItems` call on node shatter: pass `(profile.inventory, totalItemsToSync)` and assign returned state to profile update payload.
  5. Correct `clickBaseXp` calculation so shattered nodes award real mining XP.
- **Acceptance Criteria:** Clicking an ore node damages durability, produces floating spark feedback, and shattering the node correctly awards both ore items to the inventory and XP to mining progression.
- **Testing:** Playwright test verifying 100 hits -> node shatter -> inventory increment.

##### `TICK-A02` — Fix Pickaxe Asset References & File Path Mismatches
- **Priority:** **P0 (Critical Blocker)**
- **Score:** Impact: 5 | Confidence: 5 | Effort: 1 | Risk: Low
- **Affected Files:** `src/core/data/miningData.js`
- **Detailed Tasks:**
  1. Correct lines 159, 168, and 177 in `pickaxeUpgrades`:
     - Change `/pickaxe/mythril.webp` to `/pickaxe/mythril_pickaxe.webp`.
     - Change `/pickaxe/voidsteel.webp` to `/pickaxe/voidsteel_pickaxe.webp`.
     - Change `/pickaxe/starforge.webp` to `/pickaxe/starforge_pickaxe.webp`.
- **Acceptance Criteria:** Upgrading pickaxe to tiers 5, 6, and 7 displays the correct high-tier pickaxe artwork without broken image icons.

##### `TICK-A03` — Resolve Build Warnings, Missing Stylesheet Link & Duplicate Tailwind
- **Priority:** **P1 (High)**
- **Score:** Impact: 4 | Confidence: 5 | Effort: 1 | Risk: Low
- **Affected Files:** `index.html`, `src/core/styles/App.css`, `src/core/styles/index.css`
- **Detailed Tasks:**
  1. Remove dead `<link href="/src/styles.css" rel="stylesheet" />` from `index.html`.
  2. Remove `@import "tailwindcss";` from `src/core/styles/App.css` to prevent duplicate compilation.
  3. Remove unreferenced CDN SweetAlert script tag from `index.html`.
- **Acceptance Criteria:** `npm run build` executes cleanly with 0 unresolved stylesheet warnings.

##### `TICK-A04` — Fix ESLint Errors Across Core Codebase
- **Priority:** **P1 (High)**
- **Score:** Impact: 4 | Confidence: 5 | Effort: 1 | Risk: Low
- **Affected Files:** `src/core/services/CharacterService.jsx`, `src/features/character/SelectCity.jsx`
- **Detailed Tasks:**
  1. Remove unused destructured variables `activeZoneId` and `unlockedZones` in `CharacterService.jsx:45`.
  2. Remove unused prop `onPrev` in `SelectCity.jsx:4`.
- **Acceptance Criteria:** `npm run lint` completes with **0 errors and 0 warnings**.

##### `TICK-A05` — Harden Save Data Export & Prevent Destructive Profile Resets
- **Priority:** **P0 (Critical Blocker)**
- **Score:** Impact: 5 | Confidence: 5 | Effort: 3 | Risk: High
- **Affected Files:** `src/features/system/LoadSavePage.jsx`, `src/core/services/CharacterService.jsx`
- **Detailed Tasks:**
  1. Add `expeditionSession:${username}`, `profileSystemReset:${username}`, `marketCollapsedSections`, and `marketBulkSellConfirmDisabled` to `STORAGE_KEYS` in `LoadSavePage.jsx`.
  2. Refactor `CharacterService.getMockProfile()` so missing reset keys do NOT overwrite existing player stats.
  3. Implement schema versioning flag (`version: 2`) in exported save JSON.
- **Acceptance Criteria:** Exporting a save file and importing it on a fresh browser cleanly restores all levels, inventory, active expeditions, and settings without triggering a profile reset.

---

### 4. PHASE B — ESTABLISH GAME IDENTITY & DESIGN SYSTEM

**Objectives:** Overhaul the visual identity, implement the "Gothic Hearth" design system, replace global `Tagesschrift` with legible dual-tier typography, and rebuild the responsive layout shell.  
**Prerequisites:** Phase A completed.  
**Total Effort:** ~10 Developer-Days.

#### Ticket Inventory — Phase B

##### `TICK-B01` — Establish Tailwind v4 Design Tokens & Semantic CSS Variables
- **Priority:** **P1 (High)**
- **Score:** Impact: 5 | Confidence: 5 | Effort: 2 | Risk: Low
- **Affected Files:** `src/core/styles/index.css`, `src/core/styles/styles.css`
- **Detailed Tasks:**
  1. Define semantic color tokens in `@theme`: Obsidian Abyss (`#08090D`), Slate Surface (`#11131A`), Sunforge Gold (`#E5B25D`), Ember Flame (`#D9532F`), Vitality Emerald (`#2EB872`).
  2. Implement ornate border and inner-bevel utilities (`.border-ornate`, `.panel-slate`, `.bevel-light`).
- **Acceptance Criteria:** All UI surfaces reference standardized semantic tokens instead of arbitrary ad-hoc Tailwind colors.

##### `TICK-B02` — Typographic Hierarchy Overhaul & Tagesschrift Pruning
- **Priority:** **P1 (High)**
- **Score:** Impact: 5 | Confidence: 5 | Effort: 2 | Risk: Medium
- **Affected Files:** `index.html`, `src/core/styles/styles.css`, `src/main.jsx`
- **Detailed Tasks:**
  1. Remove `.tagesschrift-regular` from `<div id="root">` in `index.html`.
  2. Import `Cinzel` (Google Fonts) for display titles, section kickers, and card headings.
  3. Set default body font to clean, high-legibility `Inter` with `tabular-nums` for all numeric counters and timers.
- **Acceptance Criteria:** Body text and numbers are crisp and readable on mobile and desktop; gothic display serif is restricted to prominent headers and banners.

##### `TICK-B03` — Unified Navigation & Layout Shell Modernization
- **Priority:** **P1 (High)**
- **Score:** Impact: 4 | Confidence: 4 | Effort: 3 | Risk: Low
- **Affected Files:** `src/shared/layout/Sidebar.jsx`, `src/shared/layout/Navbar.jsx`
- **Detailed Tasks:**
  1. Add missing critical navigation links to `Sidebar.jsx`: *Inventory / Vault* and *Warden Chronicle (Quests)*.
  2. Standardize mobile drawer navigation with smooth slide-over transitions.
  3. Ensure background artwork uses `bg-blend-multiply` with low opacity (`0.25`) to prevent visual noise.
- **Acceptance Criteria:** Players can reach Vault and Quests from any screen via the primary sidebar.

##### `TICK-B04` — Integrate Character Class Selection & Route Edit Character
- **Priority:** **P2 (Medium)**
- **Score:** Impact: 4 | Confidence: 5 | Effort: 3 | Risk: Low
- **Affected Files:** `src/features/character/CreateCharacterPage.jsx`, `src/App.jsx`, `src/features/profile/ProfilePage.jsx`
- **Detailed Tasks:**
  1. Insert `SelectClass.jsx` into the `CreateCharacterPage` wizard between `SelectRace` and `SelectSex`.
  2. Pass selected class to `CharacterService.createCharacter`.
  3. Add `<Route path="/character/edit" element={<ProtectedRoute><EditCharacter /></ProtectedRoute>} />` to `App.jsx`.
  4. Link "Edit Appearance" button from `ProfilePage.jsx` to `/character/edit`.
- **Acceptance Criteria:** New characters choose their class in creation; existing characters can navigate to edit appearance for in-game gold.

---

### 5. PHASE C — ELEVATE GAME FEEL & AUDIO ENGINE

**Objectives:** Implement interactive Web Audio engine, tactile sound effects, responsive micro-animations, and celebratory reward moments.  
**Prerequisites:** Phase B completed.  
**Total Effort:** ~9 Developer-Days.

#### Ticket Inventory — Phase C

##### `TICK-C01` — Web Audio Engine (`AudioManager.js`) Architecture
- **Priority:** **P1 (High)**
- **Score:** Impact: 5 | Confidence: 5 | Effort: 3 | Risk: Low
- **Affected Files:** `src/core/audio/AudioManager.js` (New), `src/shared/feedback/InteractionFeedbackLayer.jsx`
- **Detailed Tasks:**
  1. Create zero-dependency Web Audio API manager with master, SFX, and ambient gain nodes.
  2. Hook into `ui:sfx` events dispatched by `InteractionFeedbackLayer.jsx`.
  3. Implement pitch-randomization (`±8%`) on high-frequency cues to prevent audio monotony.
  4. Implement persistent mute and volume slider controls in player settings.
- **Acceptance Criteria:** UI clicks trigger subtle wooden tap sounds; volume settings persist across sessions.

##### `TICK-C02` — Tactical SFX Suite: Farming, Mining, Workshop & Economy
- **Priority:** **P1 (High)**
- **Score:** Impact: 5 | Confidence: 4 | Effort: 3 | Risk: Low
- **Affected Files:** `src/core/audio/AudioManager.js`, `public/audio/sfx/` (New)
- **Detailed Tasks:**
  1. Integrate audio cues: `farm_crop_harvest`, `farm_seed_plant`, `mine_pick_strike`, `mine_shatter`, `workshop_hammer`, `market_gold_coins`.
  2. Trigger sound effects on corresponding engine state transitions.
- **Acceptance Criteria:** Harvesting crops produces a crisp chime; mining strikes ring with metallic resonance; buying/selling clinks with heavy coins.

##### `TICK-C03` — Visual Interaction Polish & Reduced-Motion Support
- **Priority:** **P2 (Medium)**
- **Score:** Impact: 4 | Confidence: 5 | Effort: 3 | Risk: Low
- **Affected Files:** `src/shared/feedback/RewardFloatProvider.jsx`, `src/core/styles/styles.css`
- **Detailed Tasks:**
  1. Refactor `RewardFloatProvider` to stagger multiple items cleanly.
  2. Implement full `@media (prefers-reduced-motion: reduce)` fallbacks disabling coordinate motion.
  3. Add hover lifts and gold focus rings across PlotCards, RecipeCards, and ItemCards.
- **Acceptance Criteria:** Interactions feel snappy and responsive; reduced motion completely eliminates screen shake and coordinate floating.

---

### 6. PHASE D — CORE SYSTEMS & ECONOMIC REWORK

**Objectives:** Rebalance farming curves, overhaul livestock timers and feeding, fix mining depth progression, eliminate market crafting arbitrage.  
**Prerequisites:** Phase A and C completed.  
**Total Effort:** ~12 Developer-Days.

#### Ticket Inventory — Phase D

##### `TICK-D01` — Farming Rebalance & Moonberry ROI Correction
- **Priority:** **P1 (High)**
- **Score:** Impact: 4 | Confidence: 5 | Effort: 2 | Risk: Medium
- **Affected Files:** `src/core/data/farmData.js`, `src/features/farm/FarmPlotsPage.jsx`
- **Detailed Tasks:**
  1. Rebalance seed costs, growth times, and sell prices according to Deliverable 04 specifications.
  2. Buff Moonberry net profit to +155g (3.44 g/min).
  3. Rebalance daily farm delivery task gold rewards so delivering crops awards 120% of market value rather than a 60% penalty.
- **Acceptance Criteria:** Higher-tier crops produce strictly greater total profit per plot than lower-tier crops; quests reward more gold than direct vendor sales.

##### `TICK-D02` — Animal Husbandry Overhaul: Compressed Cycles & Feed Mechanics
- **Priority:** **P1 (High)**
- **Score:** Impact: 5 | Confidence: 4 | Effort: 4 | Risk: Medium
- **Affected Files:** `src/core/data/farmData.js`, `src/features/farm/FarmAnimalsPage.jsx`
- **Detailed Tasks:**
  1. Compress livestock production timers from MMO scale (6–14 hours) to management scale (30 min – 2 hours).
  2. Add an inline "Purchase Livestock" stall directly inside `FarmAnimalsPage.jsx`.
  3. Implement the "Feed Animal" mechanic using harvested Wheat and Turnips to boost yield by +50%.
- **Acceptance Criteria:** Animal break-even times drop from 14 days to 4–13 gameplay hours; animals can be purchased and fed directly in the pasture interface.

##### `TICK-D03` — Mining Caverns & Discovery Mechanics
- **Priority:** **P1 (High)**
- **Score:** Impact: 4 | Confidence: 4 | Effort: 3 | Risk: Medium
- **Affected Files:** `src/features/mining/MiningPage.jsx`, `src/core/data/miningData.js`
- **Detailed Tasks:**
  1. Rebalance passive mining session ticks to scale with pickaxe upgrades and depth strata.
  2. Implement geode discovery rolls during mining runs that can be cracked in the Workshop for rare gems.
- **Acceptance Criteria:** Mining feels distinct from farming, featuring rare discovery rolls and explicit tool progression gates.

##### `TICK-D04` — Workshop Crafting Rebalance & Arbitrage Prevention
- **Priority:** **P1 (High)**
- **Score:** Impact: 4 | Confidence: 5 | Effort: 3 | Risk: Medium
- **Affected Files:** `src/core/data/workshopData.js`, `src/features/market/MarketPage.jsx`
- **Detailed Tasks:**
  1. Ensure all workshop recipes provide a verified +25% to +35% value-add over raw materials.
  2. Restrict market purchase of raw crafting ingredients (or price them above crafted outputs) to eliminate the infinite gold loop.
- **Acceptance Criteria:** Crafting is always profitable when harvesting raw materials, but cannot be exploited via instant market re-selling.

---

### 7. PHASE E — PROGRESSION & NARRATIVE DEPTH

**Objectives:** Unify Quests and Missions into the "Warden's Chronicle", implement NPC estate mentors, integrate faction perks, and flesh out the lore bible.  
**Prerequisites:** Phase D completed.  
**Total Effort:** ~10 Developer-Days.

#### Ticket Inventory — Phase E

##### `TICK-E01` — The Warden's Chronicle: Unifying Quests & Missions
- **Priority:** **P1 (High)**
- **Score:** Impact: 5 | Confidence: 5 | Effort: 4 | Risk: Low
- **Affected Files:** `src/features/quests/QuestsPage.jsx`, `src/features/missions/MissionsPage.jsx`, `src/core/data/missionData.js`
- **Detailed Tasks:**
  1. Retire the static `mockQuests.js` file.
  2. Consolidate `/quests` and `/missions` into a unified route: `/chronicle`.
  3. Divide objectives into *Daily Orders* (renewable bounties) and *Chronicle Chapters* (permanent narrative estate milestones).
  4. Ensure all objectives dynamically track real engine stats and award gold, XP, and lore unlocks.
- **Acceptance Criteria:** A single, intuitive quest interface where all tasks reflect actual gameplay achievements with claimable rewards.

##### `TICK-E02` — Faction Starting Perks & Regional Contracts
- **Priority:** **P2 (Medium)**
- **Score:** Impact: 4 | Confidence: 4 | Effort: 3 | Risk: Low
- **Affected Files:** `src/core/data/citiesData.js`, `src/core/services/CharacterService.jsx`
- **Detailed Tasks:**
  1. Implement mechanical faction passives: Eldoria (+10% crop speed), Valoria (+10% market sell value), Drakmor (+10% mining ore yield).
  2. Display faction crest and lore on the player profile and dashboard.
- **Acceptance Criteria:** Choosing a starting city in character creation applies a permanent, visible passive trait to the player's profile.

##### `TICK-E03` — NPC Mentor Dialog Vignettes & Milestone Events
- **Priority:** **P3 (Polish)**
- **Score:** Impact: 3 | Confidence: 5 | Effort: 3 | Risk: Low
- **Affected Files:** `src/features/lore/LorePage.jsx`, `src/features/dashboard/DashboardPage.jsx`
- **Detailed Tasks:**
  1. Add illustrated NPC dialogue banners for Elric (Smith), Selyse (Herbalist), Moira (Beastkeeper), and Bran (Delver).
  2. Trigger milestone congratulation modals upon reaching Farm Level 5, Mining Level 5, and Estate Tier 2.
- **Acceptance Criteria:** Key progression thresholds trigger narrative acknowledgement from estate characters.

---

### 8. PHASE F — HARDEN, OPTIMIZE & RELEASE READINESS

**Objectives:** Asset compression (saving 15MB), accessibility compliance, Vitest test suite implementation, Playwright end-to-end verification, and mobile responsiveness polish.  
**Prerequisites:** All previous phases completed.  
**Total Effort:** ~8 Developer-Days.

#### Ticket Inventory — Phase F

##### `TICK-F01` — Asset Pipeline Optimization: Convert 15.4MB PNGs to WebP
- **Priority:** **P1 (High)**
- **Score:** Impact: 5 | Confidence: 5 | Effort: 2 | Risk: Low
- **Affected Files:** `public/cities/*.png`, `src/core/data/citiesData.js`
- **Detailed Tasks:**
  1. Convert all 6 city background and logo PNGs to compressed WebP (max width 1920px, 80% quality).
  2. Update image paths in `citiesData.js`.
  3. Prune unreferenced raw AI files and duplicate images in `public/`.
- **Acceptance Criteria:** `public/cities/` size drops from **15.4 MB to under 1.2 MB**; page load time improves by >50%.

##### `TICK-F02` — Automated Vitest Test Suite for Core Game Engines
- **Priority:** **P1 (High)**
- **Score:** Impact: 5 | Confidence: 5 | Effort: 3 | Risk: Low
- **Affected Files:** `tests/farming.test.js`, `tests/mining.test.js`, `tests/inventory.test.js`, `package.json`
- **Detailed Tasks:**
  1. Install Vitest and configure `vitest.config.js`.
  2. Write unit tests for crop growth formulas, mining drop tables, inventory deltas, and save schema migrations.
  3. Add `npm test` script to `package.json`.
- **Acceptance Criteria:** `npm test` runs in CI and passes 100% of domain logic tests in under 2 seconds.

##### `TICK-F03` — Mobile Usability & Narrow-Screen Responsive Polish
- **Priority:** **P2 (Medium)**
- **Score:** Impact: 4 | Confidence: 4 | Effort: 3 | Risk: Low
- **Affected Files:** `src/features/farm/FarmPlotsPage.jsx`, `src/features/market/MarketPage.jsx`, `src/shared/layout/Sidebar.jsx`
- **Detailed Tasks:**
  1. Ensure minimum touch target sizes (≥ 44px x 44px) on all harvest and action buttons.
  2. Optimize grid wrapping on 360px–420px mobile viewports (plots collapse into 1-column cards, market search bar full width).
  3. Audit color contrast ratios for WCAG AA compliance (4.5:1 text on dark panels).
- **Acceptance Criteria:** Game is 100% playable on mobile browsers with zero horizontal overflow and clear tap targets.
