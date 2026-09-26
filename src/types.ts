export type NoteType = 'soap' | 'sbar' | 'patient' | 'forenkling' | 'checklist';

export interface MalTemplate {
  id: NoteType;
  key: string;
  label: string;
  shortLabel: string;
  badge: string;
  targetSystem: string;
  description: string;
  defaultPrompt: string;
  structureSummary: string[];
}

export type LanguageMode = 'nynorsk' | 'bokmal';

export type ToneMode = 'klinisk' | 'kompakt' | 'utdjupt';

export interface PIIStatus {
  hasFodselsnummer: boolean;
  hasPhone: boolean;
  hasPotentialName: boolean;
  matches: string[];
}

export interface GeneratedNote {
  id: string;
  timestamp: number;
  type: NoteType;
  language: LanguageMode;
  rawInput: string;
  output: string;
  isFavorite?: boolean;
}

export interface PresetCase {
  id: string;
  title: string;
  category: string;
  type: NoteType;
  description: string;
  rawText: string;
}

export interface SubscriptionState {
  isPro: boolean;
  freeGenerationsUsed: number;
  freeGenerationsLimit: number;
}
