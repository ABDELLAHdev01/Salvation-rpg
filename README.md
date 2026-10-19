# Salvation - 2D Fantasy Action RPG & Homestead Simulator

*Salvation* is a playable, offline-first 2D pixel-art fantasy action RPG and cozy management simulation built with React 19, Vite 6, and Phaser 3. Players customize their hero, explore a living top-down pixel world, farm crops, mine ore nodes, and engage in real-time action combat against forest and cavern monsters.

---

## Key Gameplay Features

### 1. Living 2D Top-Down World (`/world`)
- **Phaser 3 Game Canvas:** Tile-based terrain with paths, trees, water, stone, and animated flora.
- **Dynamic Zones:**
  - **Homestead:** Interactive farm plots, player cabin, well, and safe respawn point.
  - **Whispering Woods:** Hostile wilderness inhabited by Emerald Slimes and Shadowfang Stalkers.
  - **Deep Caverns:** Underground mine filled with Deepforge Skeletons and Goblin Raiders.
  - **Sunforge Village:** Market square, smithy, and training grounds.
- **Interactive Gathering:** Click directly on soil plots to plant or harvest crops, or strike glowing cavern nodes to mine ores with animated floating yields.

### 2. Real-Time Action Combat
- **Melee Attack Pipeline:** Press `[Space]` or Left-Click to swing your equipped weapon with 4-directional slash trails and weapon arcs.
- **Weapon System:**
  - *Forged Iron Pickaxe*: Rapid swings, fast cooldown.
  - *Farmer Harvest Scythe*: Wide 120° swing arc, high knockback.
  - *Tempered Broadsword*: High damage and critical strike potential.
  - *Elder Oak Wand*: Extended attack reach and magic damage.
- **Monster Catalogue & State Machines:**
  - *Emerald Slime* (Forest): Aggro, bounce pursuit, slime gel drops.
  - *Shadowfang Stalker* (Forest): High-speed predator, wolf pelt drops.
  - *Deepforge Skeleton* (Mine): Armored undead, iron & bone shard drops.
  - *Wildlands Goblin Raider* (Mine): Quick strikes, copper & contract sigils.
- **Player Health & Survival:**
  - 100 HP health gauge with hit i-frames (650ms), camera shake, and floating damage numbers.
  - Quick Elixir Healing: Press `[Q]` to drink a health potion and recover 35 HP instantly.
  - Defeat & Respawn: Fadeout on death with peaceful respawn at the Homestead cabin.

### 3. 10-Category Character Creator & Wardrobe (`/create-character`, `/edit-character`)
- Customization categories: Skin tone, Hair style, Hair color, Eye expression, Outfit type, Outfit color, Headwear, Accessories, Equipped tool, and Class archetype.
- Live 4-direction procedural pixel-art spritesheet generator rendered on a 128x320 canvas with walk cycles and 4-directional attack animations.

### 4. Economy & Progression
- Full inventory management, gold tracking, gear crafting at the workshop, colosseum arena battles, guild milestones, and housing upgrades.
- Real-time event bridge connecting Phaser 3 canvas simulation directly with React UI state.

### 5. Versioned Persistence (`schemaVersion: 2`)
- Automatic backward-compatible migration for legacy saves.
- Data integrity validation with stat bounds and sanitization.
- Portable JSON save export and import.
- Safeguarded character reset with automatic backup recovery (`CONFIRM_RESET`).

---

## Controls & Hotkeys

| Action | Key / Control |
|---|---|
| **Move Up / Down / Left / Right** | `W` / `A` / `S` / `D` or Arrow Keys |
| **Attack / Primary Tool** | `Space` or Left Click |
| **Quick Heal (Potion)** | `Q` |
| **Sprint** | `Shift` (Hold) |
| **Interact / Harvest / Mine** | Left Click on World Object |

---

## Architectural Documentation

Deep engineering specifications and future evolution roadmaps are available in the repository:

- [`docs/AUDIT_AND_ARCHITECTURE.md`](docs/AUDIT_AND_ARCHITECTURE.md): Complete repository audit, domain boundaries, rendering pipeline, and technical evaluation.
- [`docs/ONLINE_V2_ARCHITECTURE.md`](docs/ONLINE_V2_ARCHITECTURE.md): Version 2 multiplayer roadmap detailing server-authoritative tick rate, WebSocket protocol, room sharding, PostgreSQL schema, client reconciliation, and 5-phase migration plan.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

### Running Quality & Unit Tests
```bash
# Run Vitest test suite (125 tests across 15 suites)
npm test

# Run ESLint validation (0 errors, 0 warnings enforced)
npm run lint

# Compile production bundle with gzip and brotli compression
npm run build
```

---

## Tech Stack

- **Game Engine & Rendering:** Phaser 3.88 + Procedural HTML5 Canvas Spritesheets
- **Frontend Framework:** React 19 + React Router 7
- **Styling & UI:** Tailwind CSS v4 + Lucide React Icons
- **Bundler:** Vite 6 + Compression plugins (gzip, brotli)
- **Testing:** Vitest + Testing Library
- **Linting:** ESLint 9 + Prettier rules
