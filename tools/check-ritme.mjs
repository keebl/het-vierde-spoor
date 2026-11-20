// Het ritme zoals je het ziet: opent de schermen uit tests/ui/ui-check.json
// in een headless browser op drie breedtes en meet met tools/ritme-meting.js
// of blokken die er hetzelfde uitzien even ver uit elkaar staan, op de
// schaal.
//
// Waarom drie breedtes: de puzzelpagina heeft drie indelingen (telefoon,
// één kolom tot 1099 px, twee kolommen). Op 2026-11-19 was alleen de
// telefoon en de brede versie bekeken, en zat de fout in de middelste: het
// klepje Aanwijzingen stond 64 px onder klepjes die 24 uit elkaar stonden.
// Guus zag het; geen toets. check-afstanden leest de css, deze meet de
// pagina.
//
// Start zelf de site (op een eigen poort, zonder AI-sleutel, zodat een
// puzzel laden nooit een betaalde aanroep doet) en een Chromium over het
// DevTools-protocol, net als printproef.mjs; geen extra pakketten. Brave
// of Chrome op een Mac, google-chrome of chromium op Linux (CI), of zet
// BROWSER. In de Bash-sandbox van een Claude-sessie start geen Chromium;
// plak daar tools/ritme-meting.js in het browserpaneel en roep meetRitme().
//
// node tools/check-ritme.mjs

import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BREEDTES = [390, 800, 1300];
const POORT_SITE = 4199;
const POORT_BROWSER = 9334;

const pad = (p) => fileURLToPath(new URL(p, import.meta.url));
const meting = readFileSync(pad('./ritme-meting.js'), 'utf8');
const { screens } = JSON.parse(readFileSync(pad('../tests/ui/ui-check.json'), 'utf8'));
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = [
  process.env.BROWSER,
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((b) => b && existsSync(b));
if (!browser) {
  console.log('geen Chromium gevonden; zet BROWSER');
  process.exit(1);
}

const omgeving = { ...process.env, PORT: String(POORT_SITE) };
delete omgeving.ANTHROPIC_API_KEY;
const site = spawn(process.execPath, [pad('../server/serve.mjs')], { env: omgeving, stdio: 'ignore' });
const proc = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
  `--remote-debugging-port=${POORT_BROWSER}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'ritme-'))}`,
  // Ubuntu op de GitHub-runner staat de zandbak van Chromium niet toe;
  // de browser opent hier alleen onze eigen pagina op localhost.
  ...(process.platform === 'linux' ? ['--no-sandbox'] : []),
  'about:blank',
], { stdio: 'ignore' });

let code = 1;
try {
  for (let i = 0; i < 40; i++) {
    try { await fetch(`http://127.0.0.1:${POORT_SITE}/`); break; } catch { await wacht(250); }
  }
  // Dertig seconden, niet tien: op een drukke GitHub-runner kwam Chrome
  // op 2026-11-20 niet op tijd op en viel PR #45 om zonder ritmefout.
  let lijst;
  for (let i = 0; i < 120 && !lijst; i++) {
    try { lijst = await (await fetch(`http://127.0.0.1:${POORT_BROWSER}/json`)).json(); } catch { await wacht(250); }
  }
  if (!lijst) throw new Error(`${browser} kwam niet op. In een sandbox: plak tools/ritme-meting.js in het browserpaneel.`);

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
  const waarde = async (expression) => (await stuur('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;

  await stuur('Page.enable');
  let fouten = 0;
  let paren = 0;
  for (const breedte of BREEDTES) {
    await stuur('Emulation.setDeviceMetricsOverride', { width: breedte, height: 1000, deviceScaleFactor: 1, mobile: breedte < 768 });
    for (const scherm of screens) {
      // Eerst weg, dan erheen: alleen de hash veranderen laadt niets opnieuw.
      await stuur('Page.navigate', { url: 'about:blank' });
      await stuur('Page.navigate', { url: `http://127.0.0.1:${POORT_SITE}${scherm.path}` });
      const kenmerk = scherm.steps?.find((s) => s.wait)?.wait ?? 'main';
      let klaar = false;
      for (let i = 0; i < 40 && !klaar; i++) {
        klaar = await waarde(`!!document.querySelector(${JSON.stringify(kenmerk)})`);
        if (!klaar) await wacht(250);
      }
      await wacht(1500); // lettertypen en de eerste animatieronde
      const uit = await waarde(`${meting}\nmeetRitme()`);
      const naam = `${scherm.name} op ${breedte}`.padEnd(22);
      if (!klaar || !uit) {
        console.log(`FOUT   ${naam} pagina laadde niet (${kenmerk})`);
        fouten++;
        continue;
      }
      paren += uit.paren;
      console.log(`${uit.fouten.length ? 'FOUT ' : 'goed '}  ${naam} ${uit.paren} paren`);
      for (const f of uit.fouten) console.log(`         ${f}`);
      fouten += uit.fouten.length;
    }
  }
  ws.close();
  console.log(fouten
    ? `\n${fouten} FOUTEN in het ritme (specs/spacing-rhythm.md)`
    : `\n${paren} paren gemeten, elk ritme klopt`);
  code = fouten ? 1 : 0;
} catch (e) {
  console.log(e.message);
} finally {
  proc.kill();
  site.kill();
}
process.exit(code);
