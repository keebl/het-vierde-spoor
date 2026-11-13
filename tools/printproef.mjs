// Een proefdruk als pdf, zoals de browser hem op A4 zou afdrukken.
//
//   node tools/printproef.mjs <uitmap> <url>...
//   node tools/printproef.mjs /tmp/proef "http://localhost:4173/#/puzzel/dader.noir.kamer.4.kamer-18"
//
// Waarom zo en niet met `--print-to-pdf`: die bleef hangen, omdat de pagina
// nooit stilvalt (animaties, de regen in de sfeerplaat) en de virtuele klok
// dus nooit afloopt. Hier stuurt een script de browser via het
// DevTools-protocol: pagina openen, vijf seconden wachten, printToPDF. Dat
// vuurt ook beforeprint af, dus de regels klappen open zoals bij Cmd+P.
//
// Gebruikt Brave, want Chrome staat niet op deze machine; elke Chromium
// werkt (zet BROWSER). Er draait een eigen, leeg profiel in een tijdelijke
// map, los van dat van de eigenaar.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [uit, ...urls] = process.argv.slice(2);
if (!uit || !urls.length) {
  console.error('gebruik: node tools/printproef.mjs <uitmap> <url>...');
  process.exit(1);
}
mkdirSync(uit, { recursive: true });
const browser = process.env.BROWSER ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const poort = 9333;
const proc = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${poort}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'printproef-'))}`, 'about:blank',
], { stdio: 'ignore' });
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let lijst;
  for (let i = 0; i < 40 && !lijst; i++) {
    try { lijst = await (await fetch(`http://127.0.0.1:${poort}/json`)).json(); } catch { await wacht(250); }
  }
  const ws = new WebSocket(lijst.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const open = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && open.has(m.id)) { open.get(m.id)(m); open.delete(m.id); }
  });
  const stuur = (method, params = {}) => new Promise((r) => {
    const i = ++id;
    open.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  await stuur('Page.enable');
  for (const [n, url] of urls.entries()) {
    await stuur('Page.navigate', { url });
    await wacht(5000);
    // A4 in inches; de marges komen uit @page in app.css.
    const r = await stuur('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, paperWidth: 8.27, paperHeight: 11.69 });
    if (!r.result) { console.log('fout', url, JSON.stringify(r.error)); continue; }
    const naam = join(uit, `${n}-${url.split('/').pop()}.pdf`);
    writeFileSync(naam, Buffer.from(r.result.data, 'base64'));
    console.log('ok', naam);
  }
  ws.close();
} finally {
  proc.kill();
}
