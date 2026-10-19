/**
 * Game Event Bridge
 * Decoupled event dispatcher between Phaser 2D world engine and React UI overlays.
 */

class GameEventBridge {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(payload);
        } catch (err) {
          console.error(`[GameEventBridge] Error in listener for ${event}:`, err);
        }
      });
    }
  }

  clear() {
    this.listeners.clear();
  }
}

export const gameEvents = {
  // From Phaser -> React
  INTERACTION_AVAILABLE: 'interaction:available',
  INTERACTION_CLEARED: 'interaction:cleared',
  ZONE_CHANGED: 'zone:changed',
  FARM_PLOT_INTERACT: 'farm:interact',
  MINE_NODE_INTERACT: 'mine:interact',
  CHEST_OPEN: 'chest:open',
  WORKBENCH_OPEN: 'workbench:open',
  NPC_TALK: 'npc:talk',
  PLAYER_MOVED: 'player:moved',
  COMBAT_ENEMY_DAMAGED: 'combat:enemy_damaged',
  COMBAT_ENEMY_DEFEATED: 'combat:enemy_defeated',
  COMBAT_PLAYER_DAMAGED: 'combat:player_damaged',
  COMBAT_PLAYER_DIED: 'combat:player_died',
  COMBAT_PLAYER_HEAL: 'combat:player_heal',

  // From React -> Phaser
  LOCK_CONTROLS: 'controls:lock',
  UNLOCK_CONTROLS: 'controls:unlock',
  SWITCH_ZONE: 'zone:switch',
  REFRESH_CUSTOMIZATION: 'player:refresh_customization',
  USE_HEALING_POTION: 'player:use_healing_potion',
  EXECUTE_PLAYER_HEAL: 'player:execute_heal',
};

export const gameEventBridge = new GameEventBridge();
export default gameEventBridge;
