import { ReactElement, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';
import { VenteContext } from '../../../context/venteContext/VenteContext.tsx';
import { useCampagnes } from '../../../hooks/useCampagnes';
import { getVenteDocumentUrl } from '../../../API/services/vente.service.ts';
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
  const parts = [v.prospect.nom.toUpperCase()];
  if (v.prospect.prenom) parts.push(v.prospect.prenom);
  return parts.join(' ');
}

function agentName(v: Vente): string {
  if (!v.agent) return '—';
  return `${v.agent.prenom} ${v.agent.nom.toUpperCase()}`;
}

function CommandesList(): ReactElement {
  const navigate = useNavigate();
  const venteCtx = useContext(VenteContext);
  const { campagnes } = useCampagnes();

  if (!venteCtx) throw new Error('CommandesList must be used within a VenteProvider');

  const { ventes, pagination, isLoading, error, filters, setFilters, load } = venteCtx;

  const [localStatut, setLocalStatut] = useState<StatutVente | ''>('');
  const [localDateDebut, setLocalDateDebut] = useState('');
  const [localDateFin, setLocalDateFin] = useState('');

  useEffect(() => {
    if (filters.campagne) {
      load();
    }
  }, [filters.campagne, load]);

  const handleCampagneChange = useCallback((campagneId: number | null) => {
    setFilters({ campagne: campagneId ?? undefined, page: 1 });
  }, [setFilters]);

  const handleSearch = useCallback(() => {
    setFilters({
      statut: localStatut || undefined,
      date_debut: localDateDebut || undefined,
      date_fin: localDateFin || undefined,
      page: 1,
    });
    load();
  }, [localStatut, localDateDebut, localDateFin, setFilters, load]);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters({ page: newPage });
    load();
  }, [setFilters, load]);

  const handleRowClick = useCallback((v: Vente) => {
    const url = getVenteDocumentUrl(v.id_vente);
    window.open(url, '_blank');
  }, []);

  const campagneOptions = campagnes.map(c => ({
    value: String(c.id_campagne),
    label: c.nom_campagne,
  }));

  const statutOptions = [
    { value: '', label: 'Tous les statuts' },
    ...STATUT_VENTE_OPTIONS,
  ];

  // Stats calculées
  const totalVentes = ventes.length;
  const montantTotal = ventes.reduce((sum, v) => sum + parseFloat(v.montant_total || '0'), 0);
  const validees = ventes.filter(v => v.statut_vente === 'validee').length;
  const enAttente = ventes.filter(v => v.statut_vente === 'en_attente').length;
  const annulees = ventes.filter(v => v.statut_vente === 'annulee').length;
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
                placeholder="Choisir une campagne..."
                isClearable
              />
            </div>

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

          {/* Cards récapitulatives */}
          {ventes.length > 0 && (
            <div className="commandesList__summary">
              <div className="summary-card summary-card--total">
                <span className="summary-card__value">{totalVentes}</span>
                <span className="summary-card__label">Commandes</span>
              </div>
              <div className="summary-card summary-card--amount">
                <span className="summary-card__value">{formatMontant(String(montantTotal))}</span>
                <span className="summary-card__label">Montant total</span>
              </div>
              <div className="summary-card summary-card--validee">
                <span className="summary-card__value">{validees}</span>
                <span className="summary-card__label">Validées</span>
              </div>
              <div className="summary-card summary-card--attente">
                <span className="summary-card__value">{enAttente}</span>
                <span className="summary-card__label">En attente</span>
              </div>
              <div className="summary-card summary-card--annulee">
                <span className="summary-card__value">{annulees}</span>
                <span className="summary-card__label">Annulées</span>
              </div>
            </div>
          )}

          {/* Contenu */}
          {!filters.campagne && (
            <div className="empty">Sélectionnez une campagne pour voir les commandes.</div>
          )}

          {filters.campagne && isLoading && (
            <Loader size="medium" message="Chargement des commandes..." />
          )}

          {filters.campagne && !isLoading && ventes.length === 0 && !error && (
            <div className="empty">Aucune commande trouvée pour cette campagne.</div>
          )}

          {ventes.length > 0 && (
            <>
              <div className="commandesList__table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Réf.</th>
                      <th>Date</th>
                      <th>Prospect</th>
                      <th>Agent</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventes.map(v => (
                      <tr key={v.id_vente} onClick={() => handleRowClick(v)} className="commandesList__row--clickable">
                        <td>{v.reference_doc ?? `#${v.id_vente}`}</td>
                        <td>{formatDate(v.date_vente)}</td>
                        <td>{prospectName(v)}</td>
                        <td>{agentName(v)}</td>
                        <td className="commandesList__montant">{formatMontant(v.montant_total)}</td>
                        <td>
                          <span
                            className={`statut-badge statut-badge--${v.statut_vente}`}
                            style={{ backgroundColor: STATUT_VENTE_COLORS[v.statut_vente as StatutVente] }}
                          >
                            {STATUT_VENTE_LABELS[v.statut_vente as StatutVente]}
                          </span>
                        </td>
                        <td>{v.mode_paiement ? MODE_PAIEMENT_LABELS[v.mode_paiement as ModePaiement] ?? v.mode_paiement : '—'}</td>
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
