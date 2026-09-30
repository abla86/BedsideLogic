import { PIIStatus } from '../types';

/**
 * Regular expressions for real-time validation of sensitive PII in healthcare text.
 */
// 11 digits: Norwegian fødselsnummer / D-nummer (DDMMYY XXXXX, DDMMYY-XXXXX, or 11 continuous digits)
export const BIRTH_NUMBER_REGEX = /\b(?:\d{6}[-\s]\d{5}|\d{11})\b/g;

// 8 digits: Norwegian phone numbers (8 continuous digits, or standard groupings like 2+2+2+2 or 3+2+3, with optional +47 / 0047)
export const PHONE_NUMBER_REGEX = /\b(?:\+47[-\s]?|0047[-\s]?)?(?:[49]\d{7}|[235678]\d{7}|\d{2}[-\s]\d{2}[-\s]\d{2}[-\s]\d{2}|\d{3}[-\s]\d{2}[-\s]\d{3})\b/g;

// Explicit name indicator patterns (e.g., "Pasient Ola Nordmann", "innlagt Kari Hansen", "fru Olsen", "herr Berg")
export const POTENTIAL_NAME_REGEX = /\b(?:pasient|innlagt|fru|herr|pårørande|pårørende)\s+([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)/gi;

/**
 * Scans text in real-time for patterns resembling birth numbers (11 digits),
 * phone numbers (8 digits), and explicit patient names.
 */
export function checkPII(text: string): PIIStatus {
  if (!text || text.trim().length === 0) {
    return {
      hasFodselsnummer: false,
      hasPhone: false,
      hasPotentialName: false,
      hasViolation: false,
      matches: [],
      birthNumberMatches: [],
      phoneMatches: [],
      nameMatches: [],
    };
  }

  // 11 digits check
  const fnrMatches = text.match(BIRTH_NUMBER_REGEX) || [];
  const uniqueFnr = Array.from(new Set(fnrMatches));

  // 8 digits check
  const phoneMatches = text.match(PHONE_NUMBER_REGEX) || [];
  const uniquePhones = Array.from(new Set(phoneMatches));

  // Explicit name check
  const nameMatches: string[] = [];
  let nameMatch: RegExpExecArray | null;
  const nameRegexCopy = new RegExp(POTENTIAL_NAME_REGEX.source, 'gi');
  while ((nameMatch = nameRegexCopy.exec(text)) !== null) {
    if (nameMatch[1]) {
      nameMatches.push(nameMatch[0]);
    }
  }
  const uniqueNames = Array.from(new Set(nameMatches));

  const allMatches: string[] = [
    ...uniqueFnr.map((m) => `Fødselsnummer (11 siffer: ${m})`),
    ...uniquePhones.map((m) => `Telefonnummer (8 siffer: ${m})`),
    ...uniqueNames.map((m) => `Mogleg pasientnamn (${m})`),
  ];

  const hasFnr = uniqueFnr.length > 0;
  const hasPhone = uniquePhones.length > 0;
  const hasName = uniqueNames.length > 0;

  return {
    hasFodselsnummer: hasFnr,
    hasPhone: hasPhone,
    hasPotentialName: hasName,
    hasViolation: hasFnr || hasPhone || hasName,
    matches: allMatches,
    birthNumberMatches: uniqueFnr,
    phoneMatches: uniquePhones,
    nameMatches: uniqueNames,
  };
}

/**
 * Replaces detected PII (birth numbers, phone numbers, names) with [PERSONVERN-SLETTA].
 * Ensures no real identifying data is leaked or forwarded to the AI model.
 */
export function anonymizeText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Replace 11-digit birth numbers
  cleaned = cleaned.replace(BIRTH_NUMBER_REGEX, '[PERSONVERN-SLETTA]');

  // 2. Replace 8-digit phone numbers
  cleaned = cleaned.replace(PHONE_NUMBER_REGEX, '[PERSONVERN-SLETTA]');

  // 3. Replace patient/relative names
  cleaned = cleaned.replace(
    POTENTIAL_NAME_REGEX,
    (_match, _name) => `[PERSONVERN-SLETTA]`
  );

  return cleaned;
}
