# Salvation — Asset to Gameplay Integration Map

**Document Version:** 1.0.0  
**Map Date:** October 21, 2026  

---

## 1. World & Environment Integration

| Discovered Asset | Game Target | Required Logic & Behavior |
|---|---|---|
| **CraftPix Home Exterior (`exterior.png`)** | Homestead Manor House | Replace procedural rectangle house with authentic gabled cottage sprite; attach collision box to upper walls and configure front door interactive trigger `[E]` to enter `homestead_interior`. |
| **CraftPix Home Interior (`Interior.png`, `walls_floor.png`)** | Cottage Sanctuary | Render authentic wood walls and parquet floor; place bed with sleeping interaction (`restAtInn()` full 100% HP restore), stone fireplace with dynamic warm light emitter, and storage vault chest linked to player inventory. |
| **CraftPix Chimney Smoke (`Smoke_animation.png`)** | Manor Roof & Forge | Register 6-frame looped animation in Phaser; position atop Manor chimney and Blacksmith forge. |
| **CraftPix Dungeon Walls & Floor (`walls_floor.png`)** | Deepforge Caverns | Replace flat stone with authentic cracked stone slab tiles, perimeter subterranean rock walls, and columns. |
| **CraftPix Dungeon Torches (`fire_animation.png`)** | Deepforge Caverns | Register 6-frame animated wall torches with dynamic Phaser point-light flicker sources. |
| **CraftPix Dungeon Chests (`doors_lever_chest_animation.png`)** | Cavern Vaults & Homestead | Animated chest opening frames on `[E]` interact; award dungeon relics and gold. |
| **CraftPix Road Tiles (`Road1.png`)** | West Road & City Highway | Paved cobblestone highway linking Homestead exit to Sunforge City Plaza with natural dirt shoulders. |
| **CraftPix Trees (`Tree1.png`, `Fruit_tree1.png`)** | Whispering Woods & Homestead | High-definition shaded canopy trees with bottom trunk collision boxes allowing player to walk behind canopy with proper depth sorting (`setDepth(y)`). |
| **CraftPix Forge & Workshop (`Forge.png`, `Interior_objects.png`)** | Sunforge Blacksmith & Forge | Render authentic glowing forge kiln, heavy iron anvil, and weapon racks in the city plaza. |

---

## 2. Character, NPCs & Mob Integration

| Discovered Asset | Game Target | Required Logic & Behavior |
|---|---|---|
| **CraftPix Boar Spritesheet (`Boar_Walk`, `Boar_Attack`, `Boar_Death`)** | Wild Boar Enemy in Whispering Woods & West Road | Register 4-direction animations (`boar_walk`, `boar_attack`, `boar_death`); implement patrol, chase on 120px proximity, melee tusk strike with knockback, loot drop (Boar Flank, Beast Hide), and XP reward. |
| **CraftPix Fox Spritesheet (`Fox_walk`, `Fox_Idle`)** | Ambient Forest Wildlife | Non-hostile ambient creature that scurries away when approached; adds life to Whispering Woods. |
| **CraftPix Farm Animals (Sheep, Rooster, Cow)** | Homestead Estate Yard | Register 4-direction animations; add wandering pasture sheep and domestic rooster companion near cottage. |
| **CraftPix Blacksmith Master (`Master_Idle.png`)** | Master Blacksmith NPC in City | Interactive NPC with `[E] Speak with Master Blacksmith` trigger that opens the Artisan Forge modal. |
| **CraftPix Merchant Seller (`Seller.png`)** | Merchant Bazaar NPC in City | Interactive NPC with `[E] Trade with Merchant` trigger that opens the Bazaar shop modal. |

---

## 3. Items, Equipment & Economy Integration

| Discovered Asset | Game Target | Required Logic & Behavior |
|---|---|---|
| **CraftPix Potions (`Icon1.png` - `Icon48.png`)** | Healing Elixirs & Tonics | Map `health-potion` to crimson elixir icon; map greater potions, mana flasks, and antidotes into item definitions (`itemsData.js`); support consumption from hotbar `[1]` and pouch. |
| **CraftPix Heraldry (`Division32_01.png`, etc.)** | Adventurers' Guild Ranks & Contracts | Display faction crests on Guild contracts (Copper, Iron, Silver, Gold, Mithril ranks). |
| **Boar Flank & Beast Hide** | New Gathering & Loot Drops | Added to `itemsData.js`; drops from defeated boars; sellable in Bazaar and used in leathercrafting/cooking contracts. |

---

## 4. Adventurers' Guild Quest Connections

| Contract | Target Category | Integration Hook |
|---|---|---|
| **"Cull the Bristleback Boars"** | Hunting | Increments on `COMBAT_ENEMY_KILLED` where enemy type is `boar_bristleback`; rewards 60g and 75 XP. |
| **"Cavern Torchlighter"** | Exploration | Triggered upon entering Deepforge Caverns and inspecting the ancient dungeon gate; rewards 50g and 50 XP. |
| **"Homestead Sanctuary"** | Orientation | Progressed when player rests in the cottage bed and inspects the storage vault. |
