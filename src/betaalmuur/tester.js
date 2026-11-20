// De pagina /tester (tester.html): zet testtoegang aan in deze browser, of
// met ?uit weer uit, zodat Guus zelf de betaalmuur weer kan zien. Een los
// bestand omdat de CSP geen script in de pagina zelf toelaat.

import { isTester, zetTester } from './toegang.js';

zetTester(!new URLSearchParams(location.search).has('uit'));
const aan = isTester();
document.getElementById('aan').hidden = !aan;
document.getElementById('uit').hidden = aan;
