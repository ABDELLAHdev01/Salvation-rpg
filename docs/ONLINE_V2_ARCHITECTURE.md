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

### 3.2 Zone / Room Instances
The game world is partitioned into regional rooms matching Version 1 regions:
- `zone:homestead:<userId>` - Private instanced player sanctuary.
- `zone:mine:<channelId>` - Shared dungeon delve (capacity: 20-30 players).
- `zone:forest:<channelId>` - Open wilderness with roaming monsters (capacity: 30-50 players).
- `zone:village:<channelId>` - Social hub, trade bazaar, and guild gatherings.
- `zone:arena:<duelId>` - Dedicated low-latency PvP combat arena.

---

## 4. Entity Replication & Combat Synchronization

### 4.1 Server Tick Rate
- **Server Tick:** 20 Hz (every 50ms) or 30 Hz (every 33.3ms).
- At each tick, the server computes movement deltas, enemy AI state changes, active attack hitboxes, and broadcasts compressed binary delta packets (e.g. via MessagePack or Protobuf).

### 4.2 Client-Side Prediction & Reconciliation
- The local player moves instantly on client input.
- The server responds with acknowledged position sequence numbers. If client prediction diverges from the server beyond a small threshold, the client smoothly interpolates toward the authoritative position.
- Remote players and monsters are rendered using linear interpolation (interp buffer of 100ms) to ensure smooth animations even under packet jitter.

### 4.3 Combat Hit Registration
- When the player executes `ATTACK_INTENT`:
  1. Client plays weapon swing animation and predictive slash arc.
  2. Server checks attack cooldown, verifies player position, constructs the weapon hitbox arc at the specified timestamp, and tests intersection against enemy/player colliders.
  3. Server applies damage, calculates armor reduction and critical hits, updates HP, and broadcasts `COMBAT_HIT` and `ENTITY_DIED` packets.

---

## 5. Persistence & PostgreSQL Database Schema

```sql
-- Core User Account
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Persistent Character Profile
CREATE TABLE characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(32) UNIQUE NOT NULL,
    race VARCHAR(20) NOT NULL,
    class_name VARCHAR(20) NOT NULL,
    level INT DEFAULT 1,
    xp BIGINT DEFAULT 0,
    gold BIGINT DEFAULT 350,
    current_zone VARCHAR(32) DEFAULT 'homestead',
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
