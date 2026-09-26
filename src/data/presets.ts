import { PresetCase } from '../types';

export const CLINICAL_PRESETS: PresetCase[] = [
  {
    id: 'hofte-natt',
    title: 'Hofteoperert pasient – natturo og smerter',
    category: 'Kirurgi / Ortopedi',
    type: 'soap',
    description: 'Typisk nattevakt med behov for smertelindring og observasjon etter collum femoris-fraktur.',
    rawText: 'Pasient urolig kl 02.15, klager over skjærende smerter i h. hofte og lår, NRS 7. Puls 94, BT 145/85, temp 37.4, SpO2 96% u/oksygen. Gitt 1g Paracet og 5mg Oxynorm po forordnet kl 02.30. Sovnet kl 03.15, rolig søvn etter dette, NRS nede på 2 ved vekking kl 06.00. Tilsyn utført, bandasje tørr og ren.',
  },
  {
    id: 'kols-forverring',
    title: 'Akutt KOLS-forverring – SBAR til vakthavende',
    category: 'Medisin / Lunge',
    type: 'sbar',
    description: 'Rask forverring av respirasjon på post, behov for akutt legetilsyn og forstøverbehandling.',
    rawText: 'Rom 312, pasient med kjent KOLS grad 3. Plutselig økende dyspné og forlenget ekspirium siste time. NEWS2 er 7 (AF 28, SpO2 86% på 1L O2, puls 112, BT 155/92, temp 37.8). Pasienten orker knapt snakke i hele setninger, surkling basalt bilateralt. Ønsker legetilsyn straks, vurdering av forstøver Atrovent/Ventoline og ABG-kontroll.',
  },
  {
    id: 'palliasjon-smerte',
    title: 'Palliativ omsorg – smertegjennombrudd',
    category: 'Palliasjon / Onkologi',
    type: 'soap',
    description: 'Uro, smerter og dyspné hos terminal pasient med subkutan smertepumpe.',
    rawText: 'Terminal pasient, liggende i rolig belysning på enerom. Pårørende til stede ved sengen. Pasienten grimaserer og virker urolig ved stillingsendring kl 04. Gitt ekstradose Morfin 2,5 mg sc kl 04.10. Bedret muskeltonus og roligere respirasjonsmønster etter 20 minutt. Fuktet munnslimhinne med kunstig spytt, leiring til sideleie med støtteputer.',
  },
  {
    id: 'pasient-hjertesvikt',
    title: 'Forklaring: Hjertesvikt og væskedrivende',
    category: 'Pasientkommunikasjon',
    type: 'forenkling',
    description: 'Forklare hvorfor pasienten må veies daglig og ta vanndrivende tablett til eldre pasient/pårørende.',
    rawText: 'Legen har påvist moderat hjertesvikt med perifer ødemdannelse i begge underekstremiteter og begynnende lungevenøs stase. Pasienten er satt på Furix 40mg om morgenen, restriksjon på 1500ml væske per døgn og daglig vektmåling.',
  },
  {
    id: 'sjekkliste-slag',
    title: 'Vakt-sjekkliste: Akutt hjerneinfarkt dag 1',
    category: 'Nevrologi',
    type: 'checklist',
    description: 'Strukturerte sjekkpunkt for observasjon av nevrologisk status, blodtrykk og svelgfunksjon.',
    rawText: 'Pasient overført fra overvåking etter trombolysebehandling ved hjerneinfarkt. Skal observeres for nevrologisk forverring, blødningstegn, BT-kontroll og svelgvurdering før inntak av mat/drikke.',
  },
];

export interface PromptTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  prompt: string;
}

export const CHATGPT_PROMPT_LIBRARY: PromptTemplate[] = [
  {
    id: 'p-1',
    title: 'Strukturering av kaosnotat til DIPS',
    badge: 'Dokumentasjon',
    description: 'Ta rå, ustrukturerte tankar og stikkord frå lommeboka og gjer dei om til formelt fagspråk.',
    prompt: `Du er ein erfaren fagansvarleg sjukepleiar. Strukturer følgjande stikkord til eit presist journalnotat for elektronisk pasientjournal (DIPS). Bruk objektivt fagspråk, luk ut personlege meiningar og framhev tiltak og pasientrespons: [LIM INN STIKKORD HER]`,
  },
  {
    id: 'p-2',
    title: 'NEWS2 klinisk overlevering',
    badge: 'Akutt / SBAR',
    description: 'Klargjere overlevering til lege ved forverra vitale målingar.',
    prompt: `Gjer følgjande observasjonar om til ein konsis SBAR-overlevering til vakthavande lege. Rekn ut truleg NEWS2-skår og formuler eit tydeleg tilrådingspunkt: [LIM INN VITALIA HER]`,
  },
  {
    id: 'p-3',
    title: 'Forenkling av epikrise til pårørande',
    badge: 'Kommunikasjon',
    description: 'Omsett medisinsk epikrise eller legesvar til eit empatisk, forståeleg språk for familien.',
    prompt: `Skriv om følgjande medisinske vurdering til eit roleg, empatisk og forståeleg språk tilpassa pårørande. Unngå latinske framandord utan å forklare dei: [LIM INN MEDISINSK TEKST]`,
  },
  {
    id: 'p-4',
    title: 'Sårvurdering (TIMES-prinsippet)',
    badge: 'Prosedyre',
    description: 'Dokumenter sårstatus etter anerkjent internasjonal og nasjonal TIMES-standard.',
    prompt: `Strukturer dette sårtilsynet etter TIMES-modellen (Tissue, Infection/Inflammation, Moisture, Edge, Surrounding skin). Foreslå vidare skiftintervall og bandasjeval: [LIM INN SÅROBSERVASJONAR]`,
  },
];
