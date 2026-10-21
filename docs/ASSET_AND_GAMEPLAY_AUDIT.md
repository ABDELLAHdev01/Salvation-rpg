# Salvation — Asset and Gameplay Audit

**Document Version:** 1.0.0  
**Audit Date:** October 21, 2026  
**Auditor:** Salvation Core Architecture Team  
**Repository:** `ABDELLAHdev01/Salvation-rpg`  

---

## 1. Executive Summary & Existing Architecture

**Salvation** is an interactive, browser-based 2D top-down fantasy RPG built with a modern dual-layer architecture:
1. **Phaser 3.88.2 Engine (Canvas / WebGL):** Powers 60 FPS real-time tile rendering, pixel-art camera tracking, depth sorting, Arcade physics, point-and-click / WASD movement, interactive proximity triggers, enemy AI encounters, and ambient effects.
2. **React 18 & Tailwind CSS UI:** Handles HUD overlays, character customization, inventory pouch modals, Adventurers' Guild contract boards, the Artisan Forge, Bazaar shops, fishing mini-games, and save/load persistence.
3. **Decoupled Game Event Bridge (`gameEventBridge.js`):** Acts as the unidirectional event bus synchronizing Phaser world actions (e.g. gathering, mining, combat, resting, zone transitions) with React application state and persistent profile stores (`characterService.js`).

### Important Entry Points
- `src/main.jsx`: Vite application bootstrap and React root mounting.
- `src/App.jsx`: Global router with lazy routes (`/`, `/character`), analytics, and `Toaster` notifications.
- `src/features/world/WorldPage.jsx`: Main gameplay orchestrator containing the top HUD header, fast-travel ribbon, active beginner stepper, and modal controllers.
- `src/core/phaser/PhaserWorldCanvas.jsx`: React host mounting Phaser game canvas, handling viewport resizing, active prompts, and farming plot interactions.
- `src/core/phaser/scenes/WorldScene.js`: Primary 2D game scene managing terrain, props, player movement, enemy AI, combat calculations, day/night lighting, and zone transitions.
- `src/core/phaser/WorldTileGenerator.js`: Procedural canvas fallbacks ensuring all tiles, props, and enemies render cleanly even in offline mode.
- `src/core/phaser/CharacterSpriteGenerator.js`: Dynamic layered 32x32 character spritesheet generator supporting skin tones, hair styles, outfits, tools, and 4-direction animations.

---

## 2. Gameplay Systems Audit: Current Status Matrix

| System | Working Status | Notes & Capabilities | Gaps to Address |
|---|---|---|---|
| **World Navigation** | ✅ Working | Seamless WASD / Arrow / AZERTY keyboard movement + point-and-click pathfinding with obstacle avoidance. Camera follows player with adaptive viewport zoom. | Transition boundaries previously locked camera to 40x30 tiles. Need seamless expansions across all 5 zones. |
| **Zone Architecture** | ✅ Working | 6 distinct zones: Homestead, Homestead Cottage Interior, West Road, Whispering Woods, Deepforge Caverns, Sunforge City Plaza. | Interior rooms need CraftPix pixel-art furniture, walls, floors, and fireplaces replacing procedural shapes. |
| **Homestead Sanctuary** | ✅ Working | Manor House, tilled soil plots with 4-stage farming, fishing pond, well, and interactive cottage front door. | Bed inside cottage restores 100% HP. Can be enhanced with CraftPix interior tileset and furniture. |
| **Combat & Enemies** | ✅ Working | Hostile slimes, wolves, skeletons, goblins, bats, and spiders with real HP bars, damage floating text, attack cooldowns, knockback, and boss encounters. | Mobs previously used procedural canvas sprites; can now use CraftPix animated 4-direction hunt animals (boars, foxes, wolves, deer). |
| **Resource Gathering** | ✅ Working | Mineable Iron, Copper, Gold, and Crystal Geode nodes; tilled soil plots with Turnip, Sunroot, Moonberry, Wheat, and Herb seeds. | Harvest yields update real inventory; need CraftPix natural mining rocks, ore sparkling effects, and trees. |
| **Artisan Forge & Crafting** | ✅ Working | Blacksmith forge with real iron/copper ingot smelting and tool upgrades (Pickaxe, Sword, Broadsword, Hoe). | CraftPix Glassblower/Blacksmith Workshop assets provide authentic forge kilns, anvils, and master blacksmith NPC. |
| **Adventurers' Guild** | ✅ Working | Physical Guild in city plaza with Guildmaster desk, notice board, active contracts (Hunting, Gathering, Mining, Renown rank rewards). | Heraldry constructor assets provide authentic Guild faction banners and crests. |
| **Economy & Bazaar** | ✅ Working | Merchant Bazaar modal for selling gathered items and buying seeds/potions. Currency is tracked in persistent gold balance. | Replace placeholder icons with 48 authentic CraftPix 32x32 magic potion icons. |
| **HUD & Interface** | ✅ Working | Hero vitality plate with live HP bar, tool indicator, day/night world clock, travel ribbon, compact minimap, and beginner tutorial stepper. | CraftPix RPG UI assets provide authentic ornate parchment frames, buttons, and status bars. |
| **Save & Persistence** | ✅ Working | `characterService.js` stores character profiles, inventory, stats, farm plot growth timers, and contracts in `localStorage`. | Add schema versioning and safe legacy defaults for newly integrated items. |

---

## 3. Discovered Asset Collections Summary

All 13 purchased zip packages have been unzipped into `assets_source/`:
1. `craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset`: Cottage exterior, interior walls/floors, beds, tables, chimney smoke animation, doors.
2. `craftpix-net-169442-free-2d-top-down-pixel-dungeon-asset-pack`: Dungeon walls/floors, animated torches/fire, treasure chests, lever doors, floor traps, urns/crates.
3. `craftpix-net-574220-free-path-and-road-top-down-pixel-tileset`: Cobblestone highways, dirt paths, grass-to-road transitions.
4. `craftpix-net-385863-free-top-down-trees-pixel-art`: Top-down oak, pine, birch, fruit trees, fallen logs, and mossy stumps.
5. `craftpix-net-692491-free-glassblowers-workshop-top-down-pixel-art-asset`: Blacksmith forge kiln, master artisan NPC, merchant seller NPC, workshop counters, anvils.
6. `craftpix-net-128598-free-magic-potions-pixel-art-icons`: 48 transparent 32x32 pixel-art potion icons (Healing, Mana, Stamina, Speed, Elixirs).
7. `craftpix-net-255216-free-basic-pixel-art-ui-for-rpg`: Pixel-art UI frames, inventory slots, action panels, button states.
8. `craftpix-net-789196-free-top-down-hunt-animals-pixel-sprite-pack`: 4-direction animated wild beasts (Boar, Fox, Deer, Hare, Black Grouse) with Idle, Walk, Run, Hurt, Attack, Death.
9. `craftpix-net-291971-free-top-down-animals-farm-pixel-art-sprites`: 4-direction animated domestic animals (Bull, Cow, Calf, Sheep, Lamb, Rooster, Hen, Piglet).
10. `craftpix-net-351300-free-island-adventure-pixel-top-down-minigame-kit`: 4 animated player characters with sword, shield, walk, attack, hurt, death.
11. `craftpix-net-419402-free-base-4-direction-female-character-pixel-art`: 4-direction female character with sword, walk, run, idle, attack, death.
12. `craftpix-net-716070-free-heraldry-constructor-pixel-art`: 575 heraldry crests, shields, and emblems for Guild ranks and contracts.
13. `nature_pixels_extracted`: High-definition nature props, houses, fences, street lamps, signposts, water animations.

---

## 4. High-Impact Risks & Architectural Considerations

1. **Pixel Consistency & Tile Sizes:**
   - The discovered CraftPix tilesets are designed on a 16x16 pixel grid.
   - The game currently renders 32x32 tiles (or 16x16 scaled 2x).
   - Solution: To maintain razor-sharp pixel art, we process extracted sprites using nearest-neighbor scaling (2x) to cleanly match our 32x32 grid, or render them with their native 16x16 proportions using Phaser's pixelArt camera zoom.
2. **Asset Loading vs. Offline Fallback:**
   - Preloading all external PNG assets in Phaser's `preload()` while maintaining `WorldTileGenerator.js` as an automatic fallback ensures the game never crashes if an asset file is unavailable.
3. **Save Compatibility:**
   - Any new inventory items (e.g. specific CraftPix potion types, animal pelt drops, dungeon relics) must have safe defaults so existing profiles in `localStorage` do not break.

---

## 5. Prioritized Implementation Roadmap

1. **Pipeline & Manifest (Phase 4):**
   - Centralize asset manifest and build asset extraction pipeline to populate `public/assets/...` with optimized PNG sprites and tiles.
2. **Homestead & Cottage Interior (Phase 5):**
   - Integrate CraftPix Main Character's Home assets for the exterior Manor and cozy interior (floors, walls, bed, fireplace, storage).
3. **Deepforge Caverns Dungeon (Phase 5):**
   - Integrate CraftPix Dungeon assets for cavern walls, stone floors, animated fire torches, and treasure chests.
4. **Wildlife & Monsters (Phase 6):**
   - Integrate animated 4-direction wild boars and foxes into Whispering Woods and West Road.
   - Add farm animals (sheep, roosters, cows) to Homestead pastures.
5. **Potions & Inventory Economy (Phase 6 & 8):**
   - Integrate the 48 CraftPix magic potion icons into item definitions, inventory, and quick-slot heal actions.
6. **Town & Blacksmith Workshop (Phase 6):**
   - Integrate Glassblower/Forge workshop assets into Sunforge City Plaza with animated blacksmith NPC.
7. **Guild & Contracts (Phase 7):**
   - Connect animal hunting, cavern exploration, and potion crafting to Adventurers' Guild contracts.
8. **Automated Testing & Browser CDP Verification (Phase 11):**
   - Run Vitest test suite and real browser headless checks to ensure zero exceptions and flawless gameplay.
