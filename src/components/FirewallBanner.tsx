import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Wand2,
  Info,
  Hash,
  PhoneCall,
  UserX,
  AlertOctagon,
} from 'lucide-react';
import { PIIStatus } from '../types';

interface FirewallBannerProps {
  piiStatus: PIIStatus;
  onAnonymize: () => void;
  rawTextLength: number;
}

export const FirewallBanner: React.FC<FirewallBannerProps> = ({
  piiStatus,
  onAnonymize,
  rawTextLength,
}) => {
  const hasViolation = piiStatus.hasViolation;

  if (hasViolation) {
    return (
      <div
        id="firewall-alert-box"
        className="rounded-2xl bg-amber-50/90 border-2 border-[#E8785A] p-4 sm:p-5 shadow-sm transition-all animate-in fade-in duration-200 space-y-3"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-[#E8785A] text-white mt-0.5 sm:mt-0 flex-shrink-0 shadow-xs">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  Innsending blokkert
                </span>
                <span className="text-xs font-bold text-[#8A2E1A]">
                  Sensitiv personinformasjon oppdaga i teksten!
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-[#8A2E1A] mt-1 leading-snug">
                Fjern personidentifiserbare data (PII) for å aktivere genereringsknappen
              </h4>
              <p className="text-xs text-[#8A2E1A]/90 mt-0.5 leading-relaxed">
                Appen har detektert mønster som ikkje skal sendast til KI i samsvar med GDPR og helsepersonelloven:
              </p>
            </div>
          </div>

          <button
            id="btn-auto-anonymize"
            type="button"
            onClick={onAnonymize}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#E8785A] hover:bg-[#D6684B] active:bg-[#B84E33] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2 flex-shrink-0 active:scale-95 cursor-pointer ring-2 ring-[#E8785A]/30"
          >
            <Wand2 className="w-4 h-4" />
            <span>Anonymiser no (erstatt med [PERSONVERN-SLETTA])</span>
          </button>
        </div>

        {/* Breakdown of detected items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 border-t border-[#E8785A]/20">
          {piiStatus.hasFodselsnummer && (
            <div className="flex items-center space-x-2 bg-white/90 p-2 rounded-lg border border-amber-200 text-xs text-amber-900">
              <Hash className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <div className="truncate">
                <span className="font-bold text-rose-700">Fødselsnummer (11 siffer):</span>{' '}
                <span className="font-mono text-[11px] bg-amber-100 px-1 rounded">
                  {piiStatus.birthNumberMatches.join(', ')}
                </span>
              </div>
            </div>
          )}

          {piiStatus.hasPhone && (
            <div className="flex items-center space-x-2 bg-white/90 p-2 rounded-lg border border-amber-200 text-xs text-amber-900">
              <PhoneCall className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <div className="truncate">
                <span className="font-bold text-amber-800">Telefonnummer (8 siffer):</span>{' '}
                <span className="font-mono text-[11px] bg-amber-100 px-1 rounded">
                  {piiStatus.phoneMatches.join(', ')}
                </span>
              </div>
            </div>
          )}

          {piiStatus.hasPotentialName && (
            <div className="flex items-center space-x-2 bg-white/90 p-2 rounded-lg border border-amber-200 text-xs text-amber-900">
              <UserX className="w-4 h-4 text-[#8A2E1A] flex-shrink-0" />
              <div className="truncate">
                <span className="font-bold text-[#8A2E1A]">Pasientnamn:</span>{' '}
                <span className="font-mono text-[11px] bg-amber-100 px-1 rounded">
                  {piiStatus.nameMatches.join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Safe status
  return (
    <div
      id="firewall-status-safe"
      className="rounded-xl bg-white border border-[#E2DDD5] p-3 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#2A4444]"
    >
      <div className="flex items-center space-x-2.5">
        <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex-shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-emerald-800">
            {rawTextLength > 0 ? 'Digital brannmur sjekka:' : 'Sanntids personvern-sjekk:'}
          </span>{' '}
          <span className="text-slate-600">
            {rawTextLength > 0
              ? 'Ingen 11-sifra fødselsnummer eller 8-sifra telefonnummer oppdaga i teksten.'
              : 'Skriv eller dikter stikkord. Verktøyet blokkerer automatisk ved fødselsnummer eller telefonnummer.'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-slate-500 self-end sm:self-auto">
        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200/80">
          Guard Dog Aktiv
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">Clean-Box GDPR</span>
      </div>
    </div>
  );
};
