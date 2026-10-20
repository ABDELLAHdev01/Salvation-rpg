# Salvation RPG - Asset Manifest & Provenance Registry

## Overview

This manifest documents the production-ready 2D pixel-art assets, audio, and visual components integrated into **Salvation RPG**. All external assets have been vetted for legal compliance, commercial usability, and architectural coherence under **CC0 1.0 Universal (Public Domain)** and custom authored generators.

---

## 1. Environment & Tilesets

| Asset Key | File Path | Source / Author | License | Dimensions | Usage |
|---|---|---|---|---|---|
| `tile_grass` | `/assets/tilesets/tile_grass.png` | Salvation Studio / Kenney CC0 Base | CC0 1.0 Universal | 32×32 px | Homestead & forest terrain |
| `tile_path` | `/assets/tilesets/tile_path.png` | Salvation Studio / Kenney CC0 Base | CC0 1.0 Universal | 32×32 px | Cobblestone roads & dirt pathways |
| `tile_stone` | `/assets/tilesets/tile_stone.png` | Salvation Studio / Kenney CC0 Base | CC0 1.0 Universal | 32×32 px | Subterranean cavern stone floor |
| `tile_soil` | `/assets/tilesets/tile_soil.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Tilled farm soil plots |
| `tile_water` | `/assets/tilesets/tile_water.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Shimmering pond & river tiles |
| `prop_house` | `/assets/tilesets/prop_house.png` | Salvation Studio / Kenney RPG | CC0 1.0 Universal | 96×80 px | Gabled timber manor house |
| `prop_tree` | `/assets/tilesets/prop_tree.png` | Salvation Studio / Kenney RPG | CC0 1.0 Universal | 48×64 px | Layered pine trees with cast shadow |
| `prop_chest` | `/assets/tilesets/prop_chest.png` | Salvation Studio / Kenney Roguelike | CC0 1.0 Universal | 32×32 px | Vault storage chest |
| `prop_workbench` | `/assets/tilesets/prop_workbench.png` | Salvation Studio / Kenney Indoor | CC0 1.0 Universal | 32×32 px | Blacksmith anvil & craft workbench |

---

## 2. Mining Ores & Farming Crops

| Asset Key | File Path | Source / Author | License | Dimensions | Usage |
|---|---|---|---|---|---|
| `ore_iron` | `/assets/tilesets/ore_iron.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Granite iron ore vein |
| `ore_copper` | `/assets/tilesets/ore_copper.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Bronze copper ore vein |
| `ore_gold` | `/assets/tilesets/ore_gold.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Glistening golden lode |
| `ore_crystal` | `/assets/tilesets/ore_crystal.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Amethyst cavern geode |
| `crop_turnip_1..4` | `/assets/tilesets/crop_turnip_{s}.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | 4-stage turnip growth |
| `crop_wheat_1..4` | `/assets/tilesets/crop_wheat_{s}.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | 4-stage wheat growth |
| `crop_herb_1..4` | `/assets/tilesets/crop_herb_{s}.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | 4-stage sylvan herb growth |
| `crop_moonberry_1..4` | `/assets/tilesets/crop_moonberry_{s}.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | 4-stage moonberry growth |
| `crop_sunroot_1..4` | `/assets/tilesets/crop_sunroot_{s}.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | 4-stage sunroot growth |

---

## 3. Hostile Enemies & Animations

| Asset Key | File Path | Source / Author | License | Spritesheet Size | Frame Size & Animations |
|---|---|---|---|---|---|
| `enemy_slime` | `/assets/enemies/enemy_slime.png` | Salvation Studio | CC0 1.0 Universal | 128×32 px | 4 frames (32×32): Bounce & Squash |
| `enemy_wolf` | `/assets/enemies/enemy_wolf.png` | Salvation Studio | CC0 1.0 Universal | 128×32 px | 4 frames (32×32): Stalking Stride |
| `enemy_skeleton` | `/assets/enemies/enemy_skeleton.png` | Salvation Studio | CC0 1.0 Universal | 128×32 px | 4 frames (32×32): Guard & March |
| `enemy_goblin` | `/assets/enemies/enemy_goblin.png` | Salvation Studio | CC0 1.0 Universal | 128×32 px | 4 frames (32×32): Creep & Lunge |

---

## 4. Visual Combat FX & Atmosphere

| Asset Key | File Path | Source / Author | License | Dimensions | Usage |
|---|---|---|---|---|---|
| `fx_slash` | `/assets/fx/slash_01.png` | Kenney Particle Pack | CC0 1.0 Universal | 512×512 (Scaled) | Melee weapon attack arc trails |
| `fx_spark` | `/assets/fx/spark_01.png` | Kenney Particle Pack | CC0 1.0 Universal | 512×512 (Scaled) | Combat impact sparks & mining chips |
| `fx_magic` | `/assets/fx/magic_01.png` | Kenney Particle Pack | CC0 1.0 Universal | 512×512 (Scaled) | Arcane wand flares & shrine blessings |
| `fx_smoke` | `/assets/fx/smoke_01.png` | Kenney Particle Pack | CC0 1.0 Universal | 512×512 (Scaled) | Chimney smoke & enemy defeat dissolution |
| `fx_flame` | `/assets/fx/flame_01.png` | Kenney Particle Pack | CC0 1.0 Universal | 512×512 (Scaled) | Cavern torches & forge embers |

---

## 5. Item Icons (Pouch, Workshop & Bazaar)

| Item Key | File Path | Source / Author | License | Dimensions | Description |
|---|---|---|---|---|---|
| `health-potion` | `/assets/items/item_health_potion.png` | Salvation Studio / Kenney | CC0 1.0 Universal | 32×32 px | Corked flask with crimson elixir |
| `mana-potion` | `/assets/items/item_mana_potion.png` | Salvation Studio / Kenney | CC0 1.0 Universal | 32×32 px | Flask with glowing azure elixir |
| `iron`, `copper`, `gold` | `/assets/items/item_{metal}_ore.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Chiseled raw ore chunks |
| `iron-bar`, `copper-bar`, `gold-bar` | `/assets/items/item_{metal}_bar.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Polished cast metal ingots |
| `steel_broadsword` | `/assets/items/item_sword.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Tempered steel sword with gold hilt |
| `iron_pickaxe` | `/assets/items/item_pickaxe.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Forged mining pickaxe |
| `forged_scythe` | `/assets/items/item_scythe.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Curved farmer harvesting scythe |
| `oak_staff` | `/assets/items/item_wand.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Twisted oak wand with mana crystal |
| `turnip`, `wheat`, `herb`, `moonberry`, `sunroot` | `/assets/items/item_{crop}.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Harvested agricultural produce |
| `seed-*` | `/assets/items/item_seed_pouch.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Burlap seed bag with green sprout |
| `slime-gel`, `wolf-pelt`, `bone-shard` | `/assets/items/item_{drop}.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Monster hunting trophies |
| `gold-coin` | `/assets/items/item_gold_coin.png` | Salvation Studio | CC0 1.0 Universal | 32×32 px | Stamped imperial gold coin |
