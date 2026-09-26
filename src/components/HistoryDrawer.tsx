import React, { useState } from 'react';
import { X, Trash2, Copy, Check, Clock, FileText, Send, MessageSquare, ListChecks } from 'lucide-react';
import { GeneratedNote, LanguageMode } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notes: GeneratedNote[];
  onDeleteNote: (id: string) => void;
  onClearAll: () => void;
  language: LanguageMode;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  notes,
  onDeleteNote,
  onClearAll,
  language,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('no-NO', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(new Date(timestamp));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'soap':
        return <FileText className="w-4 h-4 text-[#0F6E6E]" />;
      case 'sbar':
        return <Send className="w-4 h-4 text-[#0F6E6E]" />;
      case 'patient':
      case 'forenkling':
        return <MessageSquare className="w-4 h-4 text-[#0F6E6E]" />;
      default:
        return <ListChecks className="w-4 h-4 text-[#0F6E6E]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
      <div
        id="drawer-history"
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="p-5 bg-[#0F6E6E] text-white flex items-center justify-between border-b border-[#0B5454]">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-teal-200" />
            <div>
              <h3 className="font-bold text-base">Vakthistorikk</h3>
              <p className="text-xs text-teal-100/80">Lagra kun lokalt i denne nettlesaren</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {notes.length > 0 && (
              <button
                id="btn-clear-all-history"
                onClick={onClearAll}
                className="p-2 text-teal-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center space-x-1 cursor-pointer"
                title="Slett alle notat ved vaktslutt"
              >
                <Trash2 className="w-4 h-4" />
                <span>Tøm</span>
              </button>
            )}
            <button
              id="btn-close-history"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl bg-[#FAF8F5] border border-slate-200 hover:border-slate-300 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded bg-white border border-slate-200">
                    {getIcon(note.type)}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {note.type.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400">• {formatTime(note.timestamp)}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    id={`btn-copy-history-${note.id}`}
                    onClick={() => handleCopy(note.id, note.output)}
                    className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                      copiedId === note.id
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-slate-600 hover:bg-white hover:text-[#0F6E6E]'
                    }`}
                    title="Kopier notat"
                  >
                    {copiedId === note.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    id={`btn-delete-history-${note.id}`}
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Slett dette notatet"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Raw snippet */}
              <p className="text-[11px] text-slate-500 line-clamp-1 italic bg-white p-1.5 rounded border border-slate-100">
                &quot;{note.rawInput}&quot;
              </p>

              {/* Formatted output snippet */}
              <div className="text-xs text-slate-800 whitespace-pre-line line-clamp-4 leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-slate-200">
                {note.output}
              </div>
            </div>
          ))}

          {notes.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">Ingen lagra notat på denne vakta enno.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Genererte notat vil dukke opp her slik at du kan finne dei att før rapport.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
          Hugs å trykke <strong>Tøm</strong> ved vaktslutt for å slette notata frå denne eininga.
        </div>
      </div>
    </div>
  );
};
