# Salvation — Online V2 Architecture Guide

**Document Version:** 1.0.0  
**Architecture Target:** Single-Player V1 ➔ Server-Authoritative Online V2  

---

## 1. Principles for Online Readiness Without premature Over-Engineering

Salvation V1 is built on client-side state in React and Phaser. To ensure that V1 seamlessly scales into an online multiplayer RPG (co-op, open-world instances, player trading, and PvP/PvE), the following design rules are maintained:

1. **State Isolation:**
   - Visual presentation (Phaser sprites, animations, particle effects, UI modals) is strictly decoupled from state logic (`combatEngine.js`, `characterService.js`, `itemsData.js`).
   - Mutations (e.g. inventory adds/removes, gold expenditure, XP gains, contract progress) pass through centralized service functions rather than ad-hoc component mutations.
2. **Stable Identifiers:**
   - Every entity (player, NPC, enemy, resource node, contract, item) uses fixed, immutable string IDs (e.g. `boar_bristleback`, `health-potion`, `iron_ore_1`, `contract_boar_hunt`).
3. **Save Data Schema & Versioning:**
   - Save objects are stamped with `schemaVersion: 2`.
   - Legacy saves are migrated deterministically without data loss.

---

## 2. Server Authority Mapping for Future V2

| Subsystem | V1 Single-Player Implementation | V2 Server-Authoritative Transition |
|---|---|---|
| **Inventory & Economy** | `localStorage` mutated via `characterService.js` | Server validates transactions via secure WebSocket/gRPC; client sends action requests (`REQ_USE_ITEM`, `REQ_BUY_ITEM`); server replies with authoritative snapshot. |
| **Combat & Damage** | Client calculates damage via `combatEngine.js` | Server processes player attack timestamps, weapon cooldowns, range verification, and calculates true damage/health on authoritative enemy instances. |
| **Resource Nodes** | Respawn timers run locally in `WorldScene.js` | Server tracks world node states (ready, mined, depleted) and broadcasts state changes to all players in the region instance. |
| **World Instances** | Client switches scenes via `switchZone(zoneId)` | Server assigns player to regional room channels (e.g. `room:homestead:<userId>`, `room:city:1`, `room:caverns:1`). |
| **Quest Progression** | Progress recorded on local bridge events | Server validates objective conditions before updating database records and issuing rewards. |

---

## 3. Current Data Schema

```json
{
  "schemaVersion": 2,
  "character": {
    "characterName": "Valen",
    "race": "human",
    "className": "Vanguard",
    "customization": { ... }
  },
  "profile": {
    "stats": { "level": 1, "xp": 0, "power": 120, "gold": 350 },
    "inventory": { "health-potion": 3, "iron": 6, "copper": 4 },
    "activeContracts": [ ... ],
    "discoveredRegions": [ "homestead", "homestead_interior", "west_road", "village" ]
  }
}
```
