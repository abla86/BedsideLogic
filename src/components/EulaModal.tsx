import React from 'react';
import {
  Shield,
  FileCheck,
  AlertTriangle,
  ServerOff,
  UserCheck,
  Stethoscope,
  X,
  Check,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { LanguageMode } from '../types';

interface EulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageMode;
  onAccept?: () => void;
  isAccepted?: boolean;
}

export const EulaModal: React.FC<EulaModalProps> = ({
  isOpen,
  onClose,
  language,
  onAccept,
  isAccepted = true,
}) => {
  if (!isOpen) return null;

  const isNynorsk = language === 'nynorsk';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="eula-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-[#E2DDD5] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0F6E6E] to-[#145353] text-white flex items-start justify-between relative">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-2xl bg-white/10 text-teal-100 border border-white/15 mt-1">
              <FileCheck className="w-6 h-6 text-[#E8785A]" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-teal-100 mb-1.5">
                <Lock className="w-3 h-3 text-teal-200" />
                <span>Juridisk avtale • Versjon 2.4 (2026)</span>
              </div>
              <h2 id="eula-modal-title" className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {isNynorsk
                  ? 'Sluttbrukaravtale og Vilkår (EULA)'
                  : 'Sluttbrukeravtale og Vilkår (EULA)'}
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-xl">
                {isNynorsk
                  ? 'Viktige vilkår for trygg og lovleg bruk av BedsideLogic Pro i helsetenesta.'
                  : 'Viktige vilkår for trygg og lovlig bruk av BedsideLogic Pro i helsetjenesten.'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-eula-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Lukk avtale"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* EULA Body - Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Important Highlight Box */}
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 space-y-1">
              <p className="font-bold">
                {isNynorsk
                  ? 'Hovudreglane for bruk oppsummert:'
                  : 'Hovedreglene for bruk oppsummert:'}
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-950/90">
                <li>
                  <strong>Ikkje ein pasientjournal:</strong> BedsideLogic Pro er eit formulerings- og språkverktøy.
                </li>
                <li>
                  <strong>Null serverlagring:</strong> Ingen pasient- eller stikkordsdata vert lagra på serverar etter generering.
                </li>
                <li>
                  <strong>Brukarens eige ansvar:</strong> Du er sjølv ansvarleg for at reelle personopplysningar (PII) aldri matast inn.
                </li>
                <li>
                  <strong>Klinisk kontroll:</strong> Verktøyet erstattar aldri klinisk skjønn. All utdata krev autorisert godkjenning.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-900">
              <Stethoscope className="w-4 h-4 text-[#0F6E6E]" />
              <h3 className="font-bold text-sm sm:text-base">
                1. {isNynorsk ? 'Formål og avgrensing – Ikkje eit journalsystem' : 'Formål og avgrensning – Ikke et journalsystem'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {isNynorsk ? (
                <>
                  BedsideLogic Pro er utelukkande eit <strong>språkbehandlings- og strukturiseringsverktøy</strong> meint til å bistå helsepersonell med å omforme ustrukturerte stikkord til etablerte metodikkar (SOAP, SBAR, forenkling). 
                  <strong> BedsideLogic Pro er IKKJE eit elektronisk pasientjournalsystem (EPJ)</strong> eller ein godkjend oppbevaringsstad for pasientopplysningar. Verktøyet erstattar ikkje DIPS, Gerica, CosDoc eller tilsvarande godkjende fagsystem.
                </>
              ) : (
                <>
                  BedsideLogic Pro er utelukkende et <strong>språkbehandlings- og struktureringsverktøy</strong> ment for å bistå helsepersonell med å omforme ustrukturerte stikkord til etablerte metodikker (SOAP, SBAR, forenkling). 
                  <strong> BedsideLogic Pro er IKKE et elektronisk pasientjournalsystem (EPJ)</strong> eller en godkjent oppbevaringsplass for pasientopplysninger. Verktøyet erstatter ikke DIPS, Gerica, CosDoc eller tilsvarende godkjente fagsystemer.
                </>
              )}
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-900">
              <ServerOff className="w-4 h-4 text-[#0F6E6E]" />
              <h3 className="font-bold text-sm sm:text-base">
                2. {isNynorsk ? 'Datahandsaming og null serverlagring' : 'Databehandling og null serverlagring'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {isNynorsk ? (
                <>
                  All prosessering via API-et vert utført flyktig i minnet under sanntidsgenerering. 
                  <strong> Data vert IKKJE lagra, loggført eller arkivert på serverane våre etter at genereringa er fullført.</strong> 
                  Brukardata vert heller ikkje nytta til trening av allmenne KI-modellar. Lokal vakthistorikk ligg utelukkande i din eigen nettlesar sitt lokale minne (localStorage), og kan slettast med eitt klikk ved vaktslutt.
                </>
              ) : (
                <>
                  All prosessering via API-et utføres flyktig i minnet under sanntidsgenerering. 
                  <strong> Data blir IKKE lagret, loggført eller arkivert på våre servere etter at genereringen er fullført.</strong> 
                  Brukerdata benyttes heller ikke til trening av allmenne AI-modeller. Lokal vakthistorikk ligger utelukkende i din egen nettlesers lokale minne (localStorage), og kan slettes med ett klikk ved vaktslutt.
                </>
              )}
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-900">
              <Shield className="w-4 h-4 text-[#0F6E6E]" />
              <h3 className="font-bold text-sm sm:text-base">
                3. {isNynorsk ? 'Brukarens eige personvernansvar' : 'Brukerens eget personvernansvar'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {isNynorsk ? (
                <>
                  Sjølv om BedsideLogic Pro har innebygd sanntids-validering og eit aktivt &quot;Guard Dog&quot;-sikkerheitslag som automatisk raudmerkar og anonymiserer 11-sifra fødselsnummer, 8-sifra telefonnummer og personnamn, er 
                  <strong> du som sluttbrukar juridisk og profesjonelt ansvarleg</strong> for å sikre at ingen reelle personidentifiserbare data (PII) vert mata inn i verktøyet, i tråd med teieplikta (helsepersonelloven § 21) og personvernforordninga (GDPR).
                </>
              ) : (
                <>
                  Selv om BedsideLogic Pro har innebygget sanntids-validering og et aktivt &quot;Guard Dog&quot;-sikkerhetslag som automatisk rødmerker og anonymiserer 11-sifrede fødselsnumre, 8-sifrede telefonnumre og personnavn, er 
                  <strong> du som sluttbruker juridisk og profesjonelt ansvarlig</strong> for å sikre at ingen reelle personidentifiserbare data (PII) mates inn i verktøyet, i tråd med taushetsplikten (helsepersonelloven § 21) og personvernforordningen (GDPR).
                </>
              )}
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-900">
              <UserCheck className="w-4 h-4 text-[#0F6E6E]" />
              <h3 className="font-bold text-sm sm:text-base">
                4. {isNynorsk ? 'Klinisk skjønn og obligatorisk kontroll' : 'Klinisk skjønn og obligatorisk kontroll'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {isNynorsk ? (
                <>
                  BedsideLogic Pro gjer <strong>ingen sjølvstendige medisinske eller diagnostiske vurderingar</strong>. Utdata er utelukkande forslag til tekststruktur. 
                  <strong> Verktøyet erstattar aldri autorisert helsepersonell si eiga kliniske dømekraft.</strong> 
                  All utdata må grundig gjennomgåast, kontrollerast og verifiserast av autorisert helsepersonell før opplysningane eventuelt vert førte inn i pasientens faktiske journal eller overleverte til kollegaer.
                </>
              ) : (
                <>
                  BedsideLogic Pro gjør <strong>ingen selvstendige medisinske eller diagnostiske vurderinger</strong>. Utdata er utelukkende forslag til tekststruktur. 
                  <strong> Verktøyet erstatter aldri autorisert helsepersonells eget kliniske skjønn.</strong> 
                  All utdata må grundig gjennomgås, kontrolleres og verifiseres av autorisert helsepersonell før opplysningene eventuelt føres inn i pasientens faktiske journal eller overleveres til kollegaer.
                </>
              )}
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-900">
              <AlertTriangle className="w-4 h-4 text-[#E8785A]" />
              <h3 className="font-bold text-sm sm:text-base">
                5. {isNynorsk ? 'Ansvarsfritak (Limitation of Liability)' : 'Ansvarsfraskrivelse (Limitation of Liability)'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              {isNynorsk ? (
                <>
                  Tenesta vert levert &quot;som ho er&quot; (as-is). Utviklarane eller leverandørane av BedsideLogic Pro kan ikkje haldast erstatningsansvarlege for feil, manglar, unøyaktigheiter eller konsekvensar av kliniske handlingar utført på bakgrunn av generert tekst som ikkje er tilstrekkeleg kvalitetssikra av autorisert personell.
                </>
              ) : (
                <>
                  Tjenesten leveres &quot;som den er&quot; (as-is). Utviklerne eller leverandørene av BedsideLogic Pro kan ikke holdes erstatningsansvarlige for feil, mangler, unøyaktigheter eller konsekvenser av kliniske handlinger utført på bakgrunn av generert tekst som ikke er tilstrekkelig kvalitetssikret av autorisert personell.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-6 bg-[#FAF8F5] border-t border-[#E2DDD5] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              {isNynorsk
                ? 'Utforma i samsvar med Normen og GDPR.'
                : 'Utformet i samsvar med Normen og GDPR.'}
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onAccept && !isAccepted ? (
              <button
                id="btn-accept-eula"
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0F6E6E] hover:bg-[#0B5454] text-white shadow transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>{isNynorsk ? 'Eg forstår og godtek vilkåra' : 'Jeg forstår og godtar vilkårene'}</span>
              </button>
            ) : (
              <button
                id="btn-dismiss-eula"
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#0F6E6E] hover:bg-[#0B5454] text-white shadow transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isNynorsk ? 'Forstått og godkjent' : 'Forstått og godkjent'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
