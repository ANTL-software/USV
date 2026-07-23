import type { ReactElement } from 'react';
import {
  IoBriefcaseOutline,
  IoBusinessOutline,
  IoCallOutline,
  IoGlobeOutline,
  IoMailOutline,
  IoPersonOutline,
} from 'react-icons/io5';
import type { ProspectEnrichmentSnapshot } from '../../../utils/types/index.ts';
import {
  buildEnrichmentSourceViews,
  formatEnrichmentDate,
  formatEnrichmentPayload,
  formatEnrichmentSourceOrigin,
  formatEnrichmentValue,
} from '../../../utils/scripts/index.ts';

interface ProspectEnrichmentPanelsProps {
  snapshot: ProspectEnrichmentSnapshot;
}

export function ProspectEnrichmentPanels({ snapshot }: ProspectEnrichmentPanelsProps): ReactElement {
  const sources = buildEnrichmentSourceViews(snapshot.enrichissement.enrichissement_sources);

  return (
    <>
      <article className="prospectEnrichment__panel">
        <h2><IoBusinessOutline /> Fiche actuelle</h2>
        <dl>
          <div><dt>Raison sociale</dt><dd>{formatEnrichmentValue(snapshot.identite_societe.raison_sociale)}</dd></div>
          <div><dt>SIRET</dt><dd>{formatEnrichmentValue(snapshot.identite_societe.siret)}</dd></div>
          <div><dt>Code NAF</dt><dd>{formatEnrichmentValue(snapshot.identite_societe.code_naf)}</dd></div>
          <div><dt>Activité</dt><dd>{formatEnrichmentValue(snapshot.identite_societe.activite)}</dd></div>
          <div><dt>Effectif</dt><dd>{formatEnrichmentValue(snapshot.identite_societe.effectif)}</dd></div>
          <div><dt>Effectif enrichi</dt><dd>{snapshot.identite_societe.effectif_enrichi !== null && snapshot.identite_societe.effectif_enrichi !== undefined ? `env. ${formatEnrichmentValue(snapshot.identite_societe.effectif_enrichi)} salarié${Number(snapshot.identite_societe.effectif_enrichi) > 1 ? 's' : ''}` : '—'}</dd></div>
          <div><dt>Nature / périmètre</dt><dd>{[snapshot.identite_societe.effectif_enrichi_nature, snapshot.identite_societe.effectif_enrichi_perimetre].filter(Boolean).map((value) => formatEnrichmentValue(value)).join(' · ') || '—'}</dd></div>
          <div><dt>Année effectif enrichi</dt><dd>{formatEnrichmentValue(snapshot.identite_societe.effectif_enrichi_annee)}</dd></div>
          <div><dt>Confiance effectif enrichi</dt><dd>{formatEnrichmentValue(snapshot.identite_societe.effectif_enrichi_confiance)}</dd></div>
          <div><dt>Estimation web</dt><dd>{snapshot.identite_societe.effectif_estime !== null && snapshot.identite_societe.effectif_estime !== undefined ? `env. ${formatEnrichmentValue(snapshot.identite_societe.effectif_estime)} collaborateurs` : '—'}</dd></div>
          <div><dt>Adresse</dt><dd>{formatEnrichmentValue(snapshot.identite_societe.adresse)}</dd></div>
          <div><dt>Ville</dt><dd>{formatEnrichmentValue(snapshot.identite_societe.ville)}</dd></div>
          <div><dt>Source</dt><dd>{formatEnrichmentValue(snapshot.identite_societe.source)}</dd></div>
        </dl>
      </article>

      <article className="prospectEnrichment__panel">
        <h2><IoCallOutline /> Contacts internes existants</h2>
        <dl>
          <div><dt>Téléphone principal</dt><dd><code>{formatEnrichmentValue(snapshot.contacts_internes.telephone)}</code></dd></div>
          <div><dt>Téléphone contact</dt><dd><code>{formatEnrichmentValue(snapshot.contacts_internes.telephone_contact)}</code></dd></div>
          <div><dt>Téléphone secondaire</dt><dd><code>{formatEnrichmentValue(snapshot.contacts_internes.telephone_secondaire)}</code></dd></div>
          <div><dt>Email</dt><dd>{snapshot.contacts_internes.email ? <a href={`mailto:${snapshot.contacts_internes.email}`}>{snapshot.contacts_internes.email}</a> : '—'}</dd></div>
          <div><dt>Nom contact</dt><dd>{formatEnrichmentValue(snapshot.contacts_internes.nom_contact)}</dd></div>
          <div><dt>Responsable</dt><dd>{formatEnrichmentValue(snapshot.contacts_internes.responsable)}</dd></div>
        </dl>
      </article>

      <article className="prospectEnrichment__panel">
        <h2><IoPersonOutline /> Enrichissement public</h2>
        <dl>
          <div><dt>Site web</dt><dd>{snapshot.enrichissement.site_web ? <a href={snapshot.enrichissement.site_web} target="_blank" rel="noreferrer">{snapshot.enrichissement.site_web}</a> : '—'}</dd></div>
          <div><dt>LinkedIn entreprise</dt><dd>{snapshot.enrichissement.linkedin_company_url ? <a href={snapshot.enrichissement.linkedin_company_url} target="_blank" rel="noreferrer">Ouvrir</a> : '—'}</dd></div>
          <div><dt>Décideur cible</dt><dd>{formatEnrichmentValue(snapshot.enrichissement.decisionnaire_nom)}</dd></div>
          <div><dt>Fonction</dt><dd><span className="prospectEnrichment__iconText"><IoBriefcaseOutline /> {formatEnrichmentValue(snapshot.enrichissement.decisionnaire_fonction)}</span></dd></div>
          <div><dt>Email pro public</dt><dd>{snapshot.enrichissement.decisionnaire_email_pro ? <a href={`mailto:${snapshot.enrichissement.decisionnaire_email_pro}`}><IoMailOutline /> {snapshot.enrichissement.decisionnaire_email_pro}</a> : '—'}</dd></div>
          <div><dt>Téléphone tertiaire</dt><dd><code>{formatEnrichmentValue(snapshot.enrichissement.telephone_tertiaire)}</code></dd></div>
          <div><dt>Source téléphone tertiaire</dt><dd>{formatEnrichmentValue(snapshot.enrichissement.telephone_tertiaire_source)}</dd></div>
          <div><dt>Profil LinkedIn décideur</dt><dd>{snapshot.enrichissement.linkedin_decisionnaire_url ? <a href={snapshot.enrichissement.linkedin_decisionnaire_url} target="_blank" rel="noreferrer">Ouvrir</a> : '—'}</dd></div>
        </dl>
      </article>

      <article className="prospectEnrichment__panel">
        <h2><IoGlobeOutline /> Sources & confiance</h2>
        <dl>
          <div><dt>Source principale</dt><dd>{formatEnrichmentSourceOrigin(snapshot.enrichissement.decisionnaire_source)}</dd></div>
          <div><dt>URL source</dt><dd>{snapshot.enrichissement.decisionnaire_source_url ? <a href={snapshot.enrichissement.decisionnaire_source_url} target="_blank" rel="noreferrer">{snapshot.enrichissement.decisionnaire_source_url}</a> : '—'}</dd></div>
          <div><dt>Preuve effectif enrichi</dt><dd>{snapshot.identite_societe.effectif_enrichi_source_url ? <a href={snapshot.identite_societe.effectif_enrichi_source_url} target="_blank" rel="noreferrer">{formatEnrichmentSourceOrigin(snapshot.identite_societe.effectif_enrichi_source)}</a> : '—'}</dd></div>
          <div><dt>Preuve estimation web</dt><dd>{snapshot.identite_societe.effectif_estime_source_url ? <a href={snapshot.identite_societe.effectif_estime_source_url} target="_blank" rel="noreferrer">{formatEnrichmentSourceOrigin(snapshot.identite_societe.effectif_estime_source)}</a> : '—'}</dd></div>
          <div><dt>Dernière vérification</dt><dd>{formatEnrichmentDate(snapshot.enrichissement.enrichissement_dernier_check_at)}</dd></div>
          <div><dt>Score</dt><dd>{formatEnrichmentValue(snapshot.enrichissement.enrichissement_score)}</dd></div>
          <div>
            <dt>Sources consultées</dt>
            <dd>
              {sources.length > 0 ? (
                <div className="prospectEnrichment__sourceList">
                  {sources.map((source) => (
                    <div key={source.key} className="prospectEnrichment__sourceItem">
                      <strong>{source.type}</strong>
                      <span>{source.origin}</span>
                      {source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.url}</a> : <span>—</span>}
                    </div>
                  ))}
                </div>
              ) : '—'}
            </dd>
          </div>
          <div><dt>Payload enrichissement</dt><dd><pre>{formatEnrichmentPayload(snapshot.enrichissement.enrichissement_payload)}</pre></dd></div>
        </dl>
      </article>
    </>
  );
}
