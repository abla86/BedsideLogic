import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DocumentationGenerator } from './components/DocumentationGenerator';
import { ProModal } from './components/ProModal';
import { PromptLibraryModal } from './components/PromptLibraryModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { EulaModal } from './components/EulaModal';
import { LanguageMode, GeneratedNote } from './types';
import { Sparkles, Clock, CheckCircle2, Shield } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<LanguageMode>(() => {
    return (localStorage.getItem('bedsidelogic_lang') as LanguageMode) || 'nynorsk';
  });

  const [isPro, setIsPro] = useState<boolean>(() => {
    return localStorage.getItem('bedsidelogic_is_pro') === 'true';
  });

  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState<number>(() => {
    const saved = localStorage.getItem('bedsidelogic_free_used');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [savedNotes, setSavedNotes] = useState<GeneratedNote[]>(() => {
    try {
      const saved = localStorage.getItem('bedsidelogic_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isEulaOpen, setIsEulaOpen] = useState<boolean>(false);
  const [isEulaAccepted, setIsEulaAccepted] = useState<boolean>(() => {
    return localStorage.getItem('bedsidelogic_eula_accepted') === 'true';
  });

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem('bedsidelogic_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('bedsidelogic_is_pro', String(isPro));
  }, [isPro]);

  useEffect(() => {
    localStorage.setItem('bedsidelogic_free_used', String(freeGenerationsUsed));
  }, [freeGenerationsUsed]);

  useEffect(() => {
    localStorage.setItem('bedsidelogic_notes', JSON.stringify(savedNotes));
  }, [savedNotes]);

  const handleTogglePro = () => {
    setIsPro((prev) => !prev);
  };

  const handleSaveNote = (note: GeneratedNote) => {
    setSavedNotes((prev) => [note, ...prev.slice(0, 49)]); // keep up to 50 local notes
    if (!isPro) {
      setFreeGenerationsUsed((prev) => prev + 1);
    }
  };

  const handleDeleteNote = (id: string) => {
    setSavedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotes = () => {
    if (
      window.confirm(
        language === 'nynorsk'
          ? 'Er du sikker på at du vil tømme all lokal vakthistorikk?'
          : 'Er du sikker på at du vil tømme all lokal vakthistorikk?'
      )
    ) {
      setSavedNotes([]);
    }
  };

  const handleAcceptEula = () => {
    setIsEulaAccepted(true);
    localStorage.setItem('bedsidelogic_eula_accepted', 'true');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F2] text-[#1D2E2E] font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        isPro={isPro}
        onOpenProModal={() => setIsProModalOpen(true)}
        onOpenPromptLibrary={() => setIsPromptLibraryOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenEula={() => setIsEulaOpen(true)}
        savedCount={savedNotes.length}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Value Proposition Header Banner */}
        <div className="bg-gradient-to-r from-[#0F6E6E] via-[#125858] to-[#0A4545] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-teal-100 mb-3 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#E8785A]" />
              <span>
                {language === 'nynorsk'
                  ? 'Praktisk KI for sjukepleiarar – ærleg, evidensbasert og trygt'
                  : 'Praktisk KI for sykepleiere – ærlig, evidensbasert og trygt'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {language === 'nynorsk' ? (
                <>
                  Gjer rotete stikkord om til{' '}
                  <span className="text-[#E8785A] underline decoration-white/20">
                    DIPS-klare notat
                  </span>{' '}
                  på 10 sekund.
                </>
              ) : (
                <>
                  Gjør rotete stikkord om til{' '}
                  <span className="text-[#E8785A] underline decoration-white/20">
                    DIPS-klare notater
                  </span>{' '}
                  på 10 sekunder.
                </>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-teal-100/90 mt-2 leading-relaxed">
              {language === 'nynorsk'
                ? 'Strukturer SOAP-notat for journalen, førebu SBAR-overlevering til lege, eller forenkle medisinsk fagspråk for pårørande med Guard Dog-sikring og null serverlagring.'
                : 'Strukturer SOAP-notat for journalen, forbered SBAR-overlevering til lege, eller forenkle medisinsk fagspråk for pårørende med Guard Dog-sikring og null serverlagring.'}
            </p>

            {/* Shift efficiency metrics */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <div className="flex items-center space-x-1 text-[11px] text-teal-200">
                  <Clock className="w-3 h-3 text-[#E8785A]" />
                  <span>Tidssparing</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">30–45 min</div>
                <div className="text-[10px] text-teal-200/70">per sjukepleiarvakt</div>
              </div>

              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <div className="flex items-center space-x-1 text-[11px] text-teal-200">
                  <Shield className="w-3 h-3 text-emerald-300" />
                  <span>Personvern</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">Guard Dog</div>
                <div className="text-[10px] text-teal-200/70">null serverlagring</div>
              </div>

              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 col-span-2 sm:col-span-1">
                <div className="flex items-center space-x-1 text-[11px] text-teal-200">
                  <CheckCircle2 className="w-3 h-3 text-teal-300" />
                  <span>Format</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">SOAP / SBAR</div>
                <div className="text-[10px] text-teal-200/70">standardisert struktur</div>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Generator Workspace */}
        <DocumentationGenerator
          language={language}
          isPro={isPro}
          freeGenerationsUsed={freeGenerationsUsed}
          freeGenerationsLimit={3}
          onOpenProModal={() => setIsProModalOpen(true)}
          onSaveNote={handleSaveNote}
          onOpenEula={() => setIsEulaOpen(true)}
        />
      </main>

      {/* Educational and Legal Disclaimer Footer */}
      <DisclaimerFooter language={language} onOpenEula={() => setIsEulaOpen(true)} />

      {/* Pro Monetization Modal */}
      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        isPro={isPro}
        onTogglePro={handleTogglePro}
        language={language}
      />

      {/* ChatGPT Prompt Library Modal */}
      <PromptLibraryModal
        isOpen={isPromptLibraryOpen}
        onClose={() => setIsPromptLibraryOpen(false)}
        language={language}
      />

      {/* Shift Notes History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        notes={savedNotes}
        onDeleteNote={handleDeleteNote}
        onClearAll={handleClearAllNotes}
        language={language}
      />

      {/* End-User License Agreement (EULA) Modal */}
      <EulaModal
        isOpen={isEulaOpen}
        onClose={() => setIsEulaOpen(false)}
        language={language}
        onAccept={handleAcceptEula}
        isAccepted={isEulaAccepted}
      />
    </div>
  );
}
