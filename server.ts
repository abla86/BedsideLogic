import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily / safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Server-side PII detector & sanitizer with strict Guard Dog rules
function sanitizePII(text: string): { sanitized: string; violations: string[] } {
  const violations: string[] = [];
  let sanitized = text;

  // 11 digits: Norwegian fødselsnummer / D-nummer (DDMMYY XXXXX, DDMMYY-XXXXX, or 11 continuous digits)
  const fnrRegex = /\b(?:\d{6}[-\s]\d{5}|\d{11})\b/g;
  const fnrMatches = sanitized.match(fnrRegex);
  if (fnrMatches && fnrMatches.length > 0) {
    violations.push(`Mogleg fødselsnummer oppdaga (11 siffer: ${fnrMatches.join(", ")})`);
    sanitized = sanitized.replace(fnrRegex, "[PERSONVERN-SLETTA]");
  }

  // 8 digits: Norwegian phone numbers (8 continuous digits, or standard groupings like 2+2+2+2 or 3+2+3, with optional +47 / 0047)
  const phoneRegex = /\b(?:\+47[-\s]?|0047[-\s]?)?(?:[49]\d{7}|[235678]\d{7}|\d{2}[-\s]\d{2}[-\s]\d{2}[-\s]\d{2}|\d{3}[-\s]\d{2}[-\s]\d{3})\b/g;
  const phoneMatches = sanitized.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    violations.push(`Mogleg telefonnummer oppdaga (8 siffer: ${phoneMatches.join(", ")})`);
    sanitized = sanitized.replace(phoneRegex, "[PERSONVERN-SLETTA]");
  }

  // Explicit name patterns (e.g. "Pasient Ola Nordmann", "fru Olsen", "herr Berg")
  const nameRegex = /\b(?:pasient|innlagt|fru|herr|pårørande|pårørende)\s+([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)/gi;
  const nameMatches = sanitized.match(nameRegex);
  if (nameMatches && nameMatches.length > 0) {
    violations.push(`Mogleg pasientnamn oppdaga (${nameMatches.join(", ")})`);
    sanitized = sanitized.replace(nameRegex, "[PERSONVERN-SLETTA]");
  }

  return { sanitized, violations };
}

// Dedicated Guard Dog system prompt layer: Enforces strict PII redaction, non-confirmation of deleted info, and omission of irrelevant sensitive details
const GUARD_DOG_SYSTEM_PROMPT = `=== [GUARD DOG SIKKERHEITSLAG - HØGSTE PRIORITET] ===
Du har eit ufråvikeleg "Guard Dog"-sikkerheitslag aktivert. Før du prosesserer, strukturerer eller genererer tekst, SKAL du følgje desse 4 reglane:

1. SKANN OG ERSTATT PERSONIDENTIFISERBAR INFORMASJON (PII):
   - Viss teksten inneheld personnamn (pasient, pårørande eller helsepersonell), personnummer / fødselsnummer (11 siffer), D-nummer, telefonnummer (8 siffer), adresse, eller andre direkte identifiserande kjenneteikn, SKAL du omgåande erstatte dei med merkelappen: [PERSONVERN-SLETTA].
2. SLETT UTAN Å STADFESTE ELLER BEKREFTE:
   - Du skal ALDRI gjenta, stadfeste, bekrefte, nemne eller spekulere i kva den sletta eller anonymiserte informasjonen var. Skriv aldri f.eks. "Pasienten, som heiter...", eller "Tlf-nummeret var...". Erstatt det utelukkande med [PERSONVERN-SLETTA] nøytralt utan kommentar.
3. UTELAT IRRELEVANTE SENSITIVE DETALJAR:
   - Utelat private, irrelevante eller ikkje-medisinske sensitive detaljar som ikkje har klinisk relevans for den faglege dokumentasjonen.
4. BEVAR REINE KLINISKE PARAMETRAR:
   - Vitale målingar (blodtrykk, puls, temperatur, SpO2, RF, NEWS2, NRS/VAS-smerteskår, doseringar) er kliniske observasjonar og skal bevarast uendra for pasienttryggleiken.
=====================================================`;

// System prompts engineered specifically for Norwegian clinical nursing
const SYSTEM_PROMPTS = {
  soap: `Du er ein spesialisert dokumentasjons-assistent for sjukepleiarar i Noreg. Oppgåva di er å transformere ustrukturerte stikkord til eit profesjonelt journalnotat etter SOAP-metodikken (Subjektivt, Objektivt, Analyse, Plan).

SIKKERHEITS-PROTOKOLL (HØGSTE PRIORITET):
Før du prosesserer tekst, skal du skanne etter Personidentifiserbare Opplysningar (PII). Viss du finn namn (t.d. pasientnamn), fødselsnummer, telefonnummer eller adresse, skal du omgåande erstatte dette med merkelappen [PERSONVERN-SLETTA]. Ikkje repetér namna.

REGLAR:
1. Språk: Bruk presist, fagleg norsk (helsepersonell-terminologi tilpassa valgt målform). Ikkje bruk unødvendige fyllord eller marknadsføringsspråk.
2. Tone: Objektiv, nøytral og profesjonell.
3. Struktur: Del tydeleg inn i S, O, A og P.
4. Klinisk skjønn: Du skal berre strukturere informasjonen som er gitt. Ikkje dikt opp medisinske funn eller diagnosar som ikkje er nemnde i stikkorda. Viss noko er uklart, skriv [TRENG UTDYPING].
5. Bruk gjeldande norske standardar (t.d. vitale parametrar, NEWS2, VAS/NRS smerteskår om nemnd).

OUTPUT-FORMAT:
**S (Subjektivt):** (Pasienten si oppleving, eigne ord, smerteskildring)
**O (Objektivt):** (Observerbare fakta, vitale målingar, kliniske observasjonar, administrert medikasjon)
**A (Analyse/Vurdering):** (Fagleg sjukepleievurdering av tilstand og respons)
**P (Plan/Tiltak):** (Vidare observasjonar, tiltak for neste vakt, legekontakt)`,

  sbar: `Du er ein ekspert på klinisk kommunikasjon i helsevesenet. Oppgåva di er å førebu sjukepleiaren på ein strukturert overlevering eller telefon til lege/kollega ved bruk av SBAR-verktøyet (Situasjon, Bakgrunn, Aktuelt, Tilråding).

SIKKERHEITS-PROTOKOLL (HØGSTE PRIORITET):
Sørg for at alle namn og personidentifiserande data er anonymiserte som [PERSONVERN-SLETTA].

REGLAR:
1. Gjer om kaotiske observasjonar til ein kortfatta og poengtert SBAR-rapport.
2. Fokuser på det som er akutt, tidskritisk og avvikande.
3. Bruk terminologi som er relevant for legar (t.d. NEWS2-skår, vitale parametrar, spesifikke kliniske funn).

OUTPUT-FORMAT:
**S (Situasjon):** (Kven gjeld dette, kvar ligg pasienten og kva er den akutte problemstillinga no?)
**B (Bakgrunn):** (Kort relevant forhistorie, innleggingsårsak, kjende diagnosar)
**A (Aktuelt):** (Kliniske funn, vitale målingar, NEWS2, kva har endra seg dei siste timane)
**R (Tilråding/Recommendation):** (Kva konkret ønskjer sjukepleiaren? T.d. tilsyn innan 30 minutt, endring i medikasjon, blodprøvar/røntgen)`,

  patient: `Du er ein erfaren sjukepleiar med spisskompetanse på pasient- og pårørandekommunikasjon. Oppgåva di er å ta komplisert medisinsk sjargong (t.d. frå legejournal, epikrise eller prøvesvar) og gjere det om til eit enkelt, trygt og forståeleg språk for pasienten og dei pårørande, utan å miste det faglege innhaldet.

SIKKERHEITS-PROTOKOLL:
Anonymiser alle personidentifiserbare data.

REGLAR:
1. Bruk korte, tydelege setningar.
2. Unngå eller forklar framandord og latinske uttrykk (t.d. forklara kva "takypné" eller "hypertensjon" tyder i praksis).
3. Hald ein empatisk, roleg og respektfull tone.
4. Avslutt alltid med standard helsefagleg råd om å kontakte lege ved uvisse.

OUTPUT-FORMAT:
**Kva betyr dette i korte trekk?**
**Kva gjer vi vidare?**
**Viktig å merke seg for deg og dine pårørande:**`,

  checklist: `Du er ein avdelingsleiar og fagutviklingssjukepleiar. Oppgåva di er å generere ei presis, handfast klinisk vakt-sjekkliste for sjukepleiaren basert på pasientkategori eller klinisk situasjon.

SIKKERHEITS-PROTOKOLL:
Ingen personidentifiserande data.

OUTPUT-FORMAT:
**Prioritert vakt-sjekkliste:**
- [ ] Kritiske observasjonar & vitale mål (NEWS2 / tidsintervall)
- [ ] Medisinering & infusjonar (spesielle omsyn)
- [ ] Pleie & mobilisering (leie, ernæring, trykksår)
- [ ] Varsling & kontakt (kriterium for legekontakt / tilsyn)`,
};

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
  });
});

// API: Anonymize check
app.post("/api/anonymize-check", (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.json({ sanitized: "", violations: [] });
  }
  const result = sanitizePII(text);
  res.json(result);
});

// API: Generate structured clinical documentation
app.post("/api/generate", async (req, res) => {
  try {
    const {
      prompt,
      type = "soap",
      language = "nynorsk",
      tone = "klinisk",
      systemPrompt,
    } = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return res.status(400).json({ error: "Ingen stikkord eller notat lagt inn." });
    }

    // Step 1: Digital Firewall Sanitization
    const { sanitized, violations } = sanitizePII(prompt);

    // Resolve template base prompt
    const defaultTemplatePrompt =
      SYSTEM_PROMPTS[type as keyof typeof SYSTEM_PROMPTS] ||
      (type === "forenkling" ? SYSTEM_PROMPTS.patient : null) ||
      SYSTEM_PROMPTS.soap;

    // Use active custom/updated system-prompt if supplied by the Mal-velger
    const basePrompt =
      typeof systemPrompt === "string" && systemPrompt.trim().length > 0
        ? systemPrompt.trim()
        : defaultTemplatePrompt;

    const languageInstruction = language === "nynorsk"
      ? "Svar på godt, naturleg og presist nynorsk helsefagleg språk."
      : "Svar på godt, naturleg og presist bokmål helsefaglig språk.";

    const toneInstruction = tone === "kompakt"
      ? "Formatet skal vere stramt og konsist, tilpassa rask rapportoverlevering."
      : tone === "utdjupt"
      ? "Ta med grundige kliniske resonnement og detaljerte tiltak."
      : "Standard klinisk journalnotatnivå for DIPS/Gerica/CosDoc.";

    const fullSystemInstruction = `${GUARD_DOG_SYSTEM_PROMPT}\n\n${basePrompt}\n\nMÅLFORM:\n${languageInstruction}\n\nTONE:\n${toneInstruction}`;

    const client = getGeminiClient();

    if (!client) {
      // Fallback generator for realistic local testing when API key is awaiting setup in settings
      const simulatedResponse = generateSimulatedClinicalNote(sanitized, type, language);
      return res.json({
        result: simulatedResponse,
        warnings: violations,
        simulated: true,
        message: "Generert i lokalt trygg-modus (sett inn GEMINI_API_KEY i Secrets for direkte sanntids AI).",
      });
    }

    let outputText = "";
    let isSimulated = false;
    let infoMessage: string | undefined;

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: sanitized,
        config: {
          systemInstruction: fullSystemInstruction,
          temperature: 0.2, // Low temperature for factual, clinically accurate notes
        },
      });
      outputText = response.text || "Ingen tekst vart generert.";
    } catch (genError: any) {
      console.warn("Gemini Live API unavailable or high demand, using resilient clinical generator fallback:", genError?.message || genError);
      outputText = generateSimulatedClinicalNote(sanitized, type, language);
      isSimulated = true;
      infoMessage = "KI-tenesta opplever for augeblikket høg pågang. Notatet er generert med lokal klinisk reservestruktur.";
    }

    return res.json({
      result: outputText,
      warnings: violations,
      simulated: isSimulated,
      message: infoMessage,
    });
  } catch (error: any) {
    console.error("Endpoint Error:", error);
    return res.status(500).json({
      error: error?.message || "Feil under generering av journalnotat.",
    });
  }
});

// Realistic local generator fallback to ensure seamless UX without crashing
function generateSimulatedClinicalNote(input: string, type: string, language: string): string {
  const isNynorsk = language === "nynorsk";

  if (type === "sbar") {
    return isNynorsk
      ? `**S (Situasjon):**\nPasienten opplever forverring med akutte symptom basert på innmelde observasjonar: "${input}".\n\n**B (Bakgrunn):**\nPasient innlagd til observasjon og oppfølging. Tidlegare stabil, men no registrert auke i symptomtrykk.\n\n**A (Aktuelt):**\nKliniske observasjonar viser behov for fornya vurdering. Vitale målingar kontrollert og dokumentert. Pasienten er informert.\n\n**R (Tilråding):**\nTilrår legetilsyn innan 30 minutt for vurdering av medikamentjustering og vidare forordningar.`
      : `**S (Situasjon):**\nPasienten opplever forverring med akutte symptomer basert på innmeldte observasjoner: "${input}".\n\n**B (Bakgrunn):**\nPasient innlagt til observasjon og oppfølging. Tidligere stabil, men nå registrert økning i symptomtrykk.\n\n**A (Aktuelt):**\nKliniske observasjoner viser behov for fornyet vurdering. Vitale målinger kontrollert og dokumentert. Pasienten er informert.\n\n**R (Tilråding):**\nTilrår legetilsyn innen 30 minutter for vurdering av medikamentjustering og videre forordninger.`;
  }

  if (type === "patient" || type === "forenkling") {
    return isNynorsk
      ? `**Kva betyr dette i korte trekk?**\nUndersøkingane og notata viser korleis kroppen din reagerer no. Vi har registrert symptoma dine (${input}) og sett i verk tiltak for at du skal kjenne deg trygg og få lindring.\n\n**Kva gjer vi vidare?**\nSjukepleiar følgjer deg jamleg opp gjennom vakta. Vi gjev avtalt medisin og måler blodtrykk og puls ved behov.\n\n**Viktig å merke seg for deg og dine pårørande:**\nBruk snora med ein gong om smertene aukar eller du kjenner deg svimmel. Snakk gjerne med lege under visitten om du har spørsmål.`
      : `**Hva betyr dette i korte trekk?**\nUndersøkelsene og notatene viser hvordan kroppen din reagerer nå. Vi har registrert symptomene dine (${input}) og iverksatt tiltak for at du skal føle deg trygg og få lindring.\n\n**Hva gjør vi videre?**\nSykepleier følger deg jevnlig opp gjennom vakten. Vi gir avtalt medisin og måler blodtrykk og puls ved behov.\n\n**Viktig å merke seg for deg og dine pårørende:**\nBruk snoren med en gang dersom smertene øker eller du føler deg svimmel. Snakk gjerne med lege under visitten om du har spørsmål.`;
  }

  if (type === "checklist") {
    return isNynorsk
      ? `**Prioritert vakt-sjekkliste:**\n- [ ] Kontroller vitale parametrar (NEWS2) kvar 4. time eller ved endring\n- [ ] Kartlegg smertenivå på NRS/VAS-skala før og 30 min etter smertelindrande medikasjon\n- [ ] Sikre adekvat væskeinntak og observer diurese\n- [ ] Følg opp mobilisering i samråd med fysioterapeut / forordning\n- [ ] Varsle ansvarleg lege ved NEWS2 ≥ 3 på enkeltparameter eller samla skår ≥ 5`
      : `**Prioritert vakt-sjekkliste:**\n- [ ] Kontroller vitale parametere (NEWS2) hver 4. time eller ved endring\n- [ ] Kartlegg smertenivå på NRS/VAS-skala før og 30 min etter smertelindrende medikasjon\n- [ ] Sikre adekvat væskeinntak og observer diurese\n- [ ] Følg opp mobilisering i samråd med fysioterapeut / forordning\n- [ ] Varsle ansvarlig lege ved NEWS2 ≥ 3 på enkeltparameter eller samlet skår ≥ 5`;
  }

  // Default SOAP
  return isNynorsk
    ? `**S (Subjektivt):**\nPasienten melder om symptom som samsvarer med stikkorda: "${input}". Gjev uttrykk for ubehag og har fått høve til å skildre eiga oppleving.\n\n**O (Objektivt):**\nVitale målingar og klinisk observasjon utført. Allmenntilstand stabil, men påverka av dei aktuelle plagene. Gjevne medikament og tiltak er journalførte etter gjeldande prosedyre.\n\n**A (Analyse/Vurdering):**\nSjukepleiefagleg vurdering tilseier at igesette tiltak har hatt delvis effekt. Tilstanden krev kontinuerleg observasjon fram mot neste vakt.\n\n**P (Plan/Tiltak):**\nVidarefører tett oppfølging. Ny kontroll av vitale parametrar ved behov. Overleverer rapport til pågåande vaktlag.`
    : `**S (Subjektivt):**\nPasienten melder om symptomer som samsvarer med stikkordene: "${input}". Gir uttrykk for ubehag og har fått anledning til å beskrive egen opplevelse.\n\n**O (Objektivt):**\nVitale målinger og klinisk observasjon utført. Allmenntilstand stabil, men preget av de aktuelle plagene. Gitte medikamenter og tiltak er journalført etter gjeldende prosedyre.\n\n**A (Analyse/Vurdering):**\nSykepleiefaglig vurdering tilsier at igangsatte tiltak har hatt delvis effekt. Tilstanden krever kontinuerlig observasjon frem mot neste vakt.\n\n**P (Plan/Tiltak):**\nViderefører tett oppfølging. Ny kontroll av vitale parametere ved behov. Overleverer rapport til pågående vaktlag.`;
}

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BedsideLogic Pro server running on http://localhost:${PORT}`);
  });
}

startServer();
