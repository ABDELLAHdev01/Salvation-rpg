import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

async function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = path.join(process.env.TEMP, 'edge_diag_' + Date.now());

  const edge = spawn(edgePath, [
    '--headless=new',
    '--window-size=1280,800',
    `--user-data-dir=${userDataDir}`,
    '--remote-debugging-port=9222',
    'about:blank'
  ]);

  console.log('Spawned Edge, waiting for port 9222...');
  let version = null;
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      version = await getJson('http://127.0.0.1:9222/json/version');
      if (version) break;
    } catch {}
  }

  if (!version) {
    console.error('Failed to connect to Edge debugging port');
    edge.kill();
    return;
  }

  const list = await getJson('http://127.0.0.1:9222/json/list');
  const target = list.find(t => t.type === 'page') || list[0];
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');

  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });
  await new Promise(r => setTimeout(r, 2000));

  // Set hero in localStorage
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('hasCreatedCharacter', 'true');
      localStorage.setItem('mockCharacters', JSON.stringify({
        'offline-hero': {
          name: 'Hero',
          race: 'human',
          className: 'Vanguard',
          customization: {
            skinTone: '#fcd34d',
            hairStyle: 'short',
            hairColor: '#451a03',
            eyeStyle: 'normal',
            outfit: 'tunic',
            outfitColor: '#1e3a8a',
            headwear: 'none',
            accessory: 'none',
            equippedTool: 'steel_broadsword'
          }
        }
      }));
      localStorage.setItem('mockProfiles', JSON.stringify({
        'offline-hero': {
          username: 'offline-hero',
          stats: { level: 1, xp: 0, power: 120, gold: 350 },
          inventory: { 'health-potion': 3, iron: 6, copper: 4, turnip: 5 }
        }
      }));
      window.location.href = '/';
    `
  });
  await new Promise(r => setTimeout(r, 3000));

  const outDir = 'C:\\Users\\abdel\\WorkSpace\\screenshots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const zones = ['tutorial_island', 'homestead', 'homestead_interior', 'west_road', 'village', 'forest', 'mine'];

  for (const zone of zones) {
    console.log(`Switching to zone: ${zone}...`);
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const game = window.__PHASER_GAME__;
          if (!game) return;
          const scene = game.scene.getScene('WorldScene');
          if (scene) {
            scene.isTransitioning = false;
            scene.switchZone('${zone}');
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 2500));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) {
      const filePath = path.join(outDir, `${zone}.png`);
      fs.writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot: ${filePath}`);
    }
  }

  console.log('All zone screenshots captured!');
  ws.close();
  edge.kill();
  process.exit(0);
}

run().catch(console.error);
