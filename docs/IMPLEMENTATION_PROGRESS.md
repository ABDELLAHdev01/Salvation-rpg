# Salvation — Implementation Progress & Verification Backlog

**Document Version:** 2.0.0  
**Status:** Release Candidate Verified (RC-1)  
**Last Updated:** October 22, 2026  

---

## 1. System Implementation Checklist

| Gameplay System | Subsystems / Features | Authoritative Source | Verification Status | Test Coverage |
| :--- | :--- | :--- | :--- | :--- |
| **Tutorial Haven** | Dedicated Tutorial Island (`tutorial_island`), spawn point, Elder NPC, castaway supply chest, sloop departure, one-way progression | `WorldScene.js`, `WorldPage.jsx` | Verified via Headless Edge & Playwright | `progression.spec.js` |
| **World Navigation** | Seamless transition between Homestead, West Road, Sunforge City, Whispering Forest, Deep Caverns | `WorldScene.js`, `gameEventBridge.js` | Verified | `interactions.spec.js`, `progression.spec.js`, `worldScene.test.js` |
| **Terrain & Biomes** | Natural borderless olive-meadow stippling, cobblestone King's Highway, dungeon stone slabs, sandy beach, arched stone river bridge | `WorldTileGenerator.js`, `WorldScene.js` | Verified | Zone Screenshot Audit |
| **Player Housing** | Manor Cottage interior (23x13), parquet floors, restorative bed (100% HP heal), hearth fireplace, laboratory | `WorldScene.js`, `homesteadInteriorProps` | Verified | `interactions.spec.js`, `homesteadInteriorAndTutorial.test.js` |
| **Farm Pasture & Livestock** | Autonomous farm livestock (Bull, Lamb, Sheep, Piglet, Chick, Rooster) with roaming AI and resource gathering (wool, eggs, truffles, feathers) | `WorldScene.js`, `spawnAmbientCreature` | Verified | `homestead.png` inspection, E2E |
| **Deep Caverns & Mining** | Cavern stone tunnels, wall torches, glowing crystal geodes, amethyst spikes, jagged stalagmites, interactive mining nodes | `WorldScene.js`, `buildMineProps` | Verified | `mine.png` inspection, `mining.test.js` |
| **Combat Engine** | Real-time hitboxes, monster AI states, floating combat text, boss encounters (Slime King Colossus) | `WorldScene.js`, `combatService.js` | Verified | `combatEngine.test.js`, `combat.test.js` |
| **Player Companion** | Follower sheepdog companion, dynamic position interpolation, petting interaction | `WorldScene.js`, `petService.js` | Verified | `movement.spec.js` |
| **Resource Gathering** | Mining veins (Iron, Copper, Gold, Crystal Geodes), farming plots, gathering nodes | `WorldScene.js`, `miningService.js` | Verified | `mining.test.js`, `farming.test.js` |
| **Crafting & Economy** | Artisan forge crafting, merchant trade, currency balance | `workshopService.js`, `economyService.js` | Verified | `workshop.test.js`, `economy.test.js` |
| **Quests & Guild** | Adventurers' Guild contracts, warden tutorial stepper, objective tracking | `guildContractService.js`, `BeginnerTutorialStepper.jsx` | Verified | `guildContracts.test.js` |
| **Persistence & Save** | LocalStorage state, save schema migration, profile tracking | `saveService.js` | Verified | `saveSystem.test.js`, `saveMigrationV3.test.js` |

---

## 2. Browser Automation & Quality Assurance Matrix

- **Unit & Integration Suite (Vitest)**:
  - 20 test files, **168 passed (100%)**, execution time ~600ms.
  - Dedicated configuration in `vitest.config.js` isolating unit tests from browser e2e.
- **End-to-End Browser Automation (Playwright)**:
  - Persistent test runner configured in `playwright.config.js` with Microsoft Edge engine.
  - 7 end-to-end scenarios tested across 4 test specs:
    1. `tests/e2e/launch.spec.js`: Canvas mount, Phaser engine boot, WorldScene activation, console error check.
    2. `tests/e2e/movement.spec.js`: Pathfinding and coordinate updates, boundary checks, follower pet tracking.
    3. `tests/e2e/interactions.spec.js`: Cottage door interaction & zone transition, restorative bed healing.
    4. `tests/e2e/progression.spec.js`: Tutorial Island initial spawn, departure sloop voyage to mainland Homestead, one-way isolation guarantee, and cross-zone open world progression.
  - Result: **7 / 7 passed (100%)** in 19.0s.

---

## 3. Visual Regression Audit

Screenshots captured and visually inspected at 1280x800 resolution (`screenshots/`):
- `tutorial_island.png`: Authentic island shore, Elder Shaman NPC, palm trees, departure sloop, campfire light.
- `homestead.png`: Manor cottage exterior, seamless olive meadow, stone terrace, cobblestone paths.
- `homestead_interior.png`: Expansive 3-wing manor hall, warm oak parquet planks, dining table, fireplace, bed, alchemy station; zero black background void.
- `west_road.png`: Continuous cobblestone highway spanning full map width, river bridge with railings, roadside wildlife.
- `village.png`: Sunforge City plaza, stone paving, market stall, town houses, fountain.
- `forest.png`: Enchanted clearing, ancient CraftPix trees, toadstool mushrooms, wildflower clusters, slime king boss.
- `mine.png`: Cavern stone floor, glowing wall braziers, mineral nodes, cavern monsters.
