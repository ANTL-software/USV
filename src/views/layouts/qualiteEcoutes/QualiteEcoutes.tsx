import { ReactElement, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdPlayArrow, MdPause, MdDownload, MdSearch } from 'react-icons/md';
import { IoEarOutline } from 'react-icons/io5';
import Select from 'react-select';
import type { GroupBase, SingleValue, StylesConfig } from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

// API services
import { getAllRecordingsService, getRecordingStreamUrl } from '../../../API/services';
import { getAllCampagnesService } from '../../../API/services/campagne.service';
import { getAllEmployesService } from '../../../API/services/user.service';

// styles
import './qualiteEcoutes.scss';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';

// types
import type { Enregistrement, EnregistrementFilters } from '../../../API/services/enregistrement.service';

type FilterOption = { value: string; label: string };

const STATUT_OPTIONS: FilterOption[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'abouti', label: 'Abouti' },
  { value: 'non_abouti', label: 'Non abouti' },
  { value: 'rdv_pris', label: 'Rendez-vous pris' },
  { value: 'vente_conclue', label: 'Vente conclue' },
  { value: 'refus_definitif', label: 'Refus définitif' },
  { value: 'repondeur', label: 'Répondeur' },
  { value: 'relance', label: 'Relance' },
];

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des écoutes';
};

const selectStyles = reactSelectStyles as unknown as StylesConfig<FilterOption, false, GroupBase<FilterOption>>;

const getRecordingPhone = (recording: Enregistrement): string => {
  return recording.appel?.numero_telephone?.trim()
    || recording.appel?.prospect?.telephone?.trim()
    || '—';
};

function QualiteEcoutes(): ReactElement {
  const navigate = useNavigate();

  // Données de base
  const [recordings, setRecordings] = useState<Enregistrement[]>([]);
  const [agents, setAgents] = useState<FilterOption[]>([]);
  const [campaigns, setCampaigns] = useState<FilterOption[]>([]);

  // Filtres
  const [selectedAgent, setSelectedAgent] = useState<FilterOption | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<FilterOption | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<FilterOption | null>(null);
  const [dateDebut, setDateDebut] = useState<string>('');
  const [dateFin, setDateFin] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [recherche, setRecherche] = useState<string>('');

  // Pagination & chargement
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Lecteur
  const [activeRecording, setActiveRecording] = useState<Enregistrement | null>(null);

  // Charger les filtres au montage
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [agentsData, campaignsData] = await Promise.all([
          getAllEmployesService(),
          getAllCampagnesService(),
        ]);

        const agentOptions = [
          { value: '', label: 'Tous les agents' },
          ...agentsData.map((a) => ({
            value: String(a.id_employe),
            label: `${a.prenom} ${a.nom.toUpperCase()}`,
          })),
        ];

        const campaignOptions = [
          { value: '', label: 'Toutes les campagnes' },
          ...campaignsData.map((c) => ({
            value: String(c.id_campagne),
            label: c.nom_campagne,
          })),
        ];

        setAgents(agentOptions);
        setCampaigns(campaignOptions);
      } catch (err) {
        console.error('Erreur chargement des filtres :', err);
      }
    };

    loadFilterData();
  }, []);

  // Fonction de recherche principale
  const fetchRecordings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const filters: EnregistrementFilters = {
      page,
      limit: 10,
      id_agent: selectedAgent?.value || undefined,
      id_campagne: selectedCampaign?.value || undefined,
      statut_appel: selectedStatus?.value || undefined,
      date_debut: dateDebut || undefined,
      date_fin: dateFin || undefined,
      numero_telephone: telephone || undefined,
      recherche: recherche || undefined,
    };

    try {
      const response = await getAllRecordingsService(filters);
      if (response.success) {
        setRecordings(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalCount(response.pagination.total);
      } else {
        setError('Impossible de charger les enregistrements');
      }
    } catch (err: unknown) {
      console.error('Erreur fetchRecordings :', err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedAgent, selectedCampaign, selectedStatus, dateDebut, dateFin, telephone, recherche]);

  // Déclencher la recherche
  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  // Formatage des dates
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatage des durées
  const formatDuration = (sec: number | null): string => {
    if (sec === null || sec === undefined) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Formatage de la taille
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Re-déclencher sur soumission du filtre recherche textuelle
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRecordings();
  };

  const handleResetFilters = () => {
    setSelectedAgent(null);
    setSelectedCampaign(null);
    setSelectedStatus(null);
    setDateDebut('');
    setDateFin('');
    setTelephone('');
    setRecherche('');
    setPage(1);
  };

  return (
    <div id="qualiteEcoutes">
      <Header />
      <SubNav />
      <main>
        <div className="qualiteEcoutes__container">
          <div className="qualiteEcoutes__header">
            <Button style="back" onClick={() => navigate('/operations/qualite')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <div className="qualiteEcoutes__title-wrap">
              <IoEarOutline className="qualiteEcoutes__title-icon" />
              <h1>Écoutes des appels</h1>
            </div>
            <span className="qualiteEcoutes__count">
              {totalCount} appel{totalCount !== 1 ? 's' : ''} enregistré{totalCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Barre de Filtres */}
          <div className="qualiteEcoutes__filters-card">
            <form onSubmit={handleSearchSubmit} className="qualiteEcoutes__filters-form">
              <div className="qualiteEcoutes__filters-row">
                <div className="qualiteEcoutes__filter-col">
                  <label>Recherche globale</label>
                  <div className="qualiteEcoutes__search-input-wrapper">
                    <input
                      type="text"
                      placeholder="Nom, entreprise, téléphone, ID prospect..."
                      value={recherche}
                      onChange={(e) => setRecherche(e.target.value)}
                    />
                    <button type="submit" aria-label="Rechercher">
                      <MdSearch />
                    </button>
                  </div>
                </div>

                <div className="qualiteEcoutes__filter-col">
                  <label>Agent</label>
                  <Select<FilterOption>
                    options={agents}
                    value={selectedAgent}
                    onChange={(opt: SingleValue<FilterOption>) => {
                      setSelectedAgent(opt);
                      setPage(1);
                    }}
                    styles={selectStyles}
                    placeholder="Tous les agents"
                    isClearable
                  />
                </div>

                <div className="qualiteEcoutes__filter-col">
                  <label>Campagne</label>
                  <Select<FilterOption>
                    options={campaigns}
                    value={selectedCampaign}
                    onChange={(opt: SingleValue<FilterOption>) => {
                      setSelectedCampaign(opt);
                      setPage(1);
                    }}
                    styles={selectStyles}
                    placeholder="Toutes les campagnes"
                    isClearable
                  />
                </div>

                <div className="qualiteEcoutes__filter-col">
                  <label>Statut</label>
                  <Select<FilterOption>
                    options={STATUT_OPTIONS}
                    value={selectedStatus}
                    onChange={(opt: SingleValue<FilterOption>) => {
                      setSelectedStatus(opt);
                      setPage(1);
                    }}
                    styles={selectStyles}
                    placeholder="Tous les statuts"
                    isClearable
                  />
                </div>
              </div>

              <div className="qualiteEcoutes__filters-row">
                <div className="qualiteEcoutes__filter-col">
                  <label>Date de début</label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => {
                      setDateDebut(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <div className="qualiteEcoutes__filter-col">
                  <label>Date de fin</label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => {
                      setDateFin(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <div className="qualiteEcoutes__filter-col">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    placeholder="Ex: 04..., 06..., +334..."
                    value={telephone}
                    onChange={(e) => {
                      setTelephone(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>

                <div className="qualiteEcoutes__filter-col qualiteEcoutes__filter-col--buttons">
                  <Button type="button" style="grey" onClick={handleResetFilters}>
                    Réinitialiser
                  </Button>
                  <Button type="submit" style="green">
                    Filtrer
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {error && <div className="qualiteEcoutes__error">{error}</div>}

          {isLoading ? (
            <div className="qualiteEcoutes__loading">Chargement des enregistrements...</div>
          ) : recordings.length === 0 ? (
            <div className="qualiteEcoutes__empty">Aucun enregistrement d'appel trouvé pour ces critères.</div>
          ) : (
            <div className="qualiteEcoutes__table-wrap animate-fade-in">
              <table className="qualiteEcoutes__table">
                <thead>
                  <tr>
                    <th>Date / Heure</th>
                    <th>Agent</th>
                    <th>Campagne</th>
                    <th>Prospect / Raison Sociale</th>
                    <th>Téléphone</th>
                    <th>Durée</th>
                    <th>Statut</th>
                    <th>Fichier</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recordings.map((recording) => {
                    const isCurrentPlaying = activeRecording?.id_enregistrement === recording.id_enregistrement;
                    const prospectInfo = recording.appel?.prospect;
                    const raisonSociale = prospectInfo?.raison_sociale;

                    return (
                      <tr key={recording.id_enregistrement} className={isCurrentPlaying ? 'qualiteEcoutes__row--playing' : ''}>
                        <td>
                          <strong>{formatDate(recording.created_at)}</strong>
                        </td>
                        <td>
                          {recording.agent ? (
                            <span>{recording.agent.prenom} {recording.agent.nom.toUpperCase()}</span>
                          ) : (
                            <span>Agent #{recording.id_agent}</span>
                          )}
                        </td>
                        <td>
                          <span className="qualiteEcoutes__badge-campagne">
                            {recording.appel?.campagne?.nom_campagne || '—'}
                          </span>
                        </td>
                        <td>
                          {raisonSociale ? (
                            <strong>{raisonSociale}</strong>
                          ) : (
                            <span className="qualiteEcoutes__text-muted">Particulier</span>
                          )}
                        </td>
                        <td>{getRecordingPhone(recording)}</td>
                        <td>{formatDuration(recording.duree_secondes)}</td>
                        <td>
                          <span className={`qualiteEcoutes__badge-statut qualiteEcoutes__badge-statut--${recording.appel?.statut_appel || 'en_cours'}`}>
                            {recording.appel?.statut_appel?.replace('_', ' ') || 'en cours'}
                          </span>
                        </td>
                        <td>
                          <span className="qualiteEcoutes__file-info">
                            {formatSize(recording.taille_octets)}
                          </span>
                        </td>
                        <td className="qualiteEcoutes__actions">
                          <button
                            className={`qualiteEcoutes__btn-play ${isCurrentPlaying ? 'qualiteEcoutes__btn-play--active' : ''}`}
                            onClick={() => setActiveRecording(recording)}
                            title={isCurrentPlaying ? 'Lecture en cours' : 'Écouter l\'appel'}
                          >
                            {isCurrentPlaying ? <MdPause /> : <MdPlayArrow />}
                          </button>
                          <a
                            href={getRecordingStreamUrl(recording.id_enregistrement)}
                            download={recording.nom_fichier}
                            className="qualiteEcoutes__btn-download"
                            title="Télécharger l'enregistrement"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MdDownload />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="qualiteEcoutes__pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    Précédent
                  </button>
                  <span className="qualiteEcoutes__page-info">
                    Page <strong>{page}</strong> sur <strong>{totalPages}</strong>
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Lecteur Audio Sticky */}
      {activeRecording && (
        <div className="qualiteEcoutes__player-bar animate-slide-up">
          <div className="qualiteEcoutes__player-info">
            <h3>Écoute en cours</h3>
            <p>
              <strong>Agent :</strong> {activeRecording.agent?.prenom} {activeRecording.agent?.nom.toUpperCase()} |{' '}
              <strong>Appel :</strong> {getRecordingPhone(activeRecording)} |{' '}
              <strong>Raison Sociale :</strong>{' '}
              {activeRecording.appel?.prospect?.raison_sociale ||
                `${activeRecording.appel?.prospect?.prenom || ''} ${
                  activeRecording.appel?.prospect?.nom || ''
                }`.trim() ||
                'Particulier'}
            </p>
          </div>
          <div className="qualiteEcoutes__player-wrapper">
            <audio
              src={getRecordingStreamUrl(activeRecording.id_enregistrement)}
              controls
              autoPlay
              controlsList="nodownload"
            />
          </div>
          <button
            className="qualiteEcoutes__player-close"
            onClick={() => setActiveRecording(null)}
          >
            Fermer
          </button>
        </div>
      )}

      <BackToTop />
    </div>
  );
}

const QualiteEcoutesWithAuth = WithAuth(QualiteEcoutes);
export default QualiteEcoutesWithAuth;
