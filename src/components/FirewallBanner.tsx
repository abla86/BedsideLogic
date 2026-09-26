import React from 'react';
import { ShieldAlert, ShieldCheck, Wand2, Info } from 'lucide-react';
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
  const hasViolation =
    piiStatus.hasFodselsnummer || piiStatus.hasPhone || piiStatus.hasPotentialName;

  if (hasViolation) {
    return (
      <div
        id="firewall-alert-box"
        className="rounded-xl bg-amber-50 border-2 border-[#E8785A] p-4 shadow-sm transition-all animate-in fade-in duration-200"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-[#E8785A]/15 text-[#E8785A] mt-0.5 sm:mt-0 flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#8A2E1A] flex items-center gap-1.5">
                <span>Personvern-varsel: Mogleg sensitiv pasientinformasjon oppdaga!</span>
              </h4>
              <p className="text-xs text-[#8A2E1A]/90 mt-1">
                Appen har fanga opp følgjande som ikkje bør sendast til KI:
                <span className="font-semibold ml-1 underline decoration-[#E8785A]">
                  {piiStatus.matches.join(', ')}
                </span>
              </p>
              <p className="text-[11px] text-[#8A2E1A]/80 mt-0.5">
                For pasientens og din eigen tryggleik må dette anonymiserast før generering.
              </p>
            </div>
          </div>

          <button
            id="btn-auto-anonymize"
            onClick={onAnonymize}
            className="w-full sm:w-auto px-4 py-2 bg-[#E8785A] hover:bg-[#D6684B] text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center space-x-2 flex-shrink-0 active:scale-95 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>Anonymiser automatisk</span>
          </button>
        </div>
      </div>
    );
  }

  // Safe status
  return (
    <div
      id="firewall-status-safe"
      className="rounded-xl bg-white border border-[#E2DDD5] p-3 shadow-xs flex items-center justify-between text-xs text-[#2A4444]"
    >
      <div className="flex items-center space-x-2.5">
        <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-emerald-800">
            {rawTextLength > 0 ? 'Digital brannmur sjekka:' : 'Aktiv personvern-kontroll:'}
          </span>{' '}
          <span className="text-slate-600">
            {rawTextLength > 0
              ? 'Ingen personnummer, telefonnummer eller namn registrert.'
              : 'Skriv aldri inn personnummer eller namn. Data vert ikkje lagra.'}
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-teal-600" />
        <span>Clean-Box GDPR</span>
      </div>
    </div>
  );
};
