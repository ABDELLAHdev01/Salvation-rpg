# Salvation: Comprehensive Repository Audit & Architectural Blueprint
**Date:** October 2026 | **Engine Target:** Phaser 3.88 + React 18 | **Mode:** Offline-First 2D Fantasy RPG

---

## 1. Executive Summary & Inventory

An exhaustive codebase inspection of the **Salvation** repository was conducted. The application is built using **Vite 5**, **React 18**, and **Phaser 3.88.2** with TailwindCSS and Heroicons.

### 1.1 Project Structure & Routing Inventory

```
Salvation-rpg/
├── src/
│   ├── core/
│   │   ├── audio/           # Web Audio API procedural sound synthesis (AudioManager)
│   │   ├── data/            # Static game catalogues (crops, ores, items, lore, gear, cities)
│   │   ├── phaser/          # Phaser 3 2D world engine, scenes, canvas generator, event bridge
│   │   │   ├── scenes/      # Phaser scenes (WorldScene)
│   │   │   ├── CharacterSpriteGenerator.js   # Dynamic layered canvas spritesheet generator
│   │   │   ├── characterCustomizationData.js # 10 customization categories, palettes & sanitizer
│   │   │   ├── gameEventBridge.js            # Bi-directional Phaser <-> React event bus
│   │   │   ├── PhaserWorldCanvas.jsx         # React mounting wrapper with HUD & modals
│   │   │   └── WorldTileGenerator.js         # Procedural canvas textures for world & props
│   │   ├── services/        # CharacterService, AuthService, inventoryService, WorkshopService
│   │   └── world/           # WorldHUD, CitadelWorldView, pixelAssets
│   ├── features/
│   │   ├── character/       # CreateCharacterPage (2D Forge), EditCharacterPage (2D Wardrobe)
│   │   ├── combat/          # Colosseum Arena pages, opponents, widgets
│   │   ├── dashboard/       # Citadel hub, PlayerIdentityCard, SkillProgressGrid
│   │   ├── farm/            # Legacy ledger-based farm plots, animals, tasks
│   │   ├── mining/          # Mining ledger and clicker
│   │   ├── missions/        # Chronicle missions, chapters, milestones
│   │   └── world/           # WorldPage (Dedicated 2D Living World canvas + HUD)
│   └── shared/              # Sidebar layout, modals, UI primitives
├── tests/                   # 13 Vitest suites (94 tests passing)
└── docs/                    # Architectural documentation and audit archives
```

### 1.2 Registered Application Routes
- `/` - Home landing page
- `/login`, `/register` - Authentication screens (supports seamless offline mock session)
- `/character` - **2D Character Customization Forge** (live pixel preview, 10 categories, randomize, reset)
- `/character/edit` - **Sanctum of Transformation** (re-customize 2D pixel appearance, tools, race)
- `/world` - **Playable 2D Fantasy RPG World** (Phaser 3 canvas, WASD/Sprint, farming, mining, zones)
- `/dashboard` - Citadel plaza overview and quick access
- `/inventory` - Item ledger and categorized pouch inspection
- `/farm`, `/farm/plots` - Farm overview & plot management
- `/mining`, `/mining/click` - Mine overview & manual delve
- `/workshop` - Artisan crafting, smelting, lapidary, codex deciphering
- `/arena`, `/arena/fight` - Colosseum ranked combat
- `/housing` - Manor estate, amenities, trophies
- `/chronicle`, `/missions` - Story chapters, daily/weekly tasks

---

## 2. Existing Game Mechanics Audit

| System | Implementation Status | Functional State | Architectural Recommendation |
| :--- | :--- | :--- | :--- |
| **Character & Customization** | Procedural 32x32 canvas spritesheet | **100% Functional** | Persists across reload via `CharacterService`. Supports 10 categories and live 4-direction previews. |
| **2D World Movement & Camera** | Phaser Arcade Physics + Camera Lerp | **100% Functional** | WASD/Arrows, normalized diagonals, sprint with `Shift`, smooth camera bounds. |
| **In-World Farming** | Interactive grid plots in Homestead | **100% Functional** | 4 visual growth stages, proximity `[E]` interact, seed modal, harvest drops, XP awards. |
| **In-World Mining** | Interactive boulder nodes in Deepforge | **100% Functional** | Pickaxe animation, sparks, durability, resource drops (iron, copper, gold, geodes), XP awards. |
| **Real-Time Action Combat** | Currently missing in 2D World | **Requires Implementation** | Add weapon attack swings, enemy AI state machines (Slimes, Skeletons, Goblins), health, damage floaters, loot drops. |
| **Inventory & Items** | Normalized dictionary (`itemId: count`) | **100% Functional** | Decoupled item mutations in `inventoryService.js`, full catalogue in `itemsCatalog.js`. |
| **Economy & Gold** | Stored in `profile.stats.gold` | **100% Functional** | Currency checked for purchases, seed buying, race changes, and earned via harvests. |
| **Save & Persistence** | Offline localStorage | **Functional but lacks schema versioning** | Upgrade to versioned schema (`SALVATION_SAVE_V2`) with corruption recovery and migration. |

---

## 3. Technology Evaluation

1. **Phaser 3.88.2**:
   - *Verdict:* Excellent choice for the 2D world. Runs at solid 60 FPS, handles Arcade physics, tile-based colliders, sprite animations, and camera smoothing.
   - *Clean React Isolation:* Phaser canvas is contained in `PhaserWorldCanvas.jsx`, while React handles modals, HUD, and inventory overlays without polluting per-frame engine loops.
2. **Procedural Layered Canvas Textures**:
   - Eliminates external asset 404s, CORS hurdles, and rigid spritesheet limits.
   - Allows infinite custom character permutations by rendering layers (skin, hair, eyes, tunic, boots, cloak, weapon) dynamically.
3. **Web Audio API (`AudioManager.js`)**:
   - Synthesizes retro-modern sounds (swings, strikes, coins, harvests, leveling) natively with 0 external audio asset dependencies.

---

## 4. Architectural Boundaries

### 4.1 Client Presentation Layer
- React Components (`WorldHUD`, `WorldPage`, `CreateCharacterPage`, `InventoryModal`).
- Phaser Rendering (`WorldScene`, particle emitters, camera transitions, floating text).

### 4.2 Game Simulation & Domain Rules Layer (`src/core/combat/`, `src/core/services/`)
- Deterministic calculation of player damage, enemy stats, AI decisions, XP curves, and loot tables.
- Pure functions independent of Phaser and React, making them 100% unit-testable and ready for future server-authoritative reuse.

### 4.3 Persistence Layer (`src/core/services/saveService.js`)
- Versioned schema (`SALVATION_SAVE_V2`).
- Strict schema validation, automatic migration from legacy saves, export/import JSON, and explicit reset safety.

---

## 5. Implementation Roadmap (Version 1 Polish)

1. **Domain Combat Engine (`src/core/combat/combatEngine.js`)**:
   - Formulas for attack damage, defense mitigation, critical strikes, and weapon scaling.
   - Monster catalogue: Forest Slime, Shadow Wolf, Cavern Skeleton, Goblin Raider.
   - Enemy state machine definitions (Idle, Patrol, Aggro, Chase, Attack, Stagger, Death).
2. **Dynamic Character Combat Animations (`CharacterSpriteGenerator.js`)**:
   - Generate weapon slash frames across 4 directions (South, West, East, North).
3. **Procedural Enemy Textures (`WorldTileGenerator.js`)**:
   - Generate animated pixel spritesheets for Slimes, Skeletons, Wolves, and Goblins.
4. **Phaser 2D Action Combat Integration (`WorldScene.js`)**:
   - Attack input: `Spacebar` or Left Click swings equipped weapon with active hitbox.
   - Enemy spawn and AI loop in combat regions (Whispering Forest & Deepforge Mine).
   - Enemy health bars, floating damage text, knockback physics, death dissolve, and loot drops.
   - Player health bar, damage reactions, invulnerability frames, and homestead respawn.
5. **Versioned Save System & Migration (`saveService.js`)**:
   - Save validation, version tracking, export/import, and backward compatibility.
6. **Automated Vitest Test Suite**:
   - Add unit tests for combat calculations, enemy AI, and save migrations.
