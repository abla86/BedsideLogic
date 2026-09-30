import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Mic,
  MicOff,
  Clock,
  ListChecks,
  MessageSquare,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  Code2,
  Info,
  Layers,
  ShieldCheck,
  Wand2,
  Lock,
} from 'lucide-react';
import { NoteType, LanguageMode, ToneMode, PIIStatus, GeneratedNote } from '../types';
import { CLINICAL_PRESETS } from '../data/presets';
import { CLINICAL_MALER, getMalTemplate } from '../data/templates';
import { checkPII, anonymizeText } from '../utils/security';
import { FirewallBanner } from './FirewallBanner';

interface DocumentationGeneratorProps {
  language: LanguageMode;
  isPro: boolean;
  freeGenerationsUsed: number;
  freeGenerationsLimit: number;
  onOpenProModal: () => void;
  onSaveNote: (note: GeneratedNote) => void;
  onOpenEula: () => void;
}

export const DocumentationGenerator: React.FC<DocumentationGeneratorProps> = ({
  language,
  isPro,
  freeGenerationsUsed,
  freeGenerationsLimit,
  onOpenProModal,
  onSaveNote,
  onOpenEula,
}) => {
  // Active template selection: defaults to SOAP
  const [activeType, setActiveType] = useState<NoteType>('soap');
  // Active system-prompt dispatched to API (includes Guard Dog layer by default)
  const [activeSystemPrompt, setActiveSystemPrompt] = useState<string>(() => {
    return getMalTemplate('soap').defaultPrompt;
  });
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState<boolean>(false);
  const [promptCopied, setPromptCopied] = useState<boolean>(false);

  const [tone, setTone] = useState<ToneMode>('klinisk');
  const [rawInput, setRawInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [piiStatus, setPiiStatus] = useState<PIIStatus>({
    hasFodselsnummer: false,
    hasPhone: false,
    hasPotentialName: false,
    hasViolation: false,
    matches: [],
    birthNumberMatches: [],
    phoneMatches: [],
    nameMatches: [],
  });
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const currentTemplate = getMalTemplate(activeType);
  const isCustomPromptModified = activeSystemPrompt.trim() !== currentTemplate.defaultPrompt.trim();

  // Real-time regex validation for 11 digits (fødselsnummer) & 8 digits (telefonnummer)
  useEffect(() => {
    const status = checkPII(rawInput);
    setPiiStatus(status);
  }, [rawInput]);

  // Voice-to-Text SpeechRecognition initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'no-NO';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setRawInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Tale-til-tekst feil:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!isPro) {
      onOpenProModal();
      return;
    }

    if (!recognitionRef.current) {
      alert(
        language === 'nynorsk'
          ? 'Nettlesaren din støttar diverre ikkje direkte stemmeopptak. Skriv inn notatet direkte i feltet.'
          : 'Nettleseren din støtter dessverre ikke direkte taleopptak. Skriv inn notatet direkte i feltet.'
      );
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Kunne ikkje starte diktering:', err);
      }
    }
  };

  const handleAnonymize = () => {
    const cleaned = anonymizeText(rawInput);
    setRawInput(cleaned);
  };

  // Mal-velger action: Switches template AND updates active system prompt
  const handleSelectMal = (type: NoteType) => {
    setActiveType(type);
    const tmpl = getMalTemplate(type);
    setActiveSystemPrompt(tmpl.defaultPrompt);
    setStatusMessage(null);
  };

  // Reset system prompt to current template's default
  const handleResetSystemPrompt = () => {
    const tmpl = getMalTemplate(activeType);
    setActiveSystemPrompt(tmpl.defaultPrompt);
  };

  // Preset selection: sets input and matching mal
  const handleSelectPreset = (presetText: string, presetType: NoteType) => {
    const normalizedType: NoteType = presetType === 'patient' ? 'forenkling' : presetType;
    handleSelectMal(normalizedType);
    setRawInput(presetText);
  };

  // Copy system prompt helper
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(activeSystemPrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  // PII blocking condition: strict enforcement
  const isBlockedByPII = piiStatus.hasViolation;

  // Generate note using active system prompt & input
  const handleGenerate = async () => {
    // Check free limit
    if (!isPro && freeGenerationsUsed >= freeGenerationsLimit) {
      onOpenProModal();
      return;
    }

    if (!rawInput.trim()) {
      return;
    }

    // Strict safety check: If any PII pattern remains, auto-anonymize or abort
    if (isBlockedByPII) {
      handleAnonymize();
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: rawInput,
          type: activeType,
          language,
          tone,
          systemPrompt: activeSystemPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Noko gjekk gale under generering.');
      }

      setOutput(data.result);
      if (data.message) {
        setStatusMessage(data.message);
      }

      // Save to local history
      const newNote: GeneratedNote = {
        id: `note-${Date.now()}`,
        timestamp: Date.now(),
        type: activeType,
        language,
        rawInput,
        output: data.result,
      };
      onSaveNote(newNote);
    } catch (err: any) {
      console.error('Generering feila:', err);
      setStatusMessage(err.message || 'Kunne ikkje generere notat. Prøv igjen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getMalIcon = (key: string) => {
    switch (key) {
      case 'soap':
        return FileText;
      case 'sbar':
        return Send;
      case 'forenkling':
      case 'patient':
        return MessageSquare;
      default:
        return ListChecks;
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* MAL-VELGER (SOAP, SBAR, Forenkling)                                      */}
      {/* Oppdaterer den aktive system-prompten før API-kallet blir sendt           */}
      {/* ========================================================================= */}
      <div
        id="mal-velger-section"
        className="bg-white rounded-2xl p-5 border border-[#E2DDD5] shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-[#0F6E6E] border border-teal-100">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0F6E6E] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Mal-velger
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  (SOAP • SBAR • Forenkling)
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight mt-0.5">
                {language === 'nynorsk'
                  ? 'Vel mal for klinisk dokumentasjon'
                  : 'Velg mal for klinisk dokumentasjon'}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">Aktiv prompt:</span>
            <span className="inline-flex items-center space-x-1.5 font-bold text-[#0F6E6E] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-[#0F6E6E] animate-pulse" />
              <span>{currentTemplate.label}</span>
            </span>
          </div>
        </div>

        {/* Mal Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CLINICAL_MALER.map((mal) => {
            const Icon = getMalIcon(mal.key);
            const isSelected = activeType === mal.id;

            return (
              <button
                key={mal.id}
                id={`mal-btn-${mal.key}`}
                type="button"
                onClick={() => handleSelectMal(mal.id)}
                className={`p-3.5 rounded-xl text-left transition-all relative flex flex-col justify-between cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0F6E6E] text-white border-[#0F6E6E] shadow-sm ring-2 ring-[#0F6E6E]/20'
                    : 'bg-[#F8F6F2] hover:bg-[#F2EFE9] text-[#1D2E2E] border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-teal-100'
                          : 'bg-white text-[#0F6E6E] border border-teal-600/10'
                      }`}
                    >
                      {mal.badge}
                    </span>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-200' : 'text-slate-400'}`} />
                  </div>

                  <div className="flex items-baseline space-x-1.5">
                    <h3 className="font-extrabold text-sm">{mal.shortLabel}</h3>
                    <span
                      className={`text-xs ${
                        isSelected ? 'text-teal-100' : 'text-slate-500 font-medium'
                      }`}
                    >
                      {mal.id === 'soap'
                        ? '• Journal'
                        : mal.id === 'sbar'
                        ? '• Overlevering'
                        : mal.id === 'forenkling'
                        ? '• Pasient'
                        : '• Sjekkliste'}
                    </span>
                  </div>

                  <p
                    className={`text-[11px] mt-1.5 line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-teal-100/90' : 'text-slate-600'
                    }`}
                  >
                    {mal.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[10px]">
                  <span className={isSelected ? 'text-teal-200' : 'text-slate-400'}>
                    {mal.targetSystem}
                  </span>
                  {isSelected && (
                    <span className="flex items-center space-x-1 text-teal-200 font-bold">
                      <Check className="w-3 h-3" />
                      <span>Valt</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* AKTIV SYSTEM-PROMPT MED GUARD DOG LAYER                                   */}
        {/* ========================================================================= */}
        <div
          id="active-system-prompt-panel"
          className="rounded-xl border border-teal-900/15 bg-gradient-to-r from-teal-50/50 via-[#FAF8F5] to-teal-50/30 p-3.5 transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-[#0F6E6E] text-white flex-shrink-0">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800">
                    Aktiv system-prompt for {currentTemplate.label}
                  </span>
                  <span className="text-[10px] font-bold text-[#0F6E6E] bg-teal-100/80 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-[#0F6E6E]" />
                    <span>Guard Dog PII-lag inkludert</span>
                  </span>
                  {isCustomPromptModified && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Tilpassa av brukar
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sendast direkte med API-kallet til Gemini for å styre struktur og tryggleik.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-center">
              {isCustomPromptModified && (
                <button
                  id="btn-reset-system-prompt"
                  type="button"
                  onClick={handleResetSystemPrompt}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center space-x-1 cursor-pointer"
                  title="Tilbakestill til standard system-prompt for denne malen"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Tilbakestill</span>
                </button>
              )}

              <button
                id="btn-toggle-prompt-editor"
                type="button"
                onClick={() => setIsPromptEditorOpen((prev) => !prev)}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-[#0F6E6E] bg-white hover:bg-teal-50 border border-teal-200/80 shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{isPromptEditorOpen ? 'Skjul system-prompt' : 'Vis / tilpass prompt'}</span>
                {isPromptEditorOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable System-Prompt Editor */}
          {isPromptEditorOpen && (
            <div className="mt-3 pt-3 border-t border-teal-900/10 space-y-3 animate-in fade-in duration-150">
              {/* Structure preview bullets */}
              <div className="bg-white/80 rounded-lg p-2.5 border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-[#0F6E6E]" />
                  <span>Strukturkrav for {currentTemplate.shortLabel}:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                  {currentTemplate.structureSummary.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5">
                      <span className="text-[#0F6E6E] font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Textarea for active system-prompt */}
              <div>
                <div className="flex items-center justify-between pb-1.5 text-[11px] text-slate-500">
                  <span>Redigerbar system-instruksjon (oppdaterer API-kallet i sanntid):</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="text-[#0F6E6E] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      {promptCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Kopiert!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Kopier prompt</span>
                        </>
                      )}
                    </button>
                    <span>•</span>
                    <span>{activeSystemPrompt.length} teikn</span>
                  </div>
                </div>

                <textarea
                  id="textarea-active-system-prompt"
                  rows={6}
                  value={activeSystemPrompt}
                  onChange={(e) => setActiveSystemPrompt(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0F6E6E] focus:border-transparent outline-none transition-all text-slate-800 leading-relaxed shadow-inner"
                  placeholder="System-prompt som styrer KI-modellen..."
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="italic">
                  Tips: Guard Dog-laget er alltid aktivt og erstattar namn, 11-sifra personnr og 8-sifra tlf med [PERSONVERN-SLETTA].
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preset Scenarios Carousel for Instant Testing */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-[#E8785A]" />
            <span className="font-semibold text-slate-800">Kliniske døme (test med eitt klikk):</span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Klikk for å laste inn fiktive stikkord og automatisk velje passande mal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {CLINICAL_PRESETS.slice(0, 3).map((preset) => (
            <button
              key={preset.id}
              id={`btn-preset-${preset.id}`}
              type="button"
              onClick={() => handleSelectPreset(preset.rawText, preset.type)}
              className="p-2.5 text-left rounded-xl bg-white border border-[#E2DDD5] hover:border-[#0F6E6E] hover:bg-teal-50/40 transition-all text-xs group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-[#0F6E6E] bg-teal-50 px-1.5 py-0.5 rounded">
                  {preset.category}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  {preset.type === 'patient' ? 'FORENKLING' : preset.type.toUpperCase()}
                </span>
              </div>
              <p className="font-semibold text-slate-800 group-hover:text-[#0F6E6E] transition-colors leading-snug">
                {preset.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Firewall Banner */}
      <FirewallBanner
        piiStatus={piiStatus}
        onAnonymize={handleAnonymize}
        rawTextLength={rawInput.length}
      />

      {/* Main Workspace Grid (Input & Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Input Column */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2DDD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F6E6E]" />
              <h2 className="font-bold text-sm text-slate-800">
                {language === 'nynorsk' ? 'Stikkord og observasjonar' : 'Stikkord og observasjoner'}
              </h2>
            </div>

            {/* Voice Dictation (Pro feature badge) */}
            <div className="flex items-center space-x-2">
              <button
                id="btn-voice-dictate"
                type="button"
                onClick={toggleVoiceRecording}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white recording-pulse'
                    : isPro
                    ? 'bg-teal-50 text-[#0F6E6E] hover:bg-teal-100 border border-teal-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={isPro ? 'Start/stopp diktering' : 'Tale-til-tekst krev Pro'}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Tek opp...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-[#E8785A]" />
                    <span>Dikter</span>
                    {!isPro && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 rounded">
                        PRO
                      </span>
                    )}
                  </>
                )}
              </button>

              {rawInput && (
                <button
                  id="btn-clear-input"
                  type="button"
                  onClick={() => setRawInput('')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Tøm felt"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              id="textarea-clinical-input"
              rows={8}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={
                activeType === 'soap'
                  ? 'Skriv inn ustrukturerte stikkord: F.eks: "Pasient urolig kl 02, smerter h. hofte, 1g paracet kl 02.30, sovna kl 03.15, stabil puls 78, BT 130/80..."'
                  : activeType === 'sbar'
                  ? 'Stikkord for legetilsyn: Romnummer, akutte endringar, NEWS2-målingar og kva du ønskjer legen skal gjere...'
                  : activeType === 'forenkling' || activeType === 'patient'
                  ? 'Lim inn eller skriv inn medisinsk fagtekst som pasienten eller pårørande treng å få forklart på eit enkelt norsk...'
                  : 'Kva pasientsituasjon eller avdeling gjeld dette? F.eks: Nyoperert hofte, palliativ pasient, KOLS-innlegging...'
              }
              className={`w-full p-3.5 text-sm bg-[#FAF8F5] border rounded-xl focus:ring-2 focus:ring-[#0F6E6E] focus:border-transparent outline-none transition-all resize-y font-normal text-slate-800 placeholder:text-slate-400 ${
                isBlockedByPII ? 'border-[#E8785A] ring-1 ring-[#E8785A]/30' : 'border-slate-200'
              }`}
            />
          </div>

          {/* Input Controls: Tone & Stats */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Format-tone:</span>
              <div className="bg-[#F8F6F2] p-1 rounded-lg border border-slate-200 flex space-x-1 text-xs">
                {(['klinisk', 'kompakt', 'utdjupt'] as ToneMode[]).map((t) => (
                  <button
                    key={t}
                    id={`btn-tone-${t}`}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-all ${
                      tone === t
                        ? 'bg-white text-[#0F6E6E] shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t === 'klinisk' ? 'Standard' : t === 'kompakt' ? 'Kompakt' : 'Utdjupande'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              {rawInput.split(/\s+/).filter(Boolean).length} ord • {rawInput.length} teikn
            </div>
          </div>

          {/* REAL-TIME VALIDATION WARNING MESSAGE (If 11-digit or 8-digit PII detected) */}
          {isBlockedByPII && (
            <div
              id="pii-blocked-warning"
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-rose-900 animate-in fade-in duration-150"
            >
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-rose-800">
                    Generering er sperra inntil teksten er anonymisert:
                  </div>
                  <div className="text-[11px] text-rose-700 mt-0.5">
                    {piiStatus.hasFodselsnummer && piiStatus.hasPhone
                      ? 'Oppdaga både mønster for fødselsnummer (11 siffer) og telefonnummer (8 siffer).'
                      : piiStatus.hasFodselsnummer
                      ? 'Oppdaga mønster som liknar fødselsnummer (11 siffer).'
                      : piiStatus.hasPhone
                      ? 'Oppdaga mønster som liknar telefonnummer (8 siffer).'
                      : 'Oppdaga pasientnamn.'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAnonymize}
                className="w-full sm:w-auto px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-lg font-bold text-xs whitespace-nowrap cursor-pointer transition-colors shadow-xs flex items-center justify-center space-x-1.5 flex-shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Anonymiser no (1-klikk)</span>
              </button>
            </div>
          )}

          {/* Submit Button: Strictly disabled if isBlockedByPII, empty, or loading */}
          <button
            id="btn-generate-note"
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !rawInput.trim() || isBlockedByPII}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer ${
              isLoading
                ? 'bg-teal-700 text-teal-200 cursor-wait'
                : !rawInput.trim()
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isBlockedByPII
                ? 'bg-rose-100 text-rose-700 border border-rose-300 cursor-not-allowed shadow-none'
                : 'bg-[#0F6E6E] hover:bg-[#0B5454] text-white active:scale-[0.99] shadow-md hover:shadow-lg'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Genererer med aktiv {currentTemplate.label}-prompt...</span>
              </>
            ) : isBlockedByPII ? (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>
                  {piiStatus.hasFodselsnummer && piiStatus.hasPhone
                    ? 'Sperra: Anonymiser 11-sifra personnr og 8-sifra tlf først'
                    : piiStatus.hasFodselsnummer
                    ? 'Sperra: Anonymiser 11-sifra fødselsnummer først'
                    : piiStatus.hasPhone
                    ? 'Sperra: Anonymiser 8-sifra telefonnummer først'
                    : 'Sperra: Anonymiser pasientnamn først'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-teal-200" />
                <span>Generer {currentTemplate.label} (under 10 sek)</span>
              </>
            )}
          </button>

          {/* Legal / EULA notice directly under the action */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
              <span>Null serverlagring • Formuleringsverktøy, ikkje journal</span>
            </div>
            <button
              type="button"
              onClick={onOpenEula}
              className="text-[#0F6E6E] hover:underline font-semibold text-left sm:text-right cursor-pointer"
            >
              Sluttbrukaravtale (EULA) →
            </button>
          </div>

          {/* Usage counter for free tier */}
          {!isPro && (
            <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
              <span>
                Gratis-kvote: {Math.max(0, freeGenerationsLimit - freeGenerationsUsed)} av{' '}
                {freeGenerationsLimit} att denne veka
              </span>
              <button
                id="btn-upgrade-hint"
                type="button"
                onClick={onOpenProModal}
                className="text-[#E8785A] font-bold hover:underline cursor-pointer"
              >
                Få uavgrensa med Pro →
              </button>
            </div>
          )}
        </div>

        {/* Output Column */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2DDD5] shadow-xs flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8785A]" />
              <h2 className="font-bold text-sm text-slate-800">
                {language === 'nynorsk'
                  ? 'Ferdig strukturert notat (klart for journal)'
                  : 'Ferdig strukturert notat (klart for journal)'}
              </h2>
            </div>

            {output && (
              <button
                id="btn-copy-output"
                type="button"
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#0F6E6E] hover:bg-[#0B5454] text-white shadow-xs'
                }`}
                title="Kopier teksten til utklippstavle"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Kopiert til DIPS!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Kopier notat</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Output Display Area */}
          <div className="flex-1 min-h-[300px] relative">
            {output ? (
              <div className="p-4 bg-[#FAF8F5] border border-slate-200 rounded-xl space-y-3 font-normal text-sm leading-relaxed text-slate-800 select-text">
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-200 text-slate-500">
                  <span className="font-semibold text-[#0F6E6E]">
                    {currentTemplate.label} • {language === 'nynorsk' ? 'Nynorsk' : 'Bokmål'}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <FileCheck className="w-3 h-3" />
                    <span>Kvalitetssikra struktur</span>
                  </span>
                </div>

                <div className="whitespace-pre-line text-slate-800 font-sans">{output}</div>

                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-teal-700">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimert tidssparing: ca. 12–15 minutt</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Hugs: Kontroller alltid opplysningane før innføring i journal (jf. EULA).
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[280px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-700 mb-1">
                  Ingen journaltekst generert enno
                </h4>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Vel ein mal (SOAP, SBAR eller Forenkling), skriv eller dikter stikkorda dine til
                  venstre. Guard Dog-brannmuren passar på at ingen fødselsnummer eller telefonnummer
                  blir sendt vidare.
                </p>
              </div>
            )}
          </div>

          {statusMessage && (
            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
