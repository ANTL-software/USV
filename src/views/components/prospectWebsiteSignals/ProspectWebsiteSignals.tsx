import type { ReactElement } from 'react';
import { IoGlobeOutline } from 'react-icons/io5';
import {
  formatEnrichmentValue,
  getEmailSignalStrength,
  getLegalSignalStrength,
  getPageSignalStrength,
  getPersonSignalStrength,
  getPhoneSignalStrength,
  getSignalStrengthClass,
  getSignalStrengthLabel,
} from '../../../utils/scripts/index.ts';
import type { SignalStrength, WebsiteAnalysisPayload } from '../../../utils/scripts/index.ts';

interface ProspectWebsiteSignalsProps {
  websiteAnalysis: WebsiteAnalysisPayload | null;
}

interface SignalBadgeProps {
  strength: SignalStrength;
}

function SignalBadge({ strength }: SignalBadgeProps): ReactElement {
  return (
    <span className={`prospectEnrichment__badge ${getSignalStrengthClass(strength)}`}>
      {getSignalStrengthLabel(strength)}
    </span>
  );
}

export function ProspectWebsiteSignals({ websiteAnalysis }: ProspectWebsiteSignalsProps): ReactElement {
  const legalSignals = [
    ...(websiteAnalysis?.siret_candidates ?? []),
    ...(websiteAnalysis?.siren_candidates ?? []),
  ];

  return (
    <article className="prospectEnrichment__panel">
      <h2><IoGlobeOutline /> Signaux extraits du site</h2>
      {!websiteAnalysis ? (
        <p className="prospectEnrichment__muted">Aucun signal on-site exploitable n’a encore été extrait pour cette fiche.</p>
      ) : (
        <div className="prospectEnrichment__signalSections">
          <div className="prospectEnrichment__signalBlock">
            <h3>Pages internes analysées</h3>
            {websiteAnalysis.internal_contact_pages?.length ? (
              <ul className="prospectEnrichment__plainList">
                {websiteAnalysis.internal_contact_pages.map((url) => (
                  <li key={url}>
                    <div className="prospectEnrichment__signalLine">
                      <a href={url} target="_blank" rel="noreferrer">{url}</a>
                      <SignalBadge strength={getPageSignalStrength(url)} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="prospectEnrichment__muted">Aucune page contact / mentions / équipe exploitable détectée.</p>
            )}
          </div>

          <div className="prospectEnrichment__signalBlock">
            <h3>Identifiants légaux détectés</h3>
            <div className="prospectEnrichment__signalBadges">
              {legalSignals.map((value) => (
                <span key={value} className={`prospectEnrichment__badge ${getSignalStrengthClass(getLegalSignalStrength(value))}`}>
                  {value}
                </span>
              ))}
              {legalSignals.length === 0 && <span className="prospectEnrichment__muted">Aucun SIRET / SIREN détecté</span>}
            </div>
          </div>

          <div className="prospectEnrichment__signalBlock">
            <h3>Emails pro et téléphones publics</h3>
            <div className="prospectEnrichment__signalColumns">
              <div>
                <strong>Emails pro</strong>
                {websiteAnalysis.professional_emails?.length ? (
                  <ul className="prospectEnrichment__plainList">
                    {websiteAnalysis.professional_emails.map((email) => (
                      <li key={email}>
                        <div className="prospectEnrichment__signalLine">
                          <a href={`mailto:${email}`}>{email}</a>
                          <SignalBadge strength={getEmailSignalStrength(email)} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="prospectEnrichment__muted">Aucun email pro détecté.</p>
                )}
              </div>
              <div>
                <strong>Téléphones publics</strong>
                {websiteAnalysis.phones?.length ? (
                  <ul className="prospectEnrichment__plainList">
                    {websiteAnalysis.phones.map((phone) => (
                      <li key={phone}>
                        <div className="prospectEnrichment__signalLine">
                          <code>{phone}</code>
                          <SignalBadge strength={getPhoneSignalStrength(phone)} />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="prospectEnrichment__muted">Aucun téléphone public détecté.</p>
                )}
              </div>
            </div>
          </div>

          <div className="prospectEnrichment__signalBlock">
            <h3>Personnes détectées sur le site</h3>
            {websiteAnalysis.people_candidates?.length ? (
              <div className="prospectEnrichment__peopleList">
                {websiteAnalysis.people_candidates.map((person, index) => (
                  <div key={`${person.nom_complet ?? 'person'}-${index}`} className="prospectEnrichment__personCard">
                    <div className="prospectEnrichment__personHeader">
                      <strong>{formatEnrichmentValue(person.nom_complet)}</strong>
                      <div className="prospectEnrichment__personMeta">
                        {typeof person.score === 'number' && <span className="prospectEnrichment__badge">{person.score}</span>}
                        <SignalBadge strength={getPersonSignalStrength(person.score)} />
                      </div>
                    </div>
                    <span>{formatEnrichmentValue(person.fonction)}</span>
                    {person.context && <small>{person.context}</small>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="prospectEnrichment__muted">Aucune personne exploitable détectée sur les pages analysées.</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
