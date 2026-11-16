// De printweergave op het scherm, voor als er geen pdf te maken is.
//
// tools/printproef.mjs maakt een echte proefdruk, maar start daarvoor een
// eigen Brave. In de Bash-sandbox van een Claude-sessie kan dat niet: macOS
// weigert Chromium daar de Mach-poort en de socketmap, ook met
// --no-sandbox, en het script viel dan om met een TypeError. Daardoor bleef
// de printproef van de ontknoping (2026-11-16) liggen.
//
// Dit fragment plak je in de console van een browser die de pagina al
// heeft (in een sessie: javascript_tool in het browserpaneel). Het vuurt
// beforeprint af, zoals Cmd+P, en zet alle regels uit de @media print-
// blokken erbij als gewone schermstijl. Dan zie je in een schermafbeelding
// wat er op papier komt. Wat het niet laat zien: de bladspiegel uit @page
// en waar de pagina's breken. Daarvoor blijft de pdf nodig.
//
// Terug naar normaal: de pagina herladen.
(() => {
  window.dispatchEvent(new Event('beforeprint'));
  let css = '';
  const loop = (regels, inPrint) => {
    for (const r of regels) {
      if (r instanceof CSSMediaRule) loop(r.cssRules, inPrint || /\bprint\b/.test(r.media.mediaText));
      else if (inPrint && !(r instanceof CSSPageRule)) css += `${r.cssText}\n`;
    }
  };
  for (const blad of document.styleSheets) {
    try { loop(blad.cssRules, false); } catch { /* een blad van een ander domein */ }
  }
  document.getElementById('printweergave')?.remove();
  const stijl = document.createElement('style');
  stijl.id = 'printweergave';
  stijl.textContent = css;
  document.head.append(stijl);
  return `${css.split('\n').length - 1} printregels aan`;
})();
