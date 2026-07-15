import './projetDetails.scss';
import { ReactElement, useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoCreate,
  IoPeople,
  IoStatsChart,
  IoCheckmarkCircle,
  IoTime,
  IoPersonAdd,
  IoSettings,
} from 'react-icons/io5';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

import { useProjet, useProjetDashboard, useProjetMembres } from '../../../hooks/useProjet';
import { useProjets } from '../../../hooks/useProjet';
import { useEmployes } from '../../../hooks/useEmployes';
import type { StatutProjet } from '../../../utils/types/projet.types';

function ProjetDetails(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ? parseInt(id, 10) : null;

  const { projet, isLoading: projetLoading, error: projetError, load: loadProjet } = useProjet(projectId);
  const { dashboard, load: loadDashboard } = useProjetDashboard(projectId);
  const { membres, isLoading: membresLoading, load: loadMembres, addMembre, removeMembre } = useProjetMembres(projectId);
  const { updateStatutProjet } = useProjets();
  const { employes } = useEmployes();

  const [showMembreForm, setShowMembreForm] = useState(false);
  const [newMembreId, setNewMembreId] = useState('');
  const [newRole, setNewRole] = useState<'membre' | 'observateur'>('membre');

  useEffect(() => {
    if (projectId) {
      loadProjet();
      loadDashboard();
      loadMembres();
    }
  }, [projectId, loadProjet, loadDashboard, loadMembres]);

  const handleStatutChange = useCallback(async (newStatut: StatutProjet) => {
    if (!projectId || !projet) return;
    try {
      await updateStatutProjet(projectId, newStatut);
      loadProjet();
    } catch (err) {
      console.error('Erreur lors du changement de statut:', err);
    }
  }, [projectId, projet, updateStatutProjet, loadProjet]);

  const handleAddMembre = useCallback(async () => {
    if (!projectId || !newMembreId) return;
    try {
      await addMembre({ id_employe: parseInt(newMembreId, 10), role: newRole });
      setNewMembreId('');
      setNewRole('membre');
      setShowMembreForm(false);
      loadMembres();
    } catch (err) {
      console.error('Erreur lors de l\'ajout du membre:', err);
    }
  }, [projectId, newMembreId, newRole, addMembre, loadMembres]);

  const handleRemoveMembre = useCallback(async (idMembre: number) => {
    if (!projectId) return;
    try {
      await removeMembre(idMembre);
      loadMembres();
    } catch (err) {
      console.error('Erreur lors du retrait du membre:', err);
    }
  }, [projectId, removeMembre, loadMembres]);

  const getStatutBadgeClass = (statut: StatutProjet): string => {
    const baseClass = 'projetDetails__badge';
    switch (statut) {
      case 'actif': return `${baseClass}--actif`;
      case 'termine': return `${baseClass}--termine`;
      case 'en_pause': return `${baseClass}--pause`;
      case 'annule': return `${baseClass}--annule`;
      default: return `${baseClass}--brouillon`;
    }
  };

  if (projetLoading || !projet) {
    return (
      <div id="projetDetails">
        <Header />
        <SubNav />
        <main>
          <div className="projetDetails__container">
            <div className="projetDetails__loading">
              <div className="spinner" />
              <p>Chargement du projet...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (projetError) {
    return (
      <div id="projetDetails">
        <Header />
        <SubNav />
        <main>
          <div className="projetDetails__container">
            <div className="projetDetails__error">
              <p>{projetError}</p>
              <Button style="gradient" onClick={() => navigate('/projets')}>Retour</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div id="projetDetails">
      <Header />
      <SubNav />
      <main>
        <div className="projetDetails__container">
          {/* Header */}
          <div className="projetDetails__header">
            <Button style="back" onClick={() => navigate('/projets')}>
              <IoArrowBack />
              <span>Retour</span>
            </Button>
            <div className="projetDetails__title">
              <h1>{projet.titre}</h1>
              <span className={getStatutBadgeClass(projet.statut)}>{projet.statut}</span>
            </div>
            <div className="projetDetails__actions">
              <Button style="white" onClick={() => navigate(`/projets/${projet.id_projet}/taches`)}>
                <IoStatsChart />
                <span>Tâches</span>
              </Button>
              <Button style="gradient" onClick={() => navigate(`/projets/${projet.id_projet}/edit`)}>
                <IoCreate />
                <span>Modifier</span>
              </Button>
            </div>
          </div>

          {/* Dashboard KPI */}
          {dashboard && (
            <div className="projetDetails__dashboard">
              <div className="projetDetails__kpi">
                <div className="projetDetails__kpi-icon projetDetails__kpi-icon--progress">
                  <IoStatsChart />
                </div>
                <div className="projetDetails__kpi-content">
                  <p className="projetDetails__kpi-label">Progression</p>
                  <p className="projetDetails__kpi-value">{dashboard.stats.progression_calculee}%</p>
                  <div className="projetDetails__kpi-bar">
                    <div
                      className="projetDetails__kpi-fill"
                      style={{ width: `${dashboard.stats.progression_calculee}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="projetDetails__kpi">
                <div className="projetDetails__kpi-icon projetDetails__kpi-icon--tasks">
                  <IoCheckmarkCircle />
                </div>
                <div className="projetDetails__kpi-content">
                  <p className="projetDetails__kpi-label">Tâches terminées</p>
                  <p className="projetDetails__kpi-value">{dashboard.stats.taches_par_statut.termine} / {dashboard.stats.taches_total}</p>
                </div>
              </div>

              <div className="projetDetails__kpi">
                <div className="projetDetails__kpi-icon projetDetails__kpi-icon--time">
                  <IoTime />
                </div>
                <div className="projetDetails__kpi-content">
                  <p className="projetDetails__kpi-label">Temps estimé</p>
                  <p className="projetDetails__kpi-value">{dashboard.stats.temps_esthe_total}h</p>
                </div>
              </div>

              <div className="projetDetails__kpi">
                <div className="projetDetails__kpi-icon projetDetails__kpi-icon--members">
                  <IoPeople />
                </div>
                <div className="projetDetails__kpi-content">
                  <p className="projetDetails__kpi-label">Membres</p>
                  <p className="projetDetails__kpi-value">{membres.length}</p>
                </div>
              </div>
            </div>
          )}

          <div className="projetDetails__grid">
            {/* Informations */}
            <div className="projetDetails__card">
              <div className="projetDetails__card-header">
                <h2>Informations</h2>
              </div>
              <div className="projetDetails__card-body">
                <div className="projetDetails__info">
                  <span className="projetDetails__info-label">Type</span>
                  <span className="projetDetails__info-value">{projet.type_projet}</span>
                </div>
                <div className="projetDetails__info">
                  <span className="projetDetails__info-label">Priorité</span>
                  <span className={`projetDetails__badge projetDetails__badge--${projet.priorite}`}>
                    {projet.priorite}
                  </span>
                </div>
                <div className="projetDetails__info">
                  <span className="projetDetails__info-label">Pilote</span>
                  <span className="projetDetails__info-value">
                    {projet.pilote ? `${projet.pilote.prenom} ${projet.pilote.nom}` : 'Non assigné'}
                  </span>
                </div>
                {projet.date_debut && (
                  <div className="projetDetails__info">
                    <span className="projetDetails__info-label">Date de début</span>
                    <span className="projetDetails__info-value">
                      {new Date(projet.date_debut).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                {projet.date_fin && (
                  <div className="projetDetails__info">
                    <span className="projetDetails__info-label">Date de fin</span>
                    <span className="projetDetails__info-value">
                      {new Date(projet.date_fin).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                {projet.description && (
                  <div className="projetDetails__description">
                    <span className="projetDetails__info-label">Description</span>
                    <p>{projet.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Membres */}
            <div className="projetDetails__card">
              <div className="projetDetails__card-header">
                <h2>Membres</h2>
                <Button
                  style="gradient"
                  onClick={() => setShowMembreForm(!showMembreForm)}
                >
                  <IoPersonAdd />
                  <span>Ajouter</span>
                </Button>
              </div>
              <div className="projetDetails__card-body">
                {showMembreForm && (
                  <div className="projetDetails__membre-form">
                    <select
                      value={newMembreId}
                      onChange={(e) => setNewMembreId(e.target.value)}
                      className="projetDetails__employe-select"
                    >
                      <option value="">Sélectionner un employé...</option>
                      {employes
                        .filter(emp => !membres.some(m => m.id_employe === emp.id_employe) && emp.id_employe !== projet?.pilote?.id_employe)
                        .map((employe) => (
                          <option key={employe.id_employe} value={employe.id_employe}>
                            {employe.prenom} {employe.nom} - {employe.poste?.libelle_poste || 'Sans poste'}
                          </option>
                        ))
                      }
                    </select>
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'membre' | 'observateur')}>
                      <option value="membre">Membre</option>
                      <option value="observateur">Observateur</option>
                    </select>
                    <Button style="gradient" onClick={handleAddMembre}>Ajouter</Button>
                    <Button style="white" onClick={() => setShowMembreForm(false)}>Annuler</Button>
                  </div>
                )}

                {membresLoading ? (
                  <div className="projetDetails__loading-small">Chargement...</div>
                ) : membres.length === 0 ? (
                  <div className="projetDetails__empty">Aucun membre</div>
                ) : (
                  <div className="projetDetails__membres-list">
                    {membres.map((membre) => (
                      <div key={membre.id_membre} className="projetDetails__membre-item">
                        <div className="projetDetails__membre-info">
                          <span className="projetDetails__membre-name">
                            {membre.employe?.prenom} {membre.employe?.nom}
                          </span>
                          <span className={`projetDetails__membre-role projetDetails__membre-role--${membre.role}`}>
                            {membre.role}
                          </span>
                        </div>
                        <Button
                          style="white"
                          onClick={() => handleRemoveMembre(membre.id_membre)}
                          className="projetDetails__membre-remove"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="projetDetails__quick-actions">
            <h3>Actions rapides</h3>
            <div className="projetDetails__actions-grid">
              {projet.statut === 'brouillon' && (
                <Button
                  style="gradient"
                  onClick={() => handleStatutChange('actif')}
                >
                  <IoCheckmarkCircle />
                  <span>Activer le projet</span>
                </Button>
              )}
              {projet.statut === 'actif' && (
                <Button
                  style="gradient"
                  onClick={() => handleStatutChange('en_pause')}
                >
                  <IoTime />
                  <span>Mettre en pause</span>
                </Button>
              )}
              {projet.statut === 'en_pause' && (
                <Button
                  style="gradient"
                  onClick={() => handleStatutChange('actif')}
                >
                  <IoCheckmarkCircle />
                  <span>Reprendre</span>
                </Button>
              )}
              {(projet.statut === 'actif' || projet.statut === 'en_pause') && (
                <Button
                  style="white"
                  onClick={() => navigate(`/projets/${projet.id_projet}/taches`)}
                >
                  <IoStatsChart />
                  <span>Voir les tâches</span>
                </Button>
              )}
              <Button
                style="white"
                onClick={() => navigate(`/projets/${projet.id_projet}/edit`)}
              >
                <IoSettings />
                <span>Paramètres</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const ProjetDetailsWithAuth = WithAuth(ProjetDetails);
export default ProjetDetailsWithAuth;
