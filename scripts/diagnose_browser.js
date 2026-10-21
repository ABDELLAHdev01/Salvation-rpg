import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  console.log('Target WS URL:', target.webSocketDebuggerUrl);

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
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
    } else if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
    }
  };

  await send('Runtime.enable');
  await send('Page.enable');

  // Set localStorage so character exists
  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await send('Page.navigate', { url: 'http://127.0.0.1:5173/' });

  // Wait 2s for initial load
  await new Promise(r => setTimeout(r, 2000));

  // Check current URL and localStorage
  const urlRes = await send('Runtime.evaluate', { expression: 'window.location.href' });
  console.log('Current URL:', urlRes?.result?.value);

  // If redirected to /character, create character and reload
  if (urlRes?.result?.value.includes('/character')) {
    console.log('On character page! Creating character...');
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
    await new Promise(r => setTimeout(r, 4000));
  }

  const finalUrl = await send('Runtime.evaluate', { expression: 'window.location.href' });
  console.log('Final URL:', finalUrl?.result?.value);

  // Switch to interior to test the cottage interior with bed
  await send('Runtime.evaluate', {
    expression: `
      window.__PHASER_GAME__?.scene?.scenes[0]?.switchZone('homestead_interior');
    `
  });
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.data) {
    fs.writeFileSync('C:\\Users\\abdel\\WorkSpace\\browser_view.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot to C:\\Users\\abdel\\WorkSpace\\browser_view.png');
  }

  // Get canvas stats
  const canvasStats = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const c = document.querySelector('canvas');
        if (!c) return 'No canvas found!';
        const ctx = c.getContext('2d') || c.getContext('webgl') || c.getContext('webgl2');
        return {
          width: c.width,
          height: c.height,
          style: c.getAttribute('style'),
          visible: c.offsetWidth > 0,
          type: ctx ? ctx.constructor.name : 'none'
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Canvas Stats:', canvasStats?.result?.value);

  ws.close();
  edge.kill();
}

run().catch(console.error);
