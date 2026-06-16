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
import {
  STATUT_VENTE_OPTIONS,
  STATUT_VENTE_LABELS,
  STATUT_VENTE_COLORS,
  MODE_PAIEMENT_LABELS,
} from '../../../utils/types/vente.types';
import type { StatutVente, Vente, ModePaiement } from '../../../utils/types/vente.types';
import './commandesList.scss';

function formatMontant(montant: string): string {
  const num = parseFloat(montant);
  if (isNaN(num)) return '0,00 €';
  return num.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function prospectName(v: Vente): string {
  if (!v.prospect) return '—';
  const raisonSociale = v.prospect.raison_sociale?.trim();
  if (raisonSociale) return raisonSociale;
  const parts = [v.prospect.nom.toUpperCase()];
  if (v.prospect.prenom) parts.push(v.prospect.prenom);
  return parts.join(' ');
}

function agentName(v: Vente): string {
  if (!v.agent) return '—';
  return `${v.agent.prenom} ${v.agent.nom.toUpperCase()}`;
}

const VUE_OPTIONS = [
  { value: 'actives', label: 'Commandes actives' },
  { value: 'corbeille', label: '🗑️ Corbeille (supprimées)' },
];

function CommandesList(): ReactElement {
  const navigate = useNavigate();
  const venteCtx = useContext(VenteContext);
  const { campagnes } = useCampagnes();

  if (!venteCtx) throw new Error('CommandesList must be used within a VenteProvider');

  const { ventes, pagination, isLoading, error, filters, setFilters, load, stats, resetFilters } = venteCtx;

  const [localStatut, setLocalStatut] = useState<StatutVente | ''>(filters.statut ?? '');
  const [localDateDebut, setLocalDateDebut] = useState(filters.date_debut ?? '');
  const [localDateFin, setLocalDateFin] = useState(filters.date_fin ?? '');
  const [vueMode, setVueMode] = useState<'actives' | 'corbeille'>('actives');

  const isCorbeille = vueMode === 'corbeille';

  // Quand le mode vue change, on recharge
  const handleVueModeChange = useCallback((mode: 'actives' | 'corbeille') => {
    setVueMode(mode);
    setFilters({
      soft_deleted: mode === 'corbeille',
      statut: undefined,
      page: 1,
    });
    setLocalStatut('');
  }, [setFilters]);

  const handleDeleteClick = useCallback(async (v: Vente, e: React.MouseEvent) => {
    e.stopPropagation();

    // Étape 1 : Confirmation de base de la suppression
    const confirmed = await confirm(
      `Êtes-vous sûr de vouloir supprimer la commande ${v.reference_doc ?? `#${v.id_vente}`} ?`,
      "Supprimer la commande",
      "Supprimer",
      "Annuler"
    );
    if (!confirmed) return;

    // Étape 2 : Choix du niveau de suppression (purge ou suppression simple)
    const purge = await confirm(
      "Souhaitez-vous également supprimer l'enregistrement de cette vente au niveau du commercial (CA mensuel, objectif, commission) ?\n\n- OUI (Purge totale) : Supprime définitivement la commande et la retire des statistiques du commercial.\n- NON (Suppression simple) : Retire la commande de cette vue mais la conserve pour le commercial.",
      "Niveau de suppression",
      "Oui (Purge totale)",
      "Non (Suppression simple)"
    );

    try {
      await deleteVenteService(v.id_vente, purge);
      await load();
    } catch (err) {
      console.error('Erreur lors de la suppression de la vente:', err);
      await showError('Impossible de supprimer la commande.', 'Erreur');
    }
  }, [load]);

  const handleRestoreClick = useCallback(async (v: Vente, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = await confirm(
      `Souhaitez-vous restaurer la commande ${v.reference_doc ?? `#${v.id_vente}`} ?\n\nElle réapparaîtra dans la liste des commandes actives.`,
      "Restaurer la commande",
      "Restaurer",
      "Annuler"
    );
    if (!confirmed) return;

    try {
      await restoreVenteService(v.id_vente);
      await showSuccess(`Commande ${v.reference_doc ?? `#${v.id_vente}`} restaurée avec succès.`, 'Restauration');
      await load();
    } catch (err) {
      console.error('Erreur lors de la restauration de la vente:', err);
      await showError('Impossible de restaurer la commande.', 'Erreur');
    }
  }, [load]);

  useEffect(() => {
    if (filters.campagne) {
      load();
    }
  }, [filters.campagne, load]);

  // Synchroniser l'état local avec les filtres du contexte si ceux-ci changent
  useEffect(() => {
    setLocalDateDebut(filters.date_debut ?? '');
    setLocalDateFin(filters.date_fin ?? '');
    setLocalStatut(filters.statut ?? '');
  }, [filters.date_debut, filters.date_fin, filters.statut]);

  // Réinitialiser les filtres au démontage (unmount) du composant
  useEffect(() => {
    return () => {
      resetFilters();
    };
  }, [resetFilters]);

  const handleCampagneChange = useCallback((campagneId: number | null) => {
    setFilters({ campagne: campagneId ?? undefined, soft_deleted: isCorbeille, page: 1 });
  }, [setFilters, isCorbeille]);

  const handleSearch = useCallback(() => {
    setFilters({
      statut: localStatut || undefined,
      date_debut: localDateDebut || undefined,
      date_fin: localDateFin || undefined,
      soft_deleted: isCorbeille,
      page: 1,
    });
  }, [localStatut, localDateDebut, localDateFin, setFilters, isCorbeille]);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters({ page: newPage });
  }, [setFilters]);

  const handleRowClick = useCallback((v: Vente) => {
    if (v.soft_deleted) return;
    navigate(`/operations/commandes/details/${v.id_vente}`);
  }, [navigate]);

  const campagneOptions = campagnes.map(c => ({
    value: String(c.id_campagne),
    label: c.nom_campagne,
  }));

  const statutOptions = [
    { value: '', label: 'Tous les statuts' },
    ...STATUT_VENTE_OPTIONS,
  ];

  // Stats calculées issues du back-end (pour toute la campagne/filtres actifs)
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

  const page = filters.page ?? 1;

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
            <h2>Commandes</h2>
            {isCorbeille && (
              <span className="commandesList__corbeille-badge">🗑️ Mode Corbeille</span>
            )}
          </div>

          {/* Filtres */}
          <div className="commandesList__filters">
            <div className="commandesList__filter-group">
              <label>Campagne</label>
              <Select
                options={campagneOptions}
                value={campagneOptions.find(o => o.value === String(filters.campagne)) ?? null}
                onChange={opt => handleCampagneChange(opt ? Number((opt as typeof campagneOptions[number]).value) : null)}
                styles={reactSelectStyles}
                placeholder="Campagne..."
                isClearable
              />
            </div>

            <div className="commandesList__filter-group">
              <label>Vue</label>
              <Select
                options={VUE_OPTIONS}
                value={VUE_OPTIONS.find(o => o.value === vueMode) ?? VUE_OPTIONS[0]}
                onChange={opt => {
                  if (opt) handleVueModeChange((opt as typeof VUE_OPTIONS[number]).value as 'actives' | 'corbeille');
                }}
                styles={reactSelectStyles}
                isSearchable={false}
              />
            </div>

            {!isCorbeille && (
              <div className="commandesList__filter-group">
                <label>Statut</label>
                <Select
                  options={statutOptions}
                  value={statutOptions.find(o => o.value === localStatut) ?? statutOptions[0]}
                  onChange={opt => {
                    const val = (opt as typeof statutOptions[number] | null)?.value as StatutVente | '' | undefined;
                    setLocalStatut(val ?? '');
                  }}
                  styles={reactSelectStyles}
                  placeholder="Tous les statuts"
                  isSearchable={false}
                />
              </div>
            )}

            <div className="commandesList__filter-group">
              <label>Du</label>
              <input type="date" value={localDateDebut} onChange={e => setLocalDateDebut(e.target.value)} />
            </div>

            <div className="commandesList__filter-group">
              <label>Au</label>
              <input type="date" value={localDateFin} onChange={e => setLocalDateFin(e.target.value)} />
            </div>

            <div className="commandesList__filter-actions">
              <Button style="gradient" onClick={handleSearch} disabled={!filters.campagne || isLoading}>
                {isLoading ? 'Chargement...' : 'Rechercher'}
              </Button>
            </div>
          </div>

          {error && <div className="commandesList__error">{error}</div>}

          {/* Cards récapitulatives — masquées en mode corbeille */}
          {totalVentesCount > 0 && !isCorbeille && (
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

          {/* Compteur corbeille */}
          {ventes.length > 0 && isCorbeille && (
            <div className="commandesList__corbeille-info">
              <span>{ventes.length} commande{ventes.length > 1 ? 's' : ''} supprimée{ventes.length > 1 ? 's' : ''} (soft delete)</span>
            </div>
          )}

          {/* Contenu */}
          {!filters.campagne && (
            <div className="empty">Sélectionnez une campagne pour voir les commandes.</div>
          )}

          {filters.campagne && isLoading && (
            <Loader message="Chargement des commandes..." />
          )}

          {filters.campagne && !isLoading && ventes.length === 0 && !error && (
            <div className="empty">
              {isCorbeille
                ? 'Aucune commande supprimée pour cette campagne.'
                : 'Aucune commande trouvée pour cette campagne.'}
            </div>
          )}

          {ventes.length > 0 && (
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
                    {ventes.map(v => (
                      <tr
                        key={v.id_vente}
                        onClick={() => handleRowClick(v)}
                        className={[
                          !isCorbeille ? 'commandesList__row--clickable' : '',
                          v.soft_deleted ? 'commandesList__row--deleted' : '',
                        ].filter(Boolean).join(' ')}
                      >
                        <td>{v.reference_doc ?? `#${v.id_vente}`}</td>
                        <td>{formatDate(v.date_vente)}</td>
                        <td>{prospectName(v)}</td>
                        <td>{agentName(v)}</td>
                        <td className="commandesList__montant">{formatMontant(v.montant_total)}</td>
                        {!isCorbeille && (
                          <td>
                            <span
                              className={`statut-badge statut-badge--${v.statut_vente}`}
                              style={{ backgroundColor: STATUT_VENTE_COLORS[v.statut_vente as StatutVente] }}
                            >
                              {STATUT_VENTE_LABELS[v.statut_vente as StatutVente]}
                            </span>
                          </td>
                        )}
                        {!isCorbeille && (
                          <td>{v.mode_paiement ? MODE_PAIEMENT_LABELS[v.mode_paiement as ModePaiement] ?? v.mode_paiement : '—'}</td>
                        )}
                        <td className="commandesList__actions-cell" onClick={e => e.stopPropagation()}>
                          {isCorbeille ? (
                            <button
                              className="commandesList__restore-btn"
                              onClick={(e) => handleRestoreClick(v, e)}
                              title="Restaurer la commande"
                            >
                              <MdRestore />
                            </button>
                          ) : (
                            <button
                              className="commandesList__delete-btn"
                              onClick={(e) => handleDeleteClick(v, e)}
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
                  <Button style="grey" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
                    Précédent
                  </Button>
                  <span>Page {page} / {pagination.totalPages}</span>
                  <Button style="grey" onClick={() => handlePageChange(page + 1)} disabled={page >= pagination.totalPages}>
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
