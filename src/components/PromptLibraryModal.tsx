import React, { useState } from 'react';
import { X, Copy, Check, Search, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';
import { CHATGPT_PROMPT_LIBRARY } from '../data/presets';
import { LanguageMode } from '../types';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
}

export const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredPrompts = CHATGPT_PROMPT_LIBRARY.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.badge.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="modal-prompt-library"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#0F6E6E] text-white p-5 sm:p-6 flex items-center justify-between border-b border-[#0B5454]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Prompt-bibliotek for sjukepleiarar</h3>
              <p className="text-xs text-teal-100/90">
                Kvalitetssikra instruksjonar du kan kopiere og lime rett inn i ChatGPT eller Claude.
              </p>
            </div>
          </div>

          <button
            id="btn-close-prompt-library"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Tip Banner */}
        <div className="bg-amber-50 px-5 py-3 border-b border-amber-200 flex items-center space-x-2.5 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>
            <strong>Viktig personvern-regel:</strong> Hugs å aldri lime inn ekte pasientnamn eller
            11-sifra fødselsnummer når du brukar eksterne samtalerobotar som ChatGPT!
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Søk i prompts (f.eks. DIPS, SBAR, sår, rapport)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E6E] text-slate-800"
            />
          </div>
        </div>

        {/* Prompt List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredPrompts.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200 hover:border-teal-600/30 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-[#0F6E6E] px-2 py-0.5 rounded border border-teal-600/20">
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                </div>

                <button
                  id={`btn-copy-prompt-${item.id}`}
                  onClick={() => handleCopy(item.id, item.prompt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all flex-shrink-0 cursor-pointer ${
                    copiedId === item.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#0F6E6E] hover:bg-[#0B5454] text-white'
                  }`}
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Kopiert!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Kopier prompt</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code / Prompt snippet */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 leading-relaxed overflow-x-auto select-all">
                {item.prompt}
              </div>
            </div>
          ))}

          {filteredPrompts.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Ingen prompts matcha søkeordet ditt.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Fleire kvalitetssikra prompts vert lagt til jamleg frå BedsideLogic YouTube-kanalen.
        </div>
      </div>
    </div>
  );
};
