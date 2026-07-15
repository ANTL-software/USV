import './projetsList.scss';
import { ReactElement, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAdd, IoSearch, IoFilter, IoArrowBack, IoEye, IoCreate, IoFolderOpen, IoCheckmarkDone } from 'react-icons/io5';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

import { useProjets } from '../../../hooks/useProjet';
import type { ListProjetsFilters, StatutProjet, TypeProjet, Priorite } from '../../../utils/types/projet.types';

function ProjetsList(): ReactElement {
  const navigate = useNavigate();
  const {
    projets,
    isLoading,
    error,
    pagination,
    loadProjets,
    refreshProjets,
  } = useProjets();

  const [filters, setFilters] = useState<ListProjetsFilters>({});
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjets(filters, page);
  }, []);

  const handleSearch = useCallback(() => {
    const newFilters = { ...filters, search: searchTerm || undefined };
    setFilters(newFilters);
    setPage(1);
    loadProjets(newFilters, 1);
  }, [searchTerm, filters, loadProjets]);

  const handleFilterChange = useCallback((key: keyof ListProjetsFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value === '' ? undefined : value };
    setFilters(newFilters);
    setPage(1);
    loadProjets(newFilters, 1);
  }, [filters, loadProjets]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    loadProjets(filters, newPage);
  }, [filters, loadProjets]);

  const getStatutBadgeClass = (statut: StatutProjet): string => {
    const baseClass = 'projetsList__badge';
    switch (statut) {
      case 'actif': return `${baseClass}--actif`;
      case 'termine': return `${baseClass}--termine`;
      case 'en_pause': return `${baseClass}--pause`;
      case 'annule': return `${baseClass}--annule`;
      default: return `${baseClass}--brouillon`;
    }
  };

  const getPrioriteBadgeClass = (priorite: Priorite): string => {
    const baseClass = 'projetsList__badge';
    switch (priorite) {
      case 'critique': return `${baseClass}--critique`;
      case 'haute': return `${baseClass}--haute`;
      case 'basse': return `${baseClass}--basse`;
      default: return `${baseClass}--normale`;
    }
  };

  const getTypeBadgeClass = (type: TypeProjet): string => {
    const baseClass = 'projetsList__badge';
    switch (type) {
      case 'developpement': return `${baseClass}--dev`;
      case 'commercial': return `${baseClass}--commercial`;
      case 'administratif': return `${baseClass}--admin`;
      case 'marketing': return `${baseClass}--marketing`;
      case 'rh': return `${baseClass}--rh`;
      case 'technique': return `${baseClass}--technique`;
      default: return `${baseClass}--autre`;
    }
  };

  return (
    <div id="projetsList">
      <Header />
      <SubNav />
      <main>
        <div className="projetsList__container">
          {/* Header */}
          <div className="projetsList__header">
            <Button style="back" onClick={() => navigate('/home')}>
              <IoArrowBack />
              <span>Retour</span>
            </Button>
            <h1>Projets</h1>
            <div className="projetsList__header-actions">
              <Button style="white" onClick={() => navigate('/projets/mes_taches')}>
                <IoCheckmarkDone />
                <span>Mes tâches</span>
              </Button>
              <Button style="gradient" onClick={() => navigate('/projets/new')}>
                <IoAdd />
                <span>Nouveau Projet</span>
              </Button>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="projetsList__filters">
            <div className="projetsList__search">
              <IoSearch />
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="projetsList__filter-selects">
              <select
                value={filters.statut || ''}
                onChange={(e) => handleFilterChange('statut', e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="brouillon">Brouillon</option>
                <option value="actif">Actif</option>
                <option value="en_pause">En pause</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>

              <select
                value={filters.type_projet || ''}
                onChange={(e) => handleFilterChange('type_projet', e.target.value)}
              >
                <option value="">Tous les types</option>
                <option value="developpement">Développement</option>
                <option value="commercial">Commercial</option>
                <option value="administratif">Administratif</option>
                <option value="marketing">Marketing</option>
                <option value="rh">RH</option>
                <option value="technique">Technique</option>
              </select>

              <select
                value={filters.priorite || ''}
                onChange={(e) => handleFilterChange('priorite', e.target.value)}
              >
                <option value="">Toutes les priorités</option>
                <option value="critique">Critique</option>
                <option value="haute">Haute</option>
                <option value="normale">Normale</option>
                <option value="basse">Basse</option>
              </select>
            </div>

            {(filters.statut || filters.type_projet || filters.priorite || filters.search) && (
              <Button
                style="white"
                onClick={() => {
                  setFilters({});
                  setSearchTerm('');
                  setPage(1);
                  loadProjets({}, 1);
                }}
              >
                <IoFilter />
                <span>Réinitialiser</span>
              </Button>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="projetsList__loading">
              <div className="spinner" />
              <p>Chargement des projets...</p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="projetsList__error">
              <p>{error}</p>
              <Button style="gradient" onClick={() => refreshProjets()}>Réessayer</Button>
            </div>
          )}

          {/* Liste vide */}
          {!isLoading && projets.length === 0 && (
            <div className="projetsList__empty">
              <IoFolderOpen size={48} />
              <p>Aucun projet trouvé</p>
              <p>Créez votre premier projet pour commencer</p>
            </div>
          )}

          {/* Tableau des projets */}
          {!isLoading && projets.length > 0 && (
            <>
              <div className="projetsList__table-wrapper">
                <table className="projetsList__table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Type</th>
                      <th>Pilote</th>
                      <th>Statut</th>
                      <th>Priorité</th>
                      <th>Progression</th>
                      <th>Dates</th>
                      <th className="projetsList__actions-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projets.map((projet) => (
                      <tr
                        key={projet.id_projet}
                        onClick={() => navigate(`/projets/${projet.id_projet}`)}
                        className="projetsList__row-clickable"
                      >
                        <td>
                          <div className="projetsList__title">
                            <strong>{projet.titre}</strong>
                            {projet.description && (
                              <p className="projetsList__description">
                                {projet.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={getTypeBadgeClass(projet.type_projet)}>
                            {projet.type_projet}
                          </span>
                        </td>
                        <td>
                          {projet.pilote && (
                            <span>
                              {projet.pilote.prenom} {projet.pilote.nom}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={getStatutBadgeClass(projet.statut)}>
                            {projet.statut}
                          </span>
                        </td>
                        <td>
                          <span className={getPrioriteBadgeClass(projet.priorite)}>
                            {projet.priorite}
                          </span>
                        </td>
                        <td>
                          <div className="projetsList__progression">
                            <div className="projetsList__progression-bar">
                              <div
                                className="projetsList__progression-fill"
                                style={{ width: `${projet.progression}%` }}
                              />
                            </div>
                            <span>{projet.progression}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="projetsList__dates">
                            {projet.date_debut && (
                              <span>Début: {new Date(projet.date_debut).toLocaleDateString('fr-FR')}</span>
                            )}
                            {projet.date_fin && (
                              <span>Fin: {new Date(projet.date_fin).toLocaleDateString('fr-FR')}</span>
                            )}
                          </div>
                        </td>
                        <td className="projetsList__actions-cell">
                          <button
                            className="projetsList__btn-view"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projets/${projet.id_projet}`);
                            }}
                            title="Voir les détails"
                          >
                            <IoEye />
                          </button>
                          <button
                            className="projetsList__btn-edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projets/${projet.id_projet}/edit`);
                            }}
                            title="Modifier"
                          >
                            <IoCreate />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="projetsList__pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                  >
                    Précédent
                  </button>

                  <span>Page {page} sur {pagination.pages}</span>

                  <button
                    disabled={page === pagination.pages}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Suivant
                  </button>
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

const ProjetsListWithAuth = WithAuth(ProjetsList);
export default ProjetsListWithAuth;
