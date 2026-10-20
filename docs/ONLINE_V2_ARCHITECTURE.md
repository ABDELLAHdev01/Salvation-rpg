# Salvation Version 2: Online Multiplayer Architecture & Migration Roadmap
**Document Status:** Architecture Specification | **Scope:** Future Online PvE/PvP Evolution

---

## 1. System Vision

When transitioning from the current offline-first single-player game to **Version 2 Online**, Salvation will evolve into a shared 2D fantasy multiplayer browser RPG. The architecture preserves the client rendering and UI developed in Version 1 while moving authoritative simulation, combat validation, persistence, and inventory mutations to a dedicated game server cluster.

---

## 2. Client vs. Server Authoritative Separation

```
┌──────────────────────────────────────────────┐        ┌──────────────────────────────────────────────┐
│             GAME CLIENT (Browser)            │        │           AUTHORITATIVE GAME SERVER          │
│                                              │        │                                              │
│  - Phaser 3 Renderer (60 FPS)                │        │  - Simulation Tick Loop (20 - 30 Hz)         │
│  - Client-side Movement Prediction           │        │  - Player Input & Movement Validation        │
│  - Local Animation & Camera Following        │ WS /   │  - Server-Authoritative Combat & Hitbox Math │
│  - Audio Synthesis (AudioManager)            │ Web-   │  - Enemy AI State Machines & Aggro Targets   │
│  - React UI (WorldHUD, Modals, Creator)      │ trans- │  - Loot Table & RNG Roll Authority           │
│  - Entity Interpolation for Remote Players   │ port   │  - Inventory Delta Verification              │
│  - Audio & Visual Hit Sparks / Damage Floats │◀──────▶│  - PostgreSQL Database Persistence           │
└──────────────────────────────────────────────┘        └──────────────────────────────────────────────┘
```

### 2.1 The Cardinal Rule of Online Multiplayer
**The browser client must never be trusted.**
- Client sends *Intents* (e.g., `MOVE_INTENT(dx, dy)`, `ATTACK_INTENT(weaponId, angle)`, `USE_ITEM(slot)`).
- The Server simulates the world, validates constraints (speed limits, wall colliders, weapon cooldowns, line-of-sight), resolves damage, updates monster HP, and broadcasts delta states.
- The Client renders immediate local prediction for responsive responsiveness, and reconciles against authoritative server updates.

---

## 3. Network Transport & Regional Sharding

### 3.1 Protocol Stack
- **Primary Transport:** Secure WebSockets (`wss://`) or WebTransport (HTTP/3 UDP datagrams) for low-latency bidirectional game state synchronization.
- **REST / GraphQL API:** Standard HTTPS endpoints for authentication, character creation, account management, and leaderboards.

### 3.2 Zone & Sharded Instance Topology
The game world is partitioned into regional shards and private sanctuary instances:
- `zone:homestead:<userId>` - Private instanced personal sanctuary. Houses persistent farm plots, private vault storage, workbench forge, and left road exit.
- `zone:west_road:<shardId>` - Public open-world transit artery (The King's Highway) linking Homestead and Sunforge City (capacity: 40 players).
- `zone:village:<shardId>` - Sunforge City central social hub: The Adventurers' Guild, Blacksmith Elric, Market Bazaar, and The Hearth & Pint Inn (capacity: 60-80 players).
- `zone:forest:<shardId>` - Whispering Woods open wilderness with roaming monsters, Sylvan Runic Shrine, and gatherable herbs.
- `zone:mine:<shardId>` - Deepforge Caverns shared dungeon delve with mineral seams, Skeleton guards, and Goblin raiders.
- `zone:arena:<duelId>` - Dedicated low-latency PvP combat arena.

---

## 4. Entity Replication, Combat & Fast-Travel Synchronization

### 4.1 Server Tick Rate & Delta Compression
- **Server Tick:** 20 Hz (every 50ms) or 30 Hz (every 33.3ms).
- At each tick, the server computes movement deltas, enemy AI state changes, active attack hitboxes, and broadcasts compressed binary delta packets (e.g. via MessagePack or Protobuf).

### 4.2 Client-Side Prediction & Reconciliation
- The local player moves instantly on client input.
- The server responds with acknowledged position sequence numbers. If client prediction diverges from the server beyond a small threshold, the client smoothly interpolates toward the authoritative position.
- Remote players and monsters are rendered using linear interpolation (interp buffer of 80-100ms) to ensure smooth animations even under packet jitter.

### 4.3 Combat Hit Registration & Attack Commitments
- When the player executes `ATTACK_INTENT`:
  1. Client plays weapon swing animation and predictive slash arc with direction-locked momentum.
  2. Server checks attack cooldown, verifies player position, constructs the weapon hitbox arc at the specified timestamp, and tests intersection against enemy/player colliders.
  3. Server applies damage, calculates armor reduction and critical hits, updates HP, and broadcasts `COMBAT_HIT` and `ENTITY_DIED` packets.

### 4.4 Return Home Fast-Travel & Boundary Traversal Safety
- **Return Home Recall [H]:**
  - Player requests `RECALL_HOME_INTENT`.
  - Server verifies that player is not in combat (`last_damage_taken_at + 8000ms < now`), not staggering, and not under active crowd control.
  - Server initiates a 3-second channel with particle telegraphed FX. Taking damage or moving cancels the channel.
  - On channel completion, player is transferred into their private `zone:homestead:<userId>` instance at `(spawnX: 480, spawnY: 448)` front porch coordinates.
- **Seamless Walking Traversal:**
  - When crossing physical zone gates (e.g., Homestead West Road Gate `x <= 16`), client sends `ZONE_TRANSITION_INTENT(nextZone, boundaryCoordinates)`.
  - Server validates proximity to the physical portal, gracefully unsubscribes player from the current room channel, and subscribes them to the target shard without game reload.

---

## 5. The Adventurers' Guild & Anti-Cheat Economic Integrity

### 5.1 Idempotent Single-Claim Contract Lifecycle
To prevent duplication exploits, infinite-money bugs, and race conditions:
1. **Contract Acceptance:** `ACCEPT_CONTRACT(contractId)` creates a database row in `character_contracts` with status `ACTIVE`. A character cannot accept rank-gated contracts without matching `renown` requirements.
2. **Authoritative Objective Recording:** Game events (monster deaths, ore shatters, crop harvests, zone discoveries) are verified on the server tick loop and increment objective counters atomically in the database.
3. **Reward Turn-In Transaction:** When claiming rewards at Guild Warden Michelle:
   - Server runs a serializable ACID database transaction:
     ```sql
     BEGIN TRANSACTION;
     SELECT status FROM character_contracts WHERE character_id = $1 AND contract_id = $2 FOR UPDATE;
     -- Verify status is 'READY_FOR_TURNIN'
     UPDATE character_contracts SET status = 'COMPLETED', completed_at = NOW() WHERE character_id = $1 AND contract_id = $2;
     UPDATE characters SET gold = gold + $3, xp = xp + $4, renown = renown + $5 WHERE id = $1;
     INSERT INTO character_inventories (character_id, item_id, quantity) VALUES ... ON CONFLICT DO UPDATE;
     COMMIT;
     ```
   - Replay attempts immediately return `409 Conflict: Contract already completed`.

### 5.2 Co-op Party Bounties & Global Renown Leaderboards
- When in a party, objective progress (e.g. culling slimes or wolves) is credited to all party members within 800px radius of the encounter.
- Real-time Redis sorted sets (`ZADD guild_renown_leaderboard <renown> <characterId>`) power realm-wide Adventurers' Guild leaderboards.

---

## 6. Persistence & PostgreSQL Database Schema

```sql
-- Core User Account
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Persistent Character Profile (Schema v3 Mapped)
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(32) UNIQUE NOT NULL,
    race VARCHAR(20) NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    level INT DEFAULT 1,
    xp BIGINT DEFAULT 0,
    gold BIGINT DEFAULT 350,
    renown INT DEFAULT 0,
    current_zone VARCHAR(32) DEFAULT 'homestead',
    home_position JSONB DEFAULT '{"zone":"homestead","x":480,"y":448}',
    discovered_regions TEXT[] DEFAULT ARRAY['homestead'],
    customization JSONB NOT NULL,
    stats JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Server-Authoritative Inventory
CREATE TABLE character_inventories (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    PRIMARY KEY (character_id, item_id)
);

-- Adventurers' Guild Active & Completed Contracts
CREATE TABLE character_contracts (
    id SERIAL PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    contract_id VARCHAR(64) NOT NULL,
    status VARCHAR(24) NOT NULL CHECK (status IN ('ACTIVE', 'READY_FOR_TURNIN', 'COMPLETED')),
    objectives_progress JSONB NOT NULL DEFAULT '[]',
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE (character_id, contract_id)
);

-- Farm Plot Timestamps & States
CREATE TABLE farm_plots (
    id SERIAL PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    plot_index INT NOT NULL,
    crop_id VARCHAR(32),
    planted_at TIMESTAMPTZ,
    UNIQUE (character_id, plot_index)
);
```
CREATE TABLE character_inventories (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    item_id VARCHAR(64) NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    PRIMARY KEY (character_id, item_id)
);

-- Farm Plot Timestamps & States
CREATE TABLE farm_plots (
    id SERIAL PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    plot_index INT NOT NULL,
    crop_id VARCHAR(32),
    planted_at TIMESTAMPTZ,
    UNIQUE (character_id, plot_index)
);
```

---

## 6. Staged Migration Strategy (Version 1 -> Version 2)

```
[Phase 1: Hybrid Cloud Persistence]
  └── Connect REST API to replace browser localStorage with PostgreSQL character saves.
  └── Maintain existing offline fallback when offline.

[Phase 2: Authoritative Server Simulation Engine]
  └── Port pure domain rules (combatEngine.js, inventoryService.js) to Node.js backend.
  └── Run deterministic simulations on the server.

[Phase 3: Multiplayer Movement & Social Hub]
  └── Launch WebSocket server for Valorian Bazaar.
  └── Replicate remote player sprites, directional animations, and chat bubbles.

[Phase 4: Co-op PvE Monster Encounters]
  └── Synchronize enemy AI across shared Forest and Deepforge zones.
  └── Server-authoritative monster health, threat aggro, and shared loot distribution.

[Phase 5: PvP Colosseum Arena & Guild Battles]
  └── Ranked 1v1 and 3v3 arena matchmaking with lag-compensated hit detection.
  └── Guild orders, territory wars, and shared world bosses.
```
