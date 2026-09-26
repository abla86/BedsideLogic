import React, { useState } from 'react';
import { X, Check, Sparkles, Crown, Zap, ShieldCheck, HeartPulse, Clock } from 'lucide-react';
import { LanguageMode } from '../types';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
  onTogglePro: () => void;
  language: LanguageMode;
}

export const ProModal: React.FC<ProModalProps> = ({
  isOpen,
  onClose,
  isPro,
  onTogglePro,
  language,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="modal-pro-subscription"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative"
      >
        {/* Close Button */}
        <button
          id="btn-close-pro-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero */}
        <div className="bg-gradient-to-br from-[#0F6E6E] to-[#094747] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center mb-3 border border-white/20 shadow-inner">
            <Crown className="w-6 h-6 text-amber-300" />
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            BedsideLogic <span className="text-[#E8785A]">PRO</span>
          </h3>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-sm mx-auto leading-relaxed">
            {language === 'nynorsk'
              ? 'Gå heim presis frå vakt. Spar 30–60 minutt kvar einaste vakt på dokumentasjon.'
              : 'Gå hjem presist fra vakt. Spar 30–60 minutter hver eneste vakt på dokumentasjon.'}
          </p>

          {/* Billing toggle */}
          <div className="mt-5 inline-flex items-center bg-[#073636] p-1 rounded-xl border border-teal-500/20 text-xs font-semibold">
            <button
              id="btn-billing-monthly"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#0F6E6E] font-bold shadow-xs'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              Månadleg (89,- kr)
            </button>
            <button
              id="btn-billing-yearly"
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-[#E8785A] text-white font-bold shadow-xs'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              <span>Årleg (690,- kr)</span>
              <span className="bg-white text-[#E8785A] text-[9px] px-1 py-0.2 rounded font-extrabold uppercase">
                Spar 35%
              </span>
            </button>
          </div>
        </div>

        {/* Content & Features */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Price badge */}
          <div className="text-center">
            <div className="flex items-baseline justify-center space-x-1">
              <span className="text-3xl sm:text-4xl font-black text-slate-800">
                {billingCycle === 'yearly' ? '57,50' : '89,-'}
              </span>
              <span className="text-sm font-semibold text-slate-500">kr / mnd</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {billingCycle === 'yearly'
                ? 'Fakturerast årleg med 690 kr (tilsvarar under 2 kr per vakt)'
                : 'Ingen bindingstid, avslutt når du vil med eitt klikk'}
            </p>
          </div>

          {/* Feature comparison list */}
          <div className="space-y-2.5">
            {[
              {
                title: 'Uavgrensa generering av SOAP & SBAR-notat',
                desc: 'Ingen vekesgrenser når du har travle vaktperiodar',
              },
              {
                title: 'Tale-til-tekst diktering i sanntid',
                desc: 'Dikter stikkorda dine medan du går mellom pasientromma',
              },
              {
                title: '3-lags personvern- og GDPR-brannmur',
                desc: 'Automatisk sladding av personnummer og telefonnummer',
              },
              {
                title: 'Skreddarsydde kliniske spesialmalar',
                desc: 'TIMES sårvurdering, palliativ plan, psykiatri og geriatri',
              },
              {
                title: 'Prioritert respons under vaktskifte (rush-tid)',
                desc: 'Ferdig notat på under 5 sekund',
              },
            ].map((feat, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{feat.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-tight">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Value proposition quote */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center space-x-3">
            <Clock className="w-5 h-5 text-[#E8785A] flex-shrink-0" />
            <p className="italic leading-snug">
              &quot;Om du sparer berre 15 minutt på kvar vakt, har abonnementet tent seg inn allereie etter første arbeidsdag.&quot;
            </p>
          </div>

          {/* Interactive Toggle / Subscribe Button */}
          <div className="space-y-2">
            <button
              id="btn-confirm-subscription"
              onClick={() => {
                onTogglePro();
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-[#E8785A] hover:bg-[#D6684B] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
            >
              <Zap className="w-4 h-4" />
              <span>
                {isPro
                  ? 'Nedgrader til gratisversjon (test)'
                  : `Aktiver Pro no (${billingCycle === 'yearly' ? '690,- kr/år' : '89,- kr/mnd'})`}
              </span>
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Sikker betaling via RevenueCat / Stripe • 14 dagars full angrerett
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
