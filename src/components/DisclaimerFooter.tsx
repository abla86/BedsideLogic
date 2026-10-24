import React from 'react';
import { ShieldCheck, Youtube, HeartHandshake, CheckCircle2, FileText, Lock } from 'lucide-react';
import { LanguageMode } from '../types';

interface DisclaimerFooterProps {
  language: LanguageMode;
  onOpenEula: () => void;
}

export const DisclaimerFooter: React.FC<DisclaimerFooterProps> = ({ language, onOpenEula }) => {
  const isNynorsk = language === 'nynorsk';

  return (
    <footer className="mt-16 bg-[#0B4E4E] text-teal-100/90 text-xs border-t border-teal-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-teal-800/60">
          {/* Column 1: Concept & Mission */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">BedsideLogic</span>
              <span className="bg-[#E8785A] text-white text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded">
                PRO
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-teal-100/80">
              Praktisk, ærleg og evidensbasert KI for sjukepleiarar og helsepersonell. Utvikla for å
              kutte unødvendig dokumentasjonstid, slik at meir tid kan gå til pasientane ved senga.
            </p>
          </div>

          {/* Column 2: 3-lags personverngaranti */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>3-lags personvern-garanti (GDPR)</span>
            </h4>
            <ul className="text-[11px] space-y-1 text-teal-100/80">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>Sanntids mønster-sjekk for 11-sifra personnummer & 8-sifra tlf</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>Guard Dog-systemlag sladdar til [PERSONVERN-SLETTA]</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>Null serverlagring etter generering (Clean-Box)</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Kanal & Avtalar */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-teal-300" />
              <span>Juridisk status & Vilkår</span>
            </h4>
            <p className="text-[11px] text-teal-100/80 leading-relaxed">
              Verktøyet erstattar aldri autorisert klinisk skjønn. Ingen pasientopplysningar lagrast.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenEula}
                className="text-[#E8785A] hover:text-white font-bold flex items-center space-x-1 transition-colors underline decoration-white/20 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isNynorsk ? 'Les Sluttbrukaravtale (EULA)' : 'Les Sluttbrukeravtale (EULA)'} →</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-[#083D3D] p-4 rounded-xl border border-teal-800/40 text-[11px] text-teal-200/90 leading-relaxed space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="font-bold text-white">
              Ansvarsfråskriving og juridisk brukarvilkår:
            </p>
            <button
              type="button"
              onClick={onOpenEula}
              className="text-xs text-teal-300 hover:text-white underline font-semibold cursor-pointer self-start sm:self-auto"
            >
              Vis fullstendig EULA-avtale
            </button>
          </div>
          <p>
            BedsideLogic Pro er eit språkbehandlings- og struktureringsverktøy, ikkje eit godkjent elektronisk
            pasientjournalsystem (EPJ). Verktøyet gjer inga uavhengig medisinsk eller diagnostisk vurdering.
            Brukar har sjølv det fulle faglege og juridiske ansvaret for at all tekst som vert overført til
            pasientjournal (f.eks. DIPS, Gerica eller CosDoc) er kvalitetssikra av autorisert helsepersonell,
            klinisk dekkande og fri for personidentifiserbare data.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-teal-300/70 gap-2">
          <p>© {new Date().getFullYear()} BedsideLogic. Bygd med omsyn for sjukepleiaren sin kvardag.</p>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={onOpenEula}
              className="hover:text-white underline cursor-pointer"
            >
              EULA-vilkår
            </button>
            <p className="flex items-center space-x-1">
              <HeartHandshake className="w-3.5 h-3.5 text-[#E8785A]" />
              <span>Klinisk omsorg + praktisk intelligens</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
