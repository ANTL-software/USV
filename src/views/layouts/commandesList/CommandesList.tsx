import { ReactElement, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { MdArrowBack, MdDelete, MdRestore } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import { confirm, showSuccess, showError } from '../../../utils/services/alertService';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';
import { VenteContext } from '../../../context/vente/VenteContext.tsx';
import { useCampagnes } from '../../../hooks/useCampagnes';
import { deleteVenteService, restoreVenteService } from '../../../API/services/vente.service.ts';
import { getLeadClientsService } from '../../../API/services/lead.service.ts';
import {
  STATUT_VENTE_OPTIONS,
  STATUT_VENTE_LABELS,
  STATUT_VENTE_COLORS,
  MODE_PAIEMENT_LABELS,
} from '../../../utils/types/vente.types';
import {
  STATUT_RENDEZ_VOUS_OPTIONS,
  STATUT_RENDEZ_VOUS_LABELS,
  STATUT_RENDEZ_VOUS_COLORS,
} from '../../../utils/types/rendezVous.types.ts';
import type {
  StatutVente,
  Vente,
  ModePaiement,
  LeadClient,
  LeadClientStats,
  LeadClientListParams,
  StatutRendezVous,
} from '../../../utils/types/index.ts';
import { CAMPAIGN_VARIANTS, normalizeCampaignVariant } from '../../../utils/scripts/campaignVariants.ts';
import { formatLeadClientReference } from '../../../utils/scripts/leadClients.ts';
import './commandesList.scss';

function formatMontant(montant: string): string {
  const num = parseFloat(montant);
  if (Number.isNaN(num)) return '0,00 €';
  return num.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatLeadSlot(dateStr: string, timeStr: string): string {
  const isoCandidate = `${dateStr}T${timeStr}`;
  const date = new Date(isoCandidate);

  if (Number.isNaN(date.getTime())) {
    return `${dateStr} ${timeStr}`;
  }

  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function prospectName(vente: Vente): string {
  if (!vente.prospect) return '—';
  const raisonSociale = vente.prospect.raison_sociale?.trim();
  if (raisonSociale) return raisonSociale;
  const parts = [vente.prospect.nom.toUpperCase()];
  if (vente.prospect.prenom) parts.push(vente.prospect.prenom);
  return parts.join(' ');
}

function leadProspectName(lead: LeadClient): string {
  const raisonSociale = lead.prospect?.raison_sociale?.trim();
  if (raisonSociale) {
    return raisonSociale;
  }

  const contactName = lead.interlocuteur_nom?.trim()
    || lead.prospect?.decisionnaire_nom?.trim()
    || lead.prospect?.nom_contact?.trim();

  if (contactName) {
    return contactName;
  }

  const parts = [lead.prospect?.nom?.toUpperCase(), lead.prospect?.prenom]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

  return parts.join(' ') || '—';
}

function agentName(vente: Vente): string {
  if (!vente.agent) return '—';
  return `${vente.agent.prenom} ${vente.agent.nom.toUpperCase()}`;
}

function leadAgentName(lead: LeadClient): string {
  if (!lead.agent) return '—';
  return `${lead.agent.prenom} ${lead.agent.nom.toUpperCase()}`;
}

function leadInterlocuteur(lead: LeadClient): string {
  return lead.interlocuteur_nom
    ?? lead.prospect?.decisionnaire_nom
    ?? lead.prospect?.nom_contact
    ?? '—';
}

const VUE_OPTIONS = [
  { value: 'actives', label: 'Commandes actives' },
  { value: 'corbeille', label: '🗑️ Corbeille (supprimées)' },
] as const;

type SelectOption = {
  value: string;
  label: string;
};

const DEFAULT_LEAD_STATS: LeadClientStats = {
  total: 0,
  planifies: 0,
  effectues: 0,
  annules: 0,
  reportes: 0,
  nonHonores: 0,
};

function CommandesList(): ReactElement {
  const navigate = useNavigate();
  const venteCtx = useContext(VenteContext);
  const { campagnes } = useCampagnes();

  if (!venteCtx) throw new Error('CommandesList must be used within a VenteProvider');

  const { ventes, pagination, isLoading, error, filters, setFilters, load, stats, resetFilters } = venteCtx;

  const [localStatut, setLocalStatut] = useState<StatutVente | ''>(filters.statut ?? '');
  const [localLeadStatut, setLocalLeadStatut] = useState<StatutRendezVous | ''>('');
  const [localDateDebut, setLocalDateDebut] = useState(filters.date_debut ?? '');
  const [localDateFin, setLocalDateFin] = useState(filters.date_fin ?? '');
  const [vueMode, setVueMode] = useState<'actives' | 'corbeille'>('actives');

  const [leadClients, setLeadClients] = useState<LeadClient[]>([]);
  const [leadPagination, setLeadPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [leadStats, setLeadStats] = useState<LeadClientStats>(DEFAULT_LEAD_STATS);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadFilters, setLeadFilters] = useState<LeadClientListParams>({
    page: 1,
    limit: 20,
  });

  const selectedCampagne = campagnes.find((campagne) => campagne.id_campagne === filters.campagne);
  const selectedVariant = selectedCampagne
    ? normalizeCampaignVariant(selectedCampagne.type_campagne)
    : null;
  const isLeadCampaign = selectedVariant === CAMPAIGN_VARIANTS.lead_b2b;
  const hasResolvedSelectedCampaign = !filters.campagne || selectedCampagne !== undefined;
  const isCorbeille = vueMode === 'corbeille';

  const loadLeadClients = useCallback(async (campagneId: number, requestFilters: LeadClientListParams) => {
    setLeadLoading(true);
    setLeadError(null);

    try {
      const result = await getLeadClientsService({
        campagne: campagneId,
        statut: requestFilters.statut,
        date_debut: requestFilters.date_debut,
        date_fin: requestFilters.date_fin,
        page: requestFilters.page,
        limit: requestFilters.limit,
      });
      setLeadClients(result.leads);
      setLeadPagination(result.pagination);
      setLeadStats(result.stats);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Erreur lors du chargement des rendez-vous client';
      setLeadError(message);
      setLeadClients([]);
      setLeadPagination(null);
      setLeadStats(DEFAULT_LEAD_STATS);
    } finally {
      setLeadLoading(false);
    }
  }, []);

  const handleVueModeChange = useCallback((mode: 'actives' | 'corbeille') => {
    setVueMode(mode);
    setFilters({
      soft_deleted: mode === 'corbeille',
      statut: undefined,
      date_debut: undefined,
      date_fin: undefined,
      page: 1,
    });
    setLocalStatut('');
    setLocalDateDebut('');
    setLocalDateFin('');
  }, [setFilters]);

  const handleDeleteClick = useCallback(async (vente: Vente, event: React.MouseEvent) => {
    event.stopPropagation();

    const confirmed = await confirm(
      `Êtes-vous sûr de vouloir supprimer la commande ${vente.reference_doc ?? `#${vente.id_vente}`} ?`,
      'Supprimer la commande',
      'Supprimer',
      'Annuler'
    );
    if (!confirmed) return;

    const purge = await confirm(
      "Souhaitez-vous également supprimer l'enregistrement de cette vente au niveau du commercial (CA mensuel, objectif, commission) ?\n\n- OUI (Purge totale) : Supprime définitivement la commande et la retire des statistiques du commercial.\n- NON (Suppression simple) : Retire la commande de cette vue mais la conserve pour le commercial.",
      'Niveau de suppression',
      'Oui (Purge totale)',
      'Non (Suppression simple)'
    );

    try {
      await deleteVenteService(vente.id_vente, purge);
      await load();
    } catch (deleteError) {
      console.error('Erreur lors de la suppression de la vente:', deleteError);
      await showError('Impossible de supprimer la commande.', 'Erreur');
    }
  }, [load]);

  const handleRestoreClick = useCallback(async (vente: Vente, event: React.MouseEvent) => {
    event.stopPropagation();

    const confirmed = await confirm(
      `Souhaitez-vous restaurer la commande ${vente.reference_doc ?? `#${vente.id_vente}`} ?\n\nElle réapparaîtra dans la liste des commandes actives.`,
      'Restaurer la commande',
      'Restaurer',
      'Annuler'
    );
    if (!confirmed) return;

    try {
      await restoreVenteService(vente.id_vente);
      await showSuccess(`Commande ${vente.reference_doc ?? `#${vente.id_vente}`} restaurée avec succès.`, 'Restauration');
      await load();
    } catch (restoreError) {
      console.error('Erreur lors de la restauration de la vente:', restoreError);
      await showError('Impossible de restaurer la commande.', 'Erreur');
    }
  }, [load]);

  useEffect(() => {
    if (!filters.campagne || !hasResolvedSelectedCampaign || isLeadCampaign) {
      return;
    }

    load();
  }, [
    filters.campagne,
    filters.statut,
    filters.date_debut,
    filters.date_fin,
    filters.page,
    filters.soft_deleted,
    hasResolvedSelectedCampaign,
    isLeadCampaign,
    load,
  ]);

  useEffect(() => {
    if (!filters.campagne || !hasResolvedSelectedCampaign || !isLeadCampaign) {
      return;
    }

    loadLeadClients(filters.campagne, leadFilters);
  }, [filters.campagne, hasResolvedSelectedCampaign, isLeadCampaign, leadFilters, loadLeadClients]);

  useEffect(() => {
    if (isLeadCampaign && vueMode !== 'actives') {
      setVueMode('actives');
    }
  }, [isLeadCampaign, vueMode]);

  useEffect(() => {
    if (isLeadCampaign) {
      setLocalLeadStatut(leadFilters.statut ?? '');
      setLocalDateDebut(leadFilters.date_debut ?? '');
      setLocalDateFin(leadFilters.date_fin ?? '');
      return;
    }

    setLocalDateDebut(filters.date_debut ?? '');
    setLocalDateFin(filters.date_fin ?? '');
    setLocalStatut(filters.statut ?? '');
  }, [
    filters.date_debut,
    filters.date_fin,
    filters.statut,
    isLeadCampaign,
    leadFilters.date_debut,
    leadFilters.date_fin,
    leadFilters.statut,
  ]);

  useEffect(() => {
    return () => {
      resetFilters();
      setLeadClients([]);
      setLeadPagination(null);
      setLeadStats(DEFAULT_LEAD_STATS);
    };
  }, [resetFilters]);

  const handleCampagneChange = useCallback((campagneId: number | null) => {
    setFilters({
      campagne: campagneId ?? undefined,
      soft_deleted: false,
      statut: undefined,
      date_debut: undefined,
      date_fin: undefined,
      page: 1,
    });
    setLeadFilters({
      page: 1,
      limit: 20,
    });
    setLeadClients([]);
    setLeadPagination(null);
    setLeadStats(DEFAULT_LEAD_STATS);
    setLeadError(null);
    setVueMode('actives');
    setLocalStatut('');
    setLocalLeadStatut('');
    setLocalDateDebut('');
    setLocalDateFin('');
  }, [setFilters]);

  const handleSearch = useCallback(() => {
    if (isLeadCampaign) {
      setLeadFilters((previous) => ({
        ...previous,
        statut: localLeadStatut || undefined,
        date_debut: localDateDebut || undefined,
        date_fin: localDateFin || undefined,
        page: 1,
      }));
      return;
    }

    setFilters({
      statut: localStatut || undefined,
      date_debut: localDateDebut || undefined,
      date_fin: localDateFin || undefined,
      soft_deleted: isCorbeille,
      page: 1,
    });
  }, [isLeadCampaign, localLeadStatut, localDateDebut, localDateFin, localStatut, setFilters, isCorbeille]);

  const handlePageChange = useCallback((newPage: number) => {
    if (isLeadCampaign) {
      setLeadFilters((previous) => ({ ...previous, page: newPage }));
      return;
    }

    setFilters({ page: newPage });
  }, [isLeadCampaign, setFilters]);

  const handleSaleRowClick = useCallback((vente: Vente) => {
    if (vente.soft_deleted) return;
    navigate(`/operations/commandes/details/${vente.id_vente}`);
  }, [navigate]);

  const handleLeadRowClick = useCallback((lead: LeadClient) => {
    navigate(`/operations/commandes/details/${lead.id_lead}?mode=lead`);
  }, [navigate]);

  const campagneOptions: SelectOption[] = campagnes.map((campagne) => ({
    value: String(campagne.id_campagne),
    label: campagne.nom_campagne,
  }));

  const statutVenteOptions: SelectOption[] = [
    { value: '', label: 'Tous les statuts' },
    ...STATUT_VENTE_OPTIONS,
  ];
  const statutLeadOptions: SelectOption[] = [
    { value: '', label: 'Tous les statuts' },
    ...STATUT_RENDEZ_VOUS_OPTIONS,
  ];

  const statsValideesCount = stats?.validees.count ?? 0;
  const statsValideesAmount = stats?.validees.total_montant ?? 0;
  const statsEnAttenteCount = stats?.enAttente.count ?? 0;
  const statsEnAttenteAmount = stats?.enAttente.total_montant ?? 0;
  const statsAnnuleesCount = stats?.annulees.count ?? 0;
  const statsAnnuleesAmount = stats?.annulees.total_montant ?? 0;
  const statsFrigoCount = stats?.frigo.count ?? 0;
  const statsFrigoAmount = stats?.frigo.total_montant ?? 0;
  const totalVentesCount = stats?.total.count ?? 0;
  const averageValidatedAmount = statsValideesCount > 0 ? (statsValideesAmount / statsValideesCount) : 0;

  const salePage = filters.page ?? 1;
  const leadPage = leadFilters.page ?? 1;

  const pageLoading = isLeadCampaign ? leadLoading : isLoading;
  const pageError = isLeadCampaign ? leadError : error;
  const hasCampaignSelection = Boolean(filters.campagne);

  return (
    <div id="commandesList">
      <Header />
      <SubNav />
      <main>
        <div className="commandesList__container">
          <div className="commandesList__header">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack /> Retour
            </Button>
            <h2>{isLeadCampaign ? 'Rendez-vous client' : 'Commandes'}</h2>
            {!isLeadCampaign && isCorbeille && (
              <span className="commandesList__corbeille-badge">🗑️ Mode Corbeille</span>
            )}
          </div>

          <div className="commandesList__filters">
            <div className="commandesList__filter-group">
              <label>Campagne</label>
              <Select
                options={campagneOptions}
                value={campagneOptions.find((option) => option.value === String(filters.campagne)) ?? null}
                onChange={(option) => {
                  const selectedOption = option as SelectOption | null;
                  handleCampagneChange(selectedOption ? Number(selectedOption.value) : null);
                }}
                styles={reactSelectStyles}
                placeholder="Campagne..."
                isClearable
              />
            </div>

            {!isLeadCampaign && (
              <div className="commandesList__filter-group">
                <label>Vue</label>
                <Select
                  options={VUE_OPTIONS as unknown as SelectOption[]}
                  value={VUE_OPTIONS.find((option) => option.value === vueMode) ?? VUE_OPTIONS[0]}
                  onChange={(option) => {
                    const selectedOption = option as SelectOption | null;
                    if (selectedOption) {
                      handleVueModeChange(selectedOption.value as 'actives' | 'corbeille');
                    }
                  }}
                  styles={reactSelectStyles}
                  isSearchable={false}
                />
              </div>
            )}

            {!isCorbeille && (
              <div className="commandesList__filter-group">
                <label>Statut</label>
                <Select
                  options={isLeadCampaign ? statutLeadOptions : statutVenteOptions}
                  value={
                    isLeadCampaign
                      ? statutLeadOptions.find((option) => option.value === localLeadStatut) ?? statutLeadOptions[0]
                      : statutVenteOptions.find((option) => option.value === localStatut) ?? statutVenteOptions[0]
                  }
                  onChange={(option) => {
                    const selectedOption = option as SelectOption | null;
                    const value = selectedOption?.value;
                    if (isLeadCampaign) {
                      setLocalLeadStatut((value as StatutRendezVous | '') ?? '');
                      return;
                    }
                    setLocalStatut((value as StatutVente | '') ?? '');
                  }}
                  styles={reactSelectStyles}
                  placeholder="Tous les statuts"
                  isSearchable={false}
                />
              </div>
            )}

            <div className="commandesList__filter-group">
              <label>Du</label>
              <input type="date" value={localDateDebut} onChange={(event) => setLocalDateDebut(event.target.value)} />
            </div>

            <div className="commandesList__filter-group">
              <label>Au</label>
              <input type="date" value={localDateFin} onChange={(event) => setLocalDateFin(event.target.value)} />
            </div>

            <div className="commandesList__filter-actions">
              <Button style="gradient" onClick={handleSearch} disabled={!hasCampaignSelection || pageLoading}>
                {pageLoading ? 'Chargement...' : 'Rechercher'}
              </Button>
            </div>
          </div>

          {pageError && <div className="commandesList__error">{pageError}</div>}

          {isLeadCampaign && leadStats.total > 0 && (
            <div className="commandesList__summary">
              <div className="summary-card summary-card--total">
                <span className="summary-card__value">{leadStats.total}</span>
                <span className="summary-card__label">Rendez-vous pris</span>
              </div>
              <div className="summary-card summary-card--validee">
                <span className="summary-card__value">{leadStats.planifies}</span>
                <span className="summary-card__label">Planifiés</span>
              </div>
              <div className="summary-card summary-card--amount">
                <span className="summary-card__value">{leadStats.effectues}</span>
                <span className="summary-card__label">Effectués</span>
              </div>
              <div className="summary-card summary-card--annulee">
                <span className="summary-card__value">{leadStats.annules}</span>
                <span className="summary-card__label">Annulés</span>
              </div>
              <div className="summary-card summary-card--attente">
                <span className="summary-card__value">{leadStats.reportes}</span>
                <span className="summary-card__label">Reportés</span>
              </div>
              <div className="summary-card summary-card--frigo">
                <span className="summary-card__value">{leadStats.nonHonores}</span>
                <span className="summary-card__label">Non honorés</span>
              </div>
            </div>
          )}

          {!isLeadCampaign && totalVentesCount > 0 && !isCorbeille && (
            <div className="commandesList__summary">
              <div className="summary-card summary-card--total">
                <span className="summary-card__value">{totalVentesCount}</span>
                <span className="summary-card__label">Nbre de CDE</span>
              </div>
              <div className="summary-card summary-card--amount">
                <span className="summary-card__value">{formatMontant(String(averageValidatedAmount))}</span>
                <span className="summary-card__label">Moyenne</span>
              </div>
              <div className="summary-card summary-card--validee">
                <span className="summary-card__value">
                  {statsValideesCount} <span style={{ fontSize: '0.55em', opacity: 0.85, fontWeight: 'normal' }}>({formatMontant(String(statsValideesAmount))})</span>
                </span>
                <span className="summary-card__label">Validées</span>
              </div>
              <div className="summary-card summary-card--attente">
                <span className="summary-card__value">
                  {statsEnAttenteCount} <span style={{ fontSize: '0.55em', opacity: 0.85, fontWeight: 'normal' }}>({formatMontant(String(statsEnAttenteAmount))})</span>
                </span>
                <span className="summary-card__label">En attente</span>
              </div>
              <div className="summary-card summary-card--annulee">
                <span className="summary-card__value">
                  {statsAnnuleesCount} <span style={{ fontSize: '0.55em', opacity: 0.85, fontWeight: 'normal' }}>({formatMontant(String(statsAnnuleesAmount))})</span>
                </span>
                <span className="summary-card__label">Annulées</span>
              </div>
              <div className="summary-card summary-card--frigo">
                <span className="summary-card__value">
                  {statsFrigoCount} <span style={{ fontSize: '0.55em', opacity: 0.85, fontWeight: 'normal' }}>({formatMontant(String(statsFrigoAmount))})</span>
                </span>
                <span className="summary-card__label">CDE suspendues</span>
              </div>
            </div>
          )}

          {!isLeadCampaign && ventes.length > 0 && isCorbeille && (
            <div className="commandesList__corbeille-info">
              <span>{ventes.length} commande{ventes.length > 1 ? 's' : ''} supprimée{ventes.length > 1 ? 's' : ''} (soft delete)</span>
            </div>
          )}

          {!hasCampaignSelection && (
            <div className="empty">
              Sélectionnez une campagne pour voir {isLeadCampaign ? 'les rendez-vous client' : 'les commandes'}.
            </div>
          )}

          {hasCampaignSelection && pageLoading && (
            <Loader message={isLeadCampaign ? 'Chargement des rendez-vous client...' : 'Chargement des commandes...'} />
          )}

          {hasCampaignSelection && !pageLoading && isLeadCampaign && leadClients.length === 0 && !pageError && (
            <div className="empty">Aucun rendez-vous client trouvé pour cette campagne.</div>
          )}

          {hasCampaignSelection && !pageLoading && !isLeadCampaign && ventes.length === 0 && !pageError && (
            <div className="empty">
              {isCorbeille
                ? 'Aucune commande supprimée pour cette campagne.'
                : 'Aucune commande trouvée pour cette campagne.'}
            </div>
          )}

          {isLeadCampaign && leadClients.length > 0 && (
            <>
              <div className="commandesList__table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Réf.</th>
                      <th>Date de prise</th>
                      <th>Rendez-vous</th>
                      <th>Client</th>
                      <th>Interlocuteur</th>
                      <th>Agent</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leadClients.map((lead) => (
                      <tr
                        key={lead.id_lead}
                        onClick={() => handleLeadRowClick(lead)}
                        className="commandesList__row--clickable"
                      >
                        <td>{formatLeadClientReference(lead.id_lead)}</td>
                        <td>{formatDate(lead.created_at)}</td>
                        <td>{formatLeadSlot(lead.date_rdv, lead.heure_rdv)}</td>
                        <td>{leadProspectName(lead)}</td>
                        <td>{leadInterlocuteur(lead)}</td>
                        <td>{leadAgentName(lead)}</td>
                        <td>
                          <span
                            className={`statut-badge statut-badge--${lead.statut}`}
                            style={{ backgroundColor: STATUT_RENDEZ_VOUS_COLORS[lead.statut] }}
                          >
                            {STATUT_RENDEZ_VOUS_LABELS[lead.statut]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {leadPagination && leadPagination.totalPages > 1 && (
                <div className="commandesList__pagination">
                  <Button style="grey" onClick={() => handlePageChange(leadPage - 1)} disabled={leadPage <= 1}>
                    Précédent
                  </Button>
                  <span>Page {leadPage} / {leadPagination.totalPages}</span>
                  <Button style="grey" onClick={() => handlePageChange(leadPage + 1)} disabled={leadPage >= leadPagination.totalPages}>
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}

          {!isLeadCampaign && ventes.length > 0 && (
            <>
              <div className="commandesList__table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Réf.</th>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Agent</th>
                      <th>Montant</th>
                      {!isCorbeille && <th>Statut</th>}
                      {!isCorbeille && <th>Paiement</th>}
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventes.map((vente) => (
                      <tr
                        key={vente.id_vente}
                        onClick={() => handleSaleRowClick(vente)}
                        className={[
                          !isCorbeille ? 'commandesList__row--clickable' : '',
                          vente.soft_deleted ? 'commandesList__row--deleted' : '',
                        ].filter(Boolean).join(' ')}
                      >
                        <td>{vente.reference_doc ?? `#${vente.id_vente}`}</td>
                        <td>{formatDate(vente.date_vente)}</td>
                        <td>{prospectName(vente)}</td>
                        <td>{agentName(vente)}</td>
                        <td className="commandesList__montant">{formatMontant(vente.montant_total)}</td>
                        {!isCorbeille && (
                          <td>
                            <span
                              className={`statut-badge statut-badge--${vente.statut_vente}`}
                              style={{ backgroundColor: STATUT_VENTE_COLORS[vente.statut_vente] }}
                            >
                              {STATUT_VENTE_LABELS[vente.statut_vente]}
                            </span>
                          </td>
                        )}
                        {!isCorbeille && (
                          <td>{vente.mode_paiement ? MODE_PAIEMENT_LABELS[vente.mode_paiement as ModePaiement] ?? vente.mode_paiement : '—'}</td>
                        )}
                        <td className="commandesList__actions-cell" onClick={(event) => event.stopPropagation()}>
                          {isCorbeille ? (
                            <button
                              className="commandesList__restore-btn"
                              onClick={(event) => handleRestoreClick(vente, event)}
                              title="Restaurer la commande"
                            >
                              <MdRestore />
                            </button>
                          ) : (
                            <button
                              className="commandesList__delete-btn"
                              onClick={(event) => handleDeleteClick(vente, event)}
                              title="Supprimer la commande"
                            >
                              <MdDelete />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="commandesList__pagination">
                  <Button style="grey" onClick={() => handlePageChange(salePage - 1)} disabled={salePage <= 1}>
                    Précédent
                  </Button>
                  <span>Page {salePage} / {pagination.totalPages}</span>
                  <Button style="grey" onClick={() => handlePageChange(salePage + 1)} disabled={salePage >= pagination.totalPages}>
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const CommandesListWithAuth = WithAuth(CommandesList);
export default CommandesListWithAuth;
