import './tachesKanban.scss';
import { ReactElement, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoAdd,
  IoChevronBack,
  IoChevronForward,
  IoChevronUp,
  IoChevronDown,
  IoPerson,
  IoTime,
  IoFlag,
  IoOptions,
} from 'react-icons/io5';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

import { useKanban } from '../../../hooks/useTache';
import type { Tache, StatutTache } from '../../../utils/types/projet.types';

interface KanbanColumn {
  id: StatutTache;
  title: string;
  color: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'a_faire', title: 'À faire', color: '#e5e7eb' },
  { id: 'en_cours', title: 'En cours', color: '#dbeafe' },
  { id: 'en_attente', title: 'En attente', color: '#fef9c3' },
  { id: 'termine', title: 'Terminé', color: '#dcfce7' },
];

function TachesKanban(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ? parseInt(id, 10) : null;

  const { columns, isLoading, error, load, moveTache, moveTacheUp, moveTacheDown } = useKanban(projectId);

  useEffect(() => {
    load();
  }, [load]);

  const handleMoveTache = useCallback(async (tache: Tache, nouveauStatut: StatutTache) => {
    try {
      await moveTache(tache.id_tache, nouveauStatut);
    } catch (err) {
      console.error('Erreur lors du déplacement de la tâche:', err);
    }
  }, [moveTache]);

  const getPrioriteBadgeClass = (priorite: string): string => {
    const baseClass = 'tachesKanban__badge';
    switch (priorite) {
      case 'critique': return `${baseClass}--critique`;
      case 'haute': return `${baseClass}--haute`;
      case 'basse': return `${baseClass}--basse`;
      default: return `${baseClass}--normale`;
    }
  };

  const getStatutIcon = (statut: StatutTache): string => {
    switch (statut) {
      case 'a_faire': return '⏳';
      case 'en_cours': return '▶️';
      case 'en_attente': return '⏸️';
      case 'termine': return '✅';
      default: return '📋';
    }
  };

  return (
    <div id="tachesKanban">
      <Header />
      <SubNav />
      <main>
        <div className="tachesKanban__container">
          {/* Header */}
          <div className="tachesKanban__header">
            <Button style="back" onClick={() => navigate(`/projets/${projectId}`)}>
              <IoArrowBack />
              <span>Retour</span>
            </Button>
            <h1>Tâches</h1>
            <Button
              style="gradient"
              onClick={() => navigate(`/projets/${projectId}/taches/new`)}
            >
              <IoAdd />
              <span>Nouvelle tâche</span>
            </Button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="tachesKanban__loading">
              <div className="spinner" />
              <p>Chargement des tâches...</p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="tachesKanban__error">
              <p>{error}</p>
              <Button style="gradient" onClick={() => load()}>Réessayer</Button>
            </div>
          )}

          {/* Kanban Board */}
          {!isLoading && !error && (
            <div className="tachesKanban__board">
              {COLUMNS.map((column) => (
                <div
                  key={column.id}
                  className="tachesKanban__column"
                  style={{ backgroundColor: column.color }}
                >
                  <div className="tachesKanban__column-header">
                    <span className="tachesKanban__column-icon">
                      {getStatutIcon(column.id)}
                    </span>
                    <h2 className="tachesKanban__column-title">{column.title}</h2>
                    <span className="tachesKanban__column-count">
                      {columns[column.id]?.length || 0}
                    </span>
                  </div>

                  <div className="tachesKanban__tasks">
                    {columns[column.id]
                      ?.sort((a, b) => {
                        // Tri par ordre, puis par ID pour stabilité
                        if (a.ordre !== b.ordre) {
                          return a.ordre - b.ordre;
                        }
                        return a.id_tache - b.id_tache;
                      })
                      .map((tache, index, taskArray) => {
                        // Vérifier si c'est la première ou dernière tâche en termes d'ordre
                        const isFirst = index === 0;
                        const isLast = index === taskArray.length - 1;

                        return (
                      <div
                        key={tache.id_tache}
                        className="tachesKanban__task"
                        onClick={() => navigate(`/projets/${projectId}/taches/${tache.id_tache}`)}
                      >
                        {/* Header */}
                        <div className="tachesKanban__task-header">
                          <span className={getPrioriteBadgeClass(tache.priorite)}>
                            <IoFlag />
                          </span>
                          {tache.progression > 0 && (
                            <span className="tachesKanban__task-progress">
                              {tache.progression}%
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="tachesKanban__task-title">{tache.titre}</h3>

                        {/* Description */}
                        {tache.description && (
                          <p className="tachesKanban__task-description">
                            {tache.description}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="tachesKanban__task-footer">
                          {tache.assigne && (
                            <div className="tachesKanban__task-assignee">
                              <IoPerson />
                              <span>
                                {tache.assigne.prenom} {tache.assigne.nom}
                              </span>
                            </div>
                          )}

                          {tache.temps_esthe && tache.temps_esthe > 0 && (
                            <div className="tachesKanban__task-time">
                              <IoTime />
                              <span>{tache.temps_esthe}h</span>
                            </div>
                          )}

                          {tache.tags && tache.tags.length > 0 && (
                            <div className="tachesKanban__task-tags">
                              {tache.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag.id_tag}
                                  className="tachesKanban__tag"
                                  style={{
                                    backgroundColor: tag.couleur || '#e5e7eb',
                                    color: '#374151',
                                  }}
                                >
                                  {tag.libelle}
                                </span>
                              ))}
                              {tache.tags.length > 2 && (
                                <span className="tachesKanban__tag-more">
                                  +{tache.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="tachesKanban__task-actions">
                          {/* Bouton gauche - statut précédent */}
                          {column.id !== 'a_faire' && (
                            <Button
                              style="white"
                              onClick={(e) => {
                                e.stopPropagation();
                                const columnIndex = COLUMNS.findIndex(c => c.id === column.id);
                                const prevColumn = COLUMNS[columnIndex - 1];
                                if (prevColumn) {
                                  handleMoveTache(tache, prevColumn.id);
                                }
                              }}
                              className="tachesKanban__task-btn"
                            >
                              <IoChevronBack />
                            </Button>
                          )}

                          {/* Boutons monter/descendre - ordre dans la colonne */}
                          {!isFirst && (
                            <Button
                              style="white"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTacheUp(tache.id_tache, tache.ordre);
                              }}
                              className="tachesKanban__task-btn"
                            >
                              <IoChevronUp />
                            </Button>
                          )}

                          {!isLast && (
                            <Button
                              style="white"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTacheDown(tache.id_tache, tache.ordre);
                              }}
                              className="tachesKanban__task-btn"
                            >
                              <IoChevronDown />
                            </Button>
                          )}

                          {/* Bouton droit - statut suivant */}
                          {column.id !== 'termine' && (
                            <Button
                              style="gradient"
                              onClick={(e) => {
                                e.stopPropagation();
                                const columnIndex = COLUMNS.findIndex(c => c.id === column.id);
                                const nextColumn = COLUMNS[columnIndex + 1];
                                if (nextColumn) {
                                  handleMoveTache(tache, nextColumn.id);
                                }
                              }}
                              className="tachesKanban__task-btn"
                            >
                              <IoChevronForward />
                            </Button>
                          )}

                          {/* Bouton options - détails */}
                          <Button
                            style="white"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projets/${projectId}/taches/${tache.id_tache}`);
                            }}
                            className="tachesKanban__task-btn"
                          >
                            <IoOptions />
                          </Button>
                        </div>
                      </div>
                        );
                      })}

                    {(!columns[column.id] || columns[column.id].length === 0) && (
                      <div className="tachesKanban__empty">
                        <p>Aucune tâche</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const TachesKanbanWithAuth = WithAuth(TachesKanban);
export default TachesKanbanWithAuth;
