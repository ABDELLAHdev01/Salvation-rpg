# Salvation — Game Evolution & Architectural Log

**Project:** Salvation Fantasy RPG  
**Author / Team:** Senior Game-Development & Systems Architecture Team  
**Log Date:** October 2026  

---

## Evolution Milestones

### Milestone 1: Core Exploration & Architecture Deep Scan
- **Observation:** Original project had procedural placeholder canvases with high-contrast borders and disconnected scene transitions.
- **Action:** Audited scene lifecycle, event bridge architecture, and authoritative state models.
- **Outcome:** Decoupled React HUD overlays from Phaser 2D world loop via `gameEventBridge.js`.

### Milestone 2: Purchased Asset Discovery & Pipeline Integration
- **Source Material:** Discovered purchased asset zip archives in `C:\Users\abdel\OneDrive\Desktop\New folder`.
- **Integrated Packs:**
  - `craftpix-net-385863-free-top-down-trees-pixel-art`: Oak, Pine, Autumn, Mossy, and Palm trees.
  - `craftpix-net-351300-free-island-adventure-pixel-top-down-minigame-kit`: Sand beach autotiles, animated ocean foam, Elder Shaman NPC.
  - `craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset`: Cottage exterior and authentic interior furniture.
  - `craftpix-net-692491-free-glassblowers-workshop-top-down-pixel-art-asset`: Parquet wood plank flooring, alchemy workshop table.
  - `craftpix-net-169442-free-2d-top-down-pixel-dungeon-asset-pack`: Stone braziers, stone dungeon slabs, urns, supply chests.
  - `craftpix-net-574220-free-path-and-road-top-down-pixel-tileset`: Authentic cobblestone paths and junctions.

### Milestone 3: Dedicated Tutorial Island ("Isle of Beginnings")
- **Player Journey:** First-time players spawn on an isolated haven surrounded by waves.
- **Narrative & Guidance:** Elder Eldon instructs the Warden on basic mechanics. The Castaway Supply Chest provides starting dagger and potions.
- **One-Way Sea Voyage:** A custom departure sloop awaits at the south pier. Boarding the sloop sails the player to Homestead mainland. The tutorial is permanently marked complete and there is no road connecting back.

### Milestone 4: Terrain Refinement & Seamless Grass
- **Problem:** Previous tiles featured dark 32x32 borders that made terrain look like a patchwork of cubes.
- **Solution:** Extracted pure `#9db837` olive-meadow base from CraftPix maps and established an organic 4-variant stippling algorithm (`tile_grass`, `tile_grass_flowers`, `tile_grass_clovers`, `tile_grass_pebbles`). Eliminates all visible grid seams.

### Milestone 5: Cottage Interior Overhaul (`homestead_interior`)
- **Problem:** Small 15x11 room left large black voids on standard 16:9 displays.
- **Solution:** Expanded room to a 23x13 3-wing manor hall (West Bedroom Suite, Center Hearth Hall, East Alchemy & Dining Studio). Calibrated camera bounds and zoom (1.74) for edge-to-edge room coverage.
- **Gameplay Linkage:** Rest in bed restores 100% player HP with flash effect and sound cues.

### Milestone 6: Automated Testing & Browser Verification
- **Playwright Automation:** Established repeatable e2e browser test suite targeting Microsoft Edge (`test:e2e`).
- **Vitest Unit Suite:** Isolated and running 168 tests across 20 test files with 100% pass rate.
- **Production Build:** Vite production build generates optimized chunks, gzip, and brotli assets with zero errors.

### Milestone 7: Highway Bridge, Farm Livestock & Cavern Geology Integration
- **Stone Highway Bridge (`west_road`):**
  - Integrated authentic CraftPix Arched Stone Bridge (`craftpix-net-668008`) spanning the natural river crossing at columns 23..26 and rows 13..15.
  - Symmetrical 112x96 composite featuring arched stonework, pillars in the flowing water, and upper balustrades (`prop_stone_bridge_rail`) rendering in front of the player.
  - Continuous stream water rendering under the bridge with water ripple effects and active fishing spot.
- **Expanded Farm Livestock Pasture (`homestead`):**
  - Integrated CraftPix farm livestock pack (`craftpix-net-291971`): Farm Bull (`bull_walk`), Playful Piglet (`piglet_walk`), Gentle Lamb (`lamb_walk`), Chirping Chick (`chick_walk`), Sheep (`sheep_walk`), and Rooster (`rooster_walk`).
  - Added autonomous wandering loops inside the fenced paddock and resource interactions (gathering wool, eggs, truffle spores, feathers, and heavy leather).
- **Cavern Crystals, Stalagmites & Ore Nodes (`mine`):**
  - Extracted authentic rocks, crystals, and jagged stalagmites from `craftpix-net-974061` into `public/assets/props/rocks/`.
  - Added harvestable Azure Crystal Clusters, Amethyst Geodes, and Rich Ore Outcroppings with interactive mining feedback and inventory loot.
- **Magic Potions Expansion:**
  - Extracted 6 authentic transparent pixel art potion icons from `craftpix-net-128598` into `public/assets/icons/`.
- **E2E Test Coverage Expansion:**
  - Added cross-zone navigation verification in `tests/e2e/progression.spec.js`, bringing the Playwright E2E suite to **7 / 7 passed (100%)**.

### Milestone 8: Initial Movement Architecture, Input Auto-focus & Release Candidate
- **Problem:** Upon launching a fresh session or creating a character, players experienced inability to walk:
  1. Texture rebuild on mount (`player:refresh_customization`) tore down textures while Phaser animations still referenced active frames, causing an uncaught `TypeError: Cannot read properties of null (reading 'sourceSize')` in Phaser's animation manager, freezing updates.
  2. Canvas focus: On initial navigation from character creation, active DOM focus remained on the creation button or document body, dropping initial WASD / arrow keystrokes until canvas was clicked.
  3. Click dead-zone: Interactive object click radius was coupled to proximity radius (50-55px), interpreting open sand ground clicks near Elder Eldon or campfire as NPC clicks and suppressing pathfinding.
  4. Arcade physics body safety: `update()` did not null-check `this.player.body`, which could throw `setVelocity` if physics bodies refreshed during scene lifecycle.
- **Solution:**
  1. Animation Lifecycle Decoupling: In `WorldScene.setupPlayerTexture()`, animation state is cleanly stopped and existing animation keys removed prior to texture destruction and safely rebound afterwards.
  2. Canvas Focus Bridge: Configured `PhaserWorldCanvas.jsx` to auto-focus `game.canvas` on `ready` and added a global keydown bridge for movement hotkeys (`KeyW`, `KeyA`, `KeyS`, `KeyD`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Space`) when not typing in form inputs.
  3. Interactive Click Radius Decoupling: Decoupled `clickRadius` (default 24px) from proximity prompt radius (`radius`), allowing free click-to-move across open ground around NPCs and props.
  4. Tutorial Island Spawn Optimization: Adjusted player initial spawn to `(410, 520)` facing west on open sand. Adjusted island training slime `aggroRange` to 65px with gentle trial damage so exploring and harvesting does not trigger surprise combat.
  5. Isolated Departure Enforcement: Disallowed premature `Return Home` on tutorial island, requiring departure via the pier sloop. Once departed, the tutorial island remains strictly isolated with no return roads.
- **Verification:**
  - 100% Vitest unit test suite passing: **168 / 168 tests across 20 files**.
  - 100% Playwright E2E browser automation suite passing: **8 / 8 tests across 5 spec files**.
  - Production build cleanly compiling with zero errors.
