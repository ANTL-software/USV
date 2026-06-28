import './prospectEnrichment.scss';

import { ReactElement, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { IoGlobeOutline, IoMailOutline, IoPersonOutline, IoCallOutline, IoBusinessOutline, IoBriefcaseOutline } from 'react-icons/io5';
import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import { getAllProspectsService, getProspectEnrichmentSnapshotService, previewProspectEnrichmentService, applyProspectEnrichmentService } from '../../../API/services';
import type { Prospect, ProspectEnrichmentSnapshot, ProspectEnrichmentPreview, EnrichissementStatut } from '../../../utils/types/prospect.types';
import { useAlert } from '../../../context/alert/AlertContext';

const SEARCH_LIMIT = 12;

const formatValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') return value.toLocaleString('fr-FR');
  return value.trim() || '—';
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatKeyLabel = (value: string): string => value
  .split('_')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const formatSourceOrigin = (value: string | null | undefined): string => {
  if (!value) return '—';
  const map: Record<string, string> = {
    siret: 'Résolution exacte par SIRET',
    siren: 'Résolution exacte par SIREN',
    name_postal: 'Recherche raison sociale + code postal',
    api_recherche_entreprises: 'API Recherche Entreprises',
    public_web_osint: 'Sourcing web public',
    web_osint_ranked: 'Sourcing web pondéré',
    official_website_public: 'Site public validé',
    official_website_public_mobile_candidate: 'Site public validé (mobile candidat)',
    legacy_responsable: 'Champ responsable existant',
    legacy_nom_contact: 'Champ nom_contact existant',
    email_domain_inference: 'Inférence par domaine email'
  };
  return map[value] || formatKeyLabel(value);
};

const formatSourceType = (value: string | null | undefined): string => {
  if (!value) return '—';
  const map: Record<string, string> = {
    official_company_registry: 'Registre officiel',
    website: 'Site web',
    linkedin_company: 'LinkedIn entreprise',
    linkedin_profile: 'LinkedIn profil'
  };
  return map[value] || formatKeyLabel(value);
};

const statusLabelMap: Record<EnrichissementStatut, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  enrichi: 'Enrichi',
  a_verifier: 'À vérifier',
  ignore: 'Ignoré'
};

type WebsitePersonCandidate = {
  nom_complet?: string;
  fonction?: string;
  context?: string;
  score?: number;
};

type WebsiteAnalysisPayload = {
  domain?: string | null;
  professional_emails?: string[];
  phones?: string[];
  internal_contact_pages?: string[];
  siret_candidates?: string[];
  siren_candidates?: string[];
  people_candidates?: WebsitePersonCandidate[];
};

const extractWebsiteAnalysis = (snapshot: ProspectEnrichmentSnapshot): WebsiteAnalysisPayload | null => {
  const webOsint = snapshot.enrichissement.enrichissement_payload?.web_osint as { website_analysis?: WebsiteAnalysisPayload } | undefined;
  return webOsint?.website_analysis ?? null;
};

type SignalStrength = 'fort' | 'moyen' | 'faible';

const getSignalStrengthLabel = (strength: SignalStrength): string => {
  if (strength === 'fort') return 'Signal fort';
  if (strength === 'moyen') return 'Signal moyen';
  return 'Signal faible';
};

const getSignalStrengthClass = (strength: SignalStrength): string => `prospectEnrichment__badge--${strength}`;

const getPageSignalStrength = (url: string): SignalStrength => {
  const lower = url.toLowerCase();
  if (lower.includes('mentions') || lower.includes('legal') || lower.includes('direction') || lower.includes('governance')) return 'fort';
  if (lower.includes('contact') || lower.includes('team') || lower.includes('equipe')) return 'moyen';
  return 'faible';
};

const getLegalSignalStrength = (value: string): SignalStrength => value.length === 14 ? 'fort' : 'moyen';

const getEmailSignalStrength = (email: string): SignalStrength => {
  const lower = email.toLowerCase();
  if (lower.includes('direction') || lower.includes('dir') || lower.includes('contact') || lower.includes('achat') || lower.includes('rse')) return 'fort';
  if (lower.includes('info') || lower.includes('hello') || lower.includes('commercial')) return 'moyen';
  return 'faible';
};

const getPhoneSignalStrength = (phone: string): SignalStrength => {
  const digits = phone.replace(/\D/g, '');
  if (/^(33)?[67]\d{8}$/.test(digits) || /^0[67]\d{8}$/.test(digits)) return 'fort';
  if (/^(33)?[1-5]\d{8}$/.test(digits) || /^0[1-5]\d{8}$/.test(digits)) return 'moyen';
  return 'faible';
};

const getPersonSignalStrength = (score?: number): SignalStrength => {
  if ((score ?? 0) >= 40) return 'fort';
  if ((score ?? 0) >= 20) return 'moyen';
  return 'faible';
};

function ProspectEnrichment(): ReactElement {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Prospect[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(null);
  const [snapshot, setSnapshot] = useState<ProspectEnrichmentSnapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ProspectEnrichmentPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const loadSnapshot = async (prospectId: number) => {
    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      const data = await getProspectEnrichmentSnapshotService(prospectId);
      setSnapshot(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de charger la fiche d’enrichissement';
      setSnapshotError(message);
      setSnapshot(null);
    } finally {
      setSnapshotLoading(false);
    }
  };

  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      try {
        const response = await getAllProspectsService({
          page: 1,
          limit: SEARCH_LIMIT,
          search: search.trim()
        });
        setResults(response.data);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Impossible de rechercher les prospects';
        setSearchError(message);
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (!selectedProspectId) {
      setSnapshot(null);
      setSnapshotError(null);
      setPreview(null);
      return;
    }

    void loadSnapshot(selectedProspectId);
  }, [selectedProspectId]);

  const selectedLabel = useMemo(() => {
    if (!snapshot?.prospect) return 'Aucun prospect sélectionné';
    return snapshot.prospect.raison_sociale || `${snapshot.prospect.nom} ${snapshot.prospect.prenom ?? ''}`.trim();
  }, [snapshot]);

  const websiteAnalysis = useMemo(
    () => (snapshot ? extractWebsiteAnalysis(snapshot) : null),
    [snapshot]
  );

  const handlePreview = async (): Promise<void> => {
    if (!selectedProspectId) return;

    setPreviewLoading(true);
    try {
      const data = await previewProspectEnrichmentService(selectedProspectId);
      setPreview(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible de générer la prévisualisation';
      await showError(message, 'Erreur enrichissement');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApply = async (): Promise<void> => {
    if (!selectedProspectId || !preview) return;

    setApplyLoading(true);
    try {
      const updatedSnapshot = await applyProspectEnrichmentService(selectedProspectId, preview.proposal);
      setSnapshot(updatedSnapshot);
      setPreview(null);
      await showSuccess('La proposition d’enrichissement a été enregistrée.', 'Enrichissement validé');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Impossible d’enregistrer l’enrichissement';
      await showError(message, 'Erreur enrichissement');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div id="prospectEnrichment">
      <Header />
      <SubNav />
      <main>
        <div className="prospectEnrichment__container">
          <div className="prospectEnrichment__back">
            <Button style="back" onClick={() => navigate('/operations/prospects')}>
              <MdArrowBack />
              <span>Retour aux prospects</span>
            </Button>
          </div>

          <div className="prospectEnrichment__header">
            <div>
              <h1>Enrichissement de donnée Prospect</h1>
              <p>
                Consultez la fiche interne et les champs réservés à l’enrichissement public, sans écraser les données terrain.
              </p>
            </div>
          </div>

          <section className="prospectEnrichment__searchCard">
            <div className="prospectEnrichment__searchRow">
              <div className="prospectEnrichment__searchField">
                <label htmlFor="prospect-enrichment-search">Rechercher un prospect</label>
                <input
                  id="prospect-enrichment-search"
                  type="text"
                  placeholder="Raison sociale, nom, email, SIRET, ville, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="prospectEnrichment__selected">
                <span className="prospectEnrichment__selectedLabel">Prospect chargé</span>
                <strong>{selectedLabel}</strong>
              </div>
            </div>

            {searchError && <div className="prospectEnrichment__error">{searchError}</div>}

            <div className="prospectEnrichment__results">
              {searchLoading ? (
                <p className="prospectEnrichment__muted">Recherche en cours...</p>
              ) : search.trim().length < 2 ? (
                <p className="prospectEnrichment__muted">Saisissez au moins 2 caractères pour lancer une recherche.</p>
              ) : results.length === 0 ? (
                <p className="prospectEnrichment__muted">Aucun prospect trouvé.</p>
              ) : (
                results.map((prospect) => (
                  <button
                    key={prospect.id_prospect}
                    type="button"
                    className={`prospectEnrichment__resultItem${selectedProspectId === prospect.id_prospect ? ' prospectEnrichment__resultItem--active' : ''}`}
                    onClick={() => setSelectedProspectId(prospect.id_prospect)}
                  >
                    <div>
                      <strong>{prospect.raison_sociale || `${prospect.nom} ${prospect.prenom ?? ''}`.trim()}</strong>
                      <span>#{prospect.id_prospect} · {formatValue(prospect.ville)} · {formatValue(prospect.code_postal)}</span>
                    </div>
                    <code>{prospect.telephone}</code>
                  </button>
                ))
              )}
            </div>
          </section>

          {snapshotError && <div className="prospectEnrichment__error">{snapshotError}</div>}

          {snapshotLoading ? (
            <div className="prospectEnrichment__loading">Chargement de la fiche d’enrichissement...</div>
          ) : !snapshot ? (
            <div className="prospectEnrichment__placeholder">
              Sélectionnez un prospect pour afficher la fiche consolidée d’enrichissement.
            </div>
          ) : (
            <>
              <section className="prospectEnrichment__actionBar">
                <div className="prospectEnrichment__actionText">
                  <strong>Déclencher une recherche d’enrichissement</strong>
                  <span>
                    L’action génère une proposition. Rien n’est sauvegardé tant que vous n’avez pas validé.
                  </span>
                </div>
                <div className="prospectEnrichment__actionButtons">
                  <Button style="gradient" onClick={() => { void handlePreview(); }} disabled={previewLoading || applyLoading}>
                    <span>{previewLoading ? 'Analyse en cours...' : 'Enrichir'}</span>
                  </Button>
                  {preview && (
                    <Button style="white" onClick={() => setPreview(null)} disabled={applyLoading}>
                      <span>Annuler la proposition</span>
                    </Button>
                  )}
                </div>
              </section>

              {preview && (
                <section className="prospectEnrichment__previewCard">
                  <div className="prospectEnrichment__previewHeader">
                    <div>
                      <h2>Contrôle humain avant enregistrement</h2>
                      <p>
                        Vérifiez les données proposées avant de les sauvegarder dans les champs d’enrichissement.
                      </p>
                    </div>
                    <div className="prospectEnrichment__previewButtons">
                      <Button style="green" onClick={() => { void handleApply(); }} disabled={applyLoading}>
                        <span>{applyLoading ? 'Enregistrement...' : 'Valider et enregistrer'}</span>
                      </Button>
                    </div>
                  </div>

                  <div className="prospectEnrichment__previewMeta">
                    <span><strong>Champs modifiés :</strong> {preview.changed_fields.length}</span>
                    {preview.metadata.official_company_resolved_by && (
                      <span><strong>Résolution légale :</strong> {formatSourceOrigin(preview.metadata.official_company_resolved_by)}</span>
                    )}
                    {typeof preview.metadata.official_company_match_score === 'number' && (
                      <span><strong>Score match société :</strong> {preview.metadata.official_company_match_score}</span>
                    )}
                  </div>

                  <div className="prospectEnrichment__previewDiff">
                    <div className="prospectEnrichment__previewColumn">
                      <h3>État actuel</h3>
                      <dl>
                        <div><dt>Site web</dt><dd>{formatValue(snapshot.enrichissement.site_web)}</dd></div>
                        <div><dt>LinkedIn entreprise</dt><dd>{formatValue(snapshot.enrichissement.linkedin_company_url)}</dd></div>
                        <div><dt>Décideur</dt><dd>{formatValue(snapshot.enrichissement.decisionnaire_nom)}</dd></div>
                        <div><dt>Fonction</dt><dd>{formatValue(snapshot.enrichissement.decisionnaire_fonction)}</dd></div>
                        <div><dt>Email pro</dt><dd>{formatValue(snapshot.enrichissement.decisionnaire_email_pro)}</dd></div>
                        <div><dt>Téléphone tertiaire</dt><dd>{formatValue(snapshot.enrichissement.telephone_tertiaire)}</dd></div>
                        <div><dt>Statut</dt><dd>{statusLabelMap[snapshot.enrichissement.enrichissement_statut]}</dd></div>
                        <div><dt>Score</dt><dd>{formatValue(snapshot.enrichissement.enrichissement_score)}</dd></div>
                      </dl>
                    </div>
                    <div className="prospectEnrichment__previewColumn prospectEnrichment__previewColumn--proposed">
                      <h3>Proposition à enregistrer</h3>
                      <dl>
                        <div><dt>Site web</dt><dd>{formatValue(preview.proposed_snapshot.enrichissement.site_web)}</dd></div>
                        <div><dt>LinkedIn entreprise</dt><dd>{formatValue(preview.proposed_snapshot.enrichissement.linkedin_company_url)}</dd></div>
                        <div><dt>Décideur</dt><dd>{formatValue(preview.proposed_snapshot.enrichissement.decisionnaire_nom)}</dd></div>
                        <div><dt>Fonction</dt><dd>{formatValue(preview.proposed_snapshot.enrichissement.decisionnaire_fonction)}</dd></div>
                        <div><dt>Email pro</dt><dd>{formatValue(preview.proposed_snapshot.enrichissement.decisionnaire_email_pro)}</dd></div>
                        <div><dt>Téléphone tertiaire</dt><dd>{formatValue(preview.proposed_snapshot.enrichissement.telephone_tertiaire)}</dd></div>
                        <div><dt>Statut</dt><dd>{statusLabelMap[preview.proposed_snapshot.enrichissement.enrichissement_statut]}</dd></div>
                        <div><dt>Score</dt><dd>{formatValue(preview.proposed_snapshot.enrichissement.enrichissement_score)}</dd></div>
                      </dl>
                    </div>
                  </div>

                  <div className="prospectEnrichment__validationGrid">
                    <div className="prospectEnrichment__validationCard">
                      <h3>Pourquoi ce score ?</h3>
                      {preview.metadata.evidence_breakdown && Object.keys(preview.metadata.evidence_breakdown).length > 0 ? (
                        <ul className="prospectEnrichment__scoreList">
                          {Object.entries(preview.metadata.evidence_breakdown).map(([key, value]) => (
                            <li key={key}>
                              <span>{formatKeyLabel(key)}</span>
                              <strong>{value}</strong>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="prospectEnrichment__muted">Aucun détail de score disponible.</p>
                      )}
                    </div>

                    <div className="prospectEnrichment__validationCard">
                      <h3>Signaux de sourcing</h3>
                      <ul className="prospectEnrichment__scoreList">
                        <li>
                          <span>Candidats site web</span>
                          <strong>{preview.metadata.website_candidates_count ?? 0}</strong>
                        </li>
                        <li>
                          <span>Candidats LinkedIn entreprise</span>
                          <strong>{preview.metadata.linkedin_company_candidates_count ?? 0}</strong>
                        </li>
                        <li>
                          <span>Candidats LinkedIn décideur</span>
                          <strong>{preview.metadata.linkedin_decision_maker_candidates_count ?? 0}</strong>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              )}

              <section className="prospectEnrichment__overview">
                <div className="prospectEnrichment__overviewCard">
                  <span>Complétude fiche actuelle</span>
                  <strong>{snapshot.completude.fiche_actuelle.percentage}%</strong>
                  <small>{snapshot.completude.fiche_actuelle.filled}/{snapshot.completude.fiche_actuelle.total} champs utiles renseignés</small>
                </div>
                <div className="prospectEnrichment__overviewCard">
                  <span>Complétude enrichissement</span>
                  <strong>{snapshot.completude.enrichissement.percentage}%</strong>
                  <small>{snapshot.completude.enrichissement.filled}/{snapshot.completude.enrichissement.total} champs enrichissement renseignés</small>
                </div>
                <div className="prospectEnrichment__overviewCard">
                  <span>Statut enrichissement</span>
                  <strong className={`prospectEnrichment__statusBadge prospectEnrichment__statusBadge--${snapshot.enrichissement.enrichissement_statut}`}>
                    {statusLabelMap[snapshot.enrichissement.enrichissement_statut]}
                  </strong>
                  <small>Score de confiance : {formatValue(snapshot.enrichissement.enrichissement_score)}</small>
                </div>
              </section>

              <section className="prospectEnrichment__grid">
                <article className="prospectEnrichment__panel">
                  <h2><IoBusinessOutline /> Fiche actuelle</h2>
                  <dl>
                    <div><dt>Raison sociale</dt><dd>{formatValue(snapshot.identite_societe.raison_sociale)}</dd></div>
                    <div><dt>SIRET</dt><dd>{formatValue(snapshot.identite_societe.siret)}</dd></div>
                    <div><dt>Code NAF</dt><dd>{formatValue(snapshot.identite_societe.code_naf)}</dd></div>
                    <div><dt>Activité</dt><dd>{formatValue(snapshot.identite_societe.activite)}</dd></div>
                    <div><dt>Effectif</dt><dd>{formatValue(snapshot.identite_societe.effectif)}</dd></div>
                    <div><dt>Adresse</dt><dd>{formatValue(snapshot.identite_societe.adresse)}</dd></div>
                    <div><dt>Ville</dt><dd>{formatValue(snapshot.identite_societe.ville)}</dd></div>
                    <div><dt>Source</dt><dd>{formatValue(snapshot.identite_societe.source)}</dd></div>
                  </dl>
                </article>

                <article className="prospectEnrichment__panel">
                  <h2><IoCallOutline /> Contacts internes existants</h2>
                  <dl>
                    <div><dt>Téléphone principal</dt><dd><code>{formatValue(snapshot.contacts_internes.telephone)}</code></dd></div>
                    <div><dt>Téléphone contact</dt><dd><code>{formatValue(snapshot.contacts_internes.telephone_contact)}</code></dd></div>
                    <div><dt>Téléphone secondaire</dt><dd><code>{formatValue(snapshot.contacts_internes.telephone_secondaire)}</code></dd></div>
                    <div><dt>Email</dt><dd>{snapshot.contacts_internes.email ? <a href={`mailto:${snapshot.contacts_internes.email}`}>{snapshot.contacts_internes.email}</a> : '—'}</dd></div>
                    <div><dt>Nom contact</dt><dd>{formatValue(snapshot.contacts_internes.nom_contact)}</dd></div>
                    <div><dt>Responsable</dt><dd>{formatValue(snapshot.contacts_internes.responsable)}</dd></div>
                  </dl>
                </article>

                <article className="prospectEnrichment__panel">
                  <h2><IoPersonOutline /> Enrichissement public</h2>
                  <dl>
                    <div><dt>Site web</dt><dd>{snapshot.enrichissement.site_web ? <a href={snapshot.enrichissement.site_web} target="_blank" rel="noreferrer">{snapshot.enrichissement.site_web}</a> : '—'}</dd></div>
                    <div><dt>LinkedIn entreprise</dt><dd>{snapshot.enrichissement.linkedin_company_url ? <a href={snapshot.enrichissement.linkedin_company_url} target="_blank" rel="noreferrer">Ouvrir</a> : '—'}</dd></div>
                    <div><dt>Décideur cible</dt><dd>{formatValue(snapshot.enrichissement.decisionnaire_nom)}</dd></div>
                    <div><dt>Fonction</dt><dd><span className="prospectEnrichment__iconText"><IoBriefcaseOutline /> {formatValue(snapshot.enrichissement.decisionnaire_fonction)}</span></dd></div>
                    <div><dt>Email pro public</dt><dd>{snapshot.enrichissement.decisionnaire_email_pro ? <a href={`mailto:${snapshot.enrichissement.decisionnaire_email_pro}`}><IoMailOutline /> {snapshot.enrichissement.decisionnaire_email_pro}</a> : '—'}</dd></div>
                    <div><dt>Téléphone tertiaire</dt><dd><code>{formatValue(snapshot.enrichissement.telephone_tertiaire)}</code></dd></div>
                    <div><dt>Source téléphone tertiaire</dt><dd>{formatValue(snapshot.enrichissement.telephone_tertiaire_source)}</dd></div>
                    <div><dt>Profil LinkedIn décideur</dt><dd>{snapshot.enrichissement.linkedin_decisionnaire_url ? <a href={snapshot.enrichissement.linkedin_decisionnaire_url} target="_blank" rel="noreferrer">Ouvrir</a> : '—'}</dd></div>
                  </dl>
                </article>

                <article className="prospectEnrichment__panel">
                  <h2><IoGlobeOutline /> Sources & confiance</h2>
                  <dl>
                    <div><dt>Source principale</dt><dd>{formatSourceOrigin(snapshot.enrichissement.decisionnaire_source)}</dd></div>
                    <div><dt>URL source</dt><dd>{snapshot.enrichissement.decisionnaire_source_url ? <a href={snapshot.enrichissement.decisionnaire_source_url} target="_blank" rel="noreferrer">{snapshot.enrichissement.decisionnaire_source_url}</a> : '—'}</dd></div>
                    <div><dt>Dernière vérification</dt><dd>{formatDate(snapshot.enrichissement.enrichissement_dernier_check_at)}</dd></div>
                    <div><dt>Score</dt><dd>{formatValue(snapshot.enrichissement.enrichissement_score)}</dd></div>
                    <div>
                      <dt>Sources consultées</dt>
                      <dd>
                        {Array.isArray(snapshot.enrichissement.enrichissement_sources) && snapshot.enrichissement.enrichissement_sources.length > 0 ? (
                          <div className="prospectEnrichment__sourceList">
                            {snapshot.enrichissement.enrichissement_sources.map((source, index) => {
                              const typedSource = source as { type?: string; origin?: string; url?: string };
                              return (
                                <div key={`${typedSource.url ?? 'source'}-${index}`} className="prospectEnrichment__sourceItem">
                                  <strong>{formatSourceType(typedSource.type)}</strong>
                                  <span>{formatSourceOrigin(typedSource.origin)}</span>
                                  {typedSource.url ? (
                                    <a href={typedSource.url} target="_blank" rel="noreferrer">{typedSource.url}</a>
                                  ) : (
                                    <span>—</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    <div><dt>Payload enrichissement</dt><dd><pre>{JSON.stringify(snapshot.enrichissement.enrichissement_payload ?? {}, null, 2)}</pre></dd></div>
                  </dl>
                </article>

                <article className="prospectEnrichment__panel">
                  <h2><IoGlobeOutline /> Signaux extraits du site</h2>
                  {!websiteAnalysis ? (
                    <p className="prospectEnrichment__muted">
                      Aucun signal on-site exploitable n’a encore été extrait pour cette fiche.
                    </p>
                  ) : (
                    <div className="prospectEnrichment__signalSections">
                      <div className="prospectEnrichment__signalBlock">
                        <h3>Pages internes analysées</h3>
                        {websiteAnalysis.internal_contact_pages && websiteAnalysis.internal_contact_pages.length > 0 ? (
                          <ul className="prospectEnrichment__plainList">
                            {websiteAnalysis.internal_contact_pages.map((url) => (
                              <li key={url}>
                                <div className="prospectEnrichment__signalLine">
                                  <a href={url} target="_blank" rel="noreferrer">{url}</a>
                                  <span className={`prospectEnrichment__badge ${getSignalStrengthClass(getPageSignalStrength(url))}`}>
                                    {getSignalStrengthLabel(getPageSignalStrength(url))}
                                  </span>
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
                          {(websiteAnalysis.siret_candidates ?? []).map((siret) => (
                            <span key={siret} className={`prospectEnrichment__badge ${getSignalStrengthClass(getLegalSignalStrength(siret))}`}>{siret}</span>
                          ))}
                          {(websiteAnalysis.siren_candidates ?? []).map((siren) => (
                            <span key={siren} className={`prospectEnrichment__badge ${getSignalStrengthClass(getLegalSignalStrength(siren))}`}>{siren}</span>
                          ))}
                          {(!websiteAnalysis.siret_candidates || websiteAnalysis.siret_candidates.length === 0)
                            && (!websiteAnalysis.siren_candidates || websiteAnalysis.siren_candidates.length === 0) && (
                            <span className="prospectEnrichment__muted">Aucun SIRET / SIREN détecté</span>
                          )}
                        </div>
                      </div>

                      <div className="prospectEnrichment__signalBlock">
                        <h3>Emails pro et téléphones publics</h3>
                        <div className="prospectEnrichment__signalColumns">
                          <div>
                            <strong>Emails pro</strong>
                            {websiteAnalysis.professional_emails && websiteAnalysis.professional_emails.length > 0 ? (
                              <ul className="prospectEnrichment__plainList">
                                {websiteAnalysis.professional_emails.map((email) => (
                                  <li key={email}>
                                    <div className="prospectEnrichment__signalLine">
                                      <a href={`mailto:${email}`}>{email}</a>
                                      <span className={`prospectEnrichment__badge ${getSignalStrengthClass(getEmailSignalStrength(email))}`}>
                                        {getSignalStrengthLabel(getEmailSignalStrength(email))}
                                      </span>
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
                            {websiteAnalysis.phones && websiteAnalysis.phones.length > 0 ? (
                              <ul className="prospectEnrichment__plainList">
                                {websiteAnalysis.phones.map((phone) => (
                                  <li key={phone}>
                                    <div className="prospectEnrichment__signalLine">
                                      <code>{phone}</code>
                                      <span className={`prospectEnrichment__badge ${getSignalStrengthClass(getPhoneSignalStrength(phone))}`}>
                                        {getSignalStrengthLabel(getPhoneSignalStrength(phone))}
                                      </span>
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
                        {websiteAnalysis.people_candidates && websiteAnalysis.people_candidates.length > 0 ? (
                          <div className="prospectEnrichment__peopleList">
                            {websiteAnalysis.people_candidates.map((person, index) => (
                              <div key={`${person.nom_complet ?? 'person'}-${index}`} className="prospectEnrichment__personCard">
                                <div className="prospectEnrichment__personHeader">
                                  <strong>{formatValue(person.nom_complet)}</strong>
                                  <div className="prospectEnrichment__personMeta">
                                    {typeof person.score === 'number' && <span className="prospectEnrichment__badge">{person.score}</span>}
                                    <span className={`prospectEnrichment__badge ${getSignalStrengthClass(getPersonSignalStrength(person.score))}`}>
                                      {getSignalStrengthLabel(getPersonSignalStrength(person.score))}
                                    </span>
                                  </div>
                                </div>
                                <span>{formatValue(person.fonction)}</span>
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
              </section>
            </>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const ProspectEnrichmentWithAuth = WithAuth(ProspectEnrichment);
export default ProspectEnrichmentWithAuth;
