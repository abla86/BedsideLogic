import { PIIStatus } from '../types';

export function checkPII(text: string): PIIStatus {
  if (!text) {
    return {
      hasFodselsnummer: false,
      hasPhone: false,
      hasPotentialName: false,
      matches: [],
    };
  }

  const matches: string[] = [];

  // 11 digits fødselsnummer (DDMMYY XXXXX or 11 continuous digits)
  const fnrRegex = /\b\d{6}\s?\d{5}\b|\b\d{11}\b/g;
  const fnrMatches = text.match(fnrRegex);
  if (fnrMatches && fnrMatches.length > 0) {
    matches.push(...fnrMatches.map((m) => `Fødselsnummer (${m})`));
  }

  // 8 digits phone numbers
  const phoneRegex = /\b(?:\+47\s?)?[49]\d{2}\s?\d{2}\s?\d{3}\b|\b\d{8}\b/g;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches && phoneMatches.length > 0) {
    matches.push(...phoneMatches.map((m) => `Telefonnummer (${m})`));
  }

  // Potential explicit name patterns (e.g., "Pasient Kari Hansen", "fru Olsen", "herr Berg")
  const nameRegex = /\b(?:pasient|fru|herr|innlagt)\s+([A-ZÆØÅ][a-zæøå]+\s+[A-ZÆØÅ][a-zæøå]+)/gi;
  const nameMatches = text.match(nameRegex);
  if (nameMatches && nameMatches.length > 0) {
    matches.push(...nameMatches.map((m) => `Mogleg pasientnamn (${m})`));
  }

  return {
    hasFodselsnummer: Boolean(fnrMatches && fnrMatches.length > 0),
    hasPhone: Boolean(phoneMatches && phoneMatches.length > 0),
    hasPotentialName: Boolean(nameMatches && nameMatches.length > 0),
    matches,
  };
}

export function anonymizeText(text: string): string {
  let cleaned = text;

  // Replace 11 digit numbers
  cleaned = cleaned.replace(/\b\d{6}\s?\d{5}\b|\b\d{11}\b/g, '[PERSONVERN-SLETTA]');

  // Replace 8 digit numbers
  cleaned = cleaned.replace(/\b(?:\+47\s?)?[49]\d{2}\s?\d{2}\s?\d{3}\b|\b\d{8}\b/g, '[PERSONVERN-SLETTA]');

  // Replace matched names
  cleaned = cleaned.replace(/\b(pasient|fru|herr|innlagt)\s+([A-ZÆØÅ][a-zæøå]+(\s+[A-ZÆØÅ][a-zæøå]+)?)/gi, '$1 [PERSONVERN-SLETTA]');

  return cleaned;
}
