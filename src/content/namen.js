// Welk portret hoort bij welke naam.
//
// De koppen op het bord werden getekend uit het volgnummer van een figuur:
// nummer drie kreeg altijd dezelfde kapsel, dezelfde baard en dezelfde bril.
// Dat is handig - hetzelfde nummer geeft altijd dezelfde kop - maar het weet
// niets van de naam die eroverheen komt. Anouk kreeg dus een volle baard en
// Bertram een opgestoken kapsel.
//
// Daarom staat het hier, naam voor naam, met de hand. Niets wordt geraden:
// tools/check-kamers.mjs faalt zodra er een naam in een wereld bijkomt die
// hier niet staat.
//
// 'v' en 'm' zeggen alleen welke kapsels en welk gezichtshaar passen (zie
// KAPSELS en GEZICHTSHAAR in personenkunst-geschilderd.js). Alles wat er
// verder aan een kop te kiezen valt - huid, ogen, kleding, bril - blijft
// uit het volgnummer komen, want daar heeft een naam niets over te zeggen.
export const GESLACHT_VAN = {
  Aafke: 'v', Ada: 'v', Adelheid: 'v', Adil: 'm', Agnes: 'v', Albert: 'm',
  Alida: 'v', Alwin: 'm', Amber: 'v', Amira: 'v', Anna: 'v', Annelies: 'v',
  Anouk: 'v', Anton: 'm', Arend: 'm', Arnaud: 'm', Astrid: 'v', Aukje: 'v',
  Aya: 'v', Ayla: 'v', Ayse: 'v',
  Bart: 'm', Bas: 'm', Bashir: 'm', Bente: 'v', Bep: 'v', Berend: 'm',
  Bertha: 'v', Bertram: 'm', Bertus: 'm', Bianca: 'v', Bilal: 'm', Bo: 'v',
  Bob: 'm', Bodil: 'v', Boris: 'm', Boudewijn: 'm', Bram: 'm', Brigitte: 'v',
  Bruno: 'm',
  Carlo: 'm', Carmen: 'v', Caro: 'v', Casper: 'm', Cato: 'v', Cecile: 'v',
  Chantal: 'v', Chayenne: 'v', Chiara: 'v', Chiel: 'm', 'Chloé': 'v',
  Chris: 'm', Clara: 'v', Cleo: 'v', Coen: 'm', Cor: 'm', Cornelia: 'v',
  Cosima: 'v',
  Daan: 'm', Dagmar: 'v', Daphne: 'v', Davy: 'm', Dex: 'm', Diederik: 'm',
  Dieuwertje: 'v', Dieuwke: 'v', Dilan: 'm', Dirk: 'm', Dirkje: 'v',
  Dmitri: 'm', Dora: 'v', Dorothea: 'v', Dounia: 'v', Doutzen: 'v',
  Douwe: 'm', Dries: 'm',
  Eduard: 'm', Edwin: 'm', Eefje: 'v', Eleonora: 'v', Elger: 'm', Elias: 'm',
  Elif: 'v', Eline: 'v', Elke: 'v', Elsa: 'v', Elvira: 'v', Emma: 'v',
  Emre: 'm', Erik: 'm', Esra: 'v', Esther: 'v', Eva: 'v', Everhard: 'm',
  Evert: 'm', Ewa: 'v', Ezra: 'm',
  Fabian: 'm', Fabienne: 'v', Farah: 'v', Farid: 'm', Fatima: 'v',
  Fedde: 'm', Felix: 'm', Femke: 'v', Fenna: 'v', Fenne: 'v', Ferdinand: 'm',
  Ferry: 'm', Fien: 'v', Finn: 'm', Fleur: 'v', Floris: 'm', Francisca: 'v',
  Freek: 'm', Froukje: 'v',
  Gaia: 'v', Geert: 'm', Guus: 'm', Geertje: 'v', Gerard: 'm', Gerda: 'v', Gerrit: 'm',
  Gert: 'm', Gideon: 'm', Giel: 'm', Gijs: 'm', Gijsbert: 'm',
  Godelieve: 'v', Gonnie: 'v', Grace: 'v', Gunnar: 'm', Gustaaf: 'm',
  Gwen: 'v', Gwendolyn: 'v', 'Göran': 'm',
  Hadewych: 'v', Hakim: 'm', Hamza: 'm', Hana: 'v', Hanna: 'v',
  Hanneke: 'v', Hassan: 'm', Hedda: 'v', Hendrik: 'm', Henny: 'v',
  'Henriëtte': 'v', Hester: 'v', Hidde: 'm', Hielke: 'm', Hilde: 'v',
  Hille: 'v', Hind: 'v', Hiro: 'm', Hugo: 'm',
  Ida: 'v', Ide: 'm', Idris: 'm', Ignatius: 'm', Ilja: 'm', Ilse: 'v',
  Imke: 'v', Ines: 'v', Inge: 'v', Ingmar: 'm', Irene: 'v', Iris: 'v',
  Irma: 'v', Isa: 'v', Isabel: 'v', Ischa: 'v', Ivan: 'm', Ivar: 'm',
  Ivo: 'm',
  Jacob: 'm', Jade: 'v', Jamal: 'm', Jasper: 'm', Jelle: 'm', Jens: 'm',
  Jet: 'v', Joachim: 'm', Joep: 'm', Jolanda: 'v', Jolien: 'v', Jonas: 'm',
  Joop: 'm', Joris: 'm', Jorrit: 'm', Josephina: 'v', Judith: 'v',
  Juno: 'v', Jurgen: 'm', Juul: 'v',
  Karel: 'm', Karin: 'v', Kars: 'm', Karst: 'm', Kasper: 'm', Katrien: 'v',
  Kaya: 'v', Kees: 'm', Kick: 'm', Kenji: 'm', Khalid: 'm', Kiki: 'v', Kim: 'v',
  Kirsten: 'v', Klaas: 'm', Koen: 'm', Koenraad: 'm', Konstantijn: 'm',
  Koos: 'm', Kris: 'm', Kyra: 'v',
  Lars: 'm', Laurens: 'm', Leni: 'v', Lennart: 'm', Leon: 'm', Leopold: 'm',
  Lex: 'm', Lieuwe: 'm', Lieve: 'v', Lijsje: 'v', Linde: 'v', Linnea: 'v',
  Lodewijk: 'm', Loek: 'm', Lotte: 'v', Lova: 'v', Lucia: 'v', Luna: 'v',
  Luuk: 'm', Lynn: 'v',
  Maarten: 'm', Machteld: 'v', Magnus: 'm', Malia: 'v', Marcellus: 'm',
  Marek: 'm', Margaretha: 'v', Marieke: 'v', Marit: 'v', Marius: 'm',
  Marjan: 'v', Mart: 'm', Martijn: 'm', Mathilde: 'v', Mathis: 'm',
  Maud: 'v', Mauritz: 'm', Max: 'm', Maya: 'v', Mees: 'm', Melchior: 'm',
  Menno: 'm', Mette: 'v', Mies: 'v', Mila: 'v', Milan: 'm', Mink: 'm',
  Mira: 'v', Mo: 'm', Mohammed: 'm', Morgana: 'v', Morris: 'm',
  Nabil: 'm', Nadia: 'v', Nadine: 'v', Nadir: 'm', Nanne: 'v', Naomi: 'v',
  Nathalia: 'v', Neeltje: 'v', Nelis: 'm', Nelleke: 'v', Nelly: 'v',
  Nerissa: 'v', Nestor: 'm', Netty: 'v', Nicodemus: 'm', Nicolaas: 'm',
  Niek: 'm', Niels: 'm', Nienke: 'v', Nina: 'v', Noach: 'm', Noor: 'v',
  Noortje: 'v', Nora: 'v', Norbert: 'm', Nordin: 'm', Nour: 'v', Nout: 'm',
  Nova: 'v', Nuru: 'v',
  Obbe: 'm', Octaaf: 'm', Odette: 'v', Odile: 'v', Odilia: 'v',
  Odilon: 'm', Odulf: 'm', Oksana: 'v', Olaf: 'm', Oleg: 'm', Olga: 'v',
  Olger: 'm', Olivia: 'v', Olivier: 'm', Olle: 'm', Omar: 'm', Onne: 'm',
  Onno: 'm', Oona: 'v', Orhan: 'm', Orlando: 'm', Orso: 'm', Oscar: 'm',
  Oskar: 'm', Osvald: 'm', Oswald: 'm', Otger: 'm', Otis: 'm',
  Ottilie: 'v', Otto: 'm', Ouassima: 'v', Oumar: 'm',
  Pablo: 'm', Pallas: 'v', Pascal: 'm', Patricia: 'v', Paul: 'm',
  Pauwel: 'm', Pelle: 'm', Pepijn: 'm', Perpetua: 'v', Petra: 'v',
  Petronella: 'v', Philippine: 'v', Pien: 'v', Piet: 'm', Pieter: 'm',
  Pim: 'm', Pleun: 'v', Priya: 'v', Puck: 'v',
  Qadir: 'm', Qiang: 'm', Quincy: 'm', Quint: 'm', Quinta: 'v',
  Quinten: 'm', Quintijn: 'm', Quintus: 'm', Quinty: 'v', Quirijn: 'm',
  Quirin: 'm', Quirina: 'v', Quirine: 'v', Quirinus: 'm',
  Rachid: 'm', Rafael: 'm', Rashid: 'm', Ravi: 'm', Reinier: 'm',
  Reinoud: 'm', Renate: 'v', Rie: 'v', Rik: 'm', Rinske: 'v', Robin: 'm',
  Rodrigo: 'm', Roel: 'm', Romy: 'v', Ronald: 'm', Roosje: 'v',
  Roosmarijn: 'v', Rosalie: 'v', Rosalind: 'v', Rozemarijn: 'v',
  Rudolphine: 'v', Rutger: 'm',
  Saar: 'v', Sander: 'm', Sanne: 'v', Saskia: 'v', Sebastiaan: 'm',
  Sem: 'm', Senna: 'v', Severin: 'm', Sibylle: 'v', Siebrand: 'm',
  Sieger: 'm', Siem: 'm', Silke: 'v', Sjaak: 'm', Sofie: 'v', Stef: 'm',
  Stijn: 'm', Suvi: 'v', Sybren: 'm', Sylvia: 'v',
};

// Onbekend? Dan 'm', want dat is wat de koppen deden voordat dit bestond.
// De keuring zorgt dat het nooit zover komt.
export const geslachtVan = (naam) => GESLACHT_VAN[naam] ?? 'm';
