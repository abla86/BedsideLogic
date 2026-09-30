import React from 'react';
import { ShieldCheck, Sparkles, BookOpen, Clock, Crown, Stethoscope, FileCheck } from 'lucide-react';
import { LanguageMode } from '../types';

interface NavbarProps {
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
  isPro: boolean;
  onOpenProModal: () => void;
  onOpenPromptLibrary: () => void;
  onOpenHistory: () => void;
  onOpenEula: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  isPro,
  onOpenProModal,
  onOpenPromptLibrary,
  onOpenHistory,
  onOpenEula,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0F6E6E] text-white shadow-md border-b border-[#0B5454]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
              <div className="relative">
                <Stethoscope className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E8785A] rounded-full border-2 border-[#0F6E6E]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">BedsideLogic</span>
                <span className="bg-[#E8785A] text-white text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider">
                  PRO
                </span>
              </div>
              <p className="text-xs text-teal-100/80 hidden sm:block">
                {language === 'nynorsk' ? 'Klinisk dokumentasjons-makker' : 'Klinisk dokumentasjons-makker'}
              </p>
            </div>
          </div>

          {/* Center: Privacy badge with Guard Dog indication */}
          <div className="hidden md:flex items-center space-x-2 bg-[#0B5454]/80 px-3 py-1.5 rounded-full border border-teal-400/20 text-xs text-teal-100">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guard Dog personvern aktiv (11 & 8-siffer filter)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language toggle: Nynorsk / Bokmål */}
            <div className="bg-[#0B5454] p-0.5 rounded-lg flex items-center text-xs font-semibold border border-white/10">
              <button
                id="btn-lang-nn"
                onClick={() => onLanguageChange('nynorsk')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'nynorsk'
                    ? 'bg-white text-[#0F6E6E] shadow-sm font-bold'
                    : 'text-teal-100 hover:text-white'
                }`}
                title="Skift til Nynorsk"
              >
                NN
              </button>
              <button
                id="btn-lang-bm"
                onClick={() => onLanguageChange('bokmal')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'bokmal'
                    ? 'bg-white text-[#0F6E6E] shadow-sm font-bold'
                    : 'text-teal-100 hover:text-white'
                }`}
                title="Skift til Bokmål"
              >
                BM
              </button>
            </div>

            {/* EULA button */}
            <button
              id="btn-nav-eula"
              type="button"
              onClick={onOpenEula}
              className="p-2 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1.5 text-xs font-medium cursor-pointer"
              title="Sluttbrukaravtale og vilkår (EULA)"
            >
              <FileCheck className="w-4 h-4 text-teal-300" />
              <span className="hidden xl:inline">EULA</span>
            </button>

            {/* Prompt library (Free Tier item) */}
            <button
              id="btn-nav-prompt-library"
              onClick={onOpenPromptLibrary}
              className="p-2 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1.5 text-xs font-medium cursor-pointer"
              title="Opne ChatGPT Prompt-bibliotek"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden lg:inline">Prompts</span>
            </button>

            {/* Local History */}
            <button
              id="btn-nav-history"
              onClick={onOpenHistory}
              className="relative p-2 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-1 text-xs font-medium cursor-pointer"
              title="Sjå lokalt lagra notat"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden lg:inline">{language === 'nynorsk' ? 'Historikk' : 'Historikk'}</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#E8785A] text-white text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Pro Status or Upgrade Button */}
            {isPro ? (
              <button
                id="btn-nav-pro-active"
                onClick={onOpenProModal}
                className="bg-white/15 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-teal-200/30 flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Pro Aktiv</span>
              </button>
            ) : (
              <button
                id="btn-nav-upgrade-pro"
                onClick={onOpenProModal}
                className="bg-[#E8785A] hover:bg-[#D6684B] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm flex items-center space-x-1.5 transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Oppgrader</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
