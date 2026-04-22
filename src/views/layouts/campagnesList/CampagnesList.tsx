import './campagnesList.scss';
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAdd, IoPencil } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';

import WithAuth from '../../../utils/middleware/WithAuth';
import { useCampagnes } from '../../../hooks/useCampagnes';
import type { Campagne, StatutCampagne } from '../../../utils/types/campagne.types';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

const STATUT_LABELS: Record<StatutCampagne, string> = {
  inactive: 'Inactive',
  active: 'Active',
  terminee: 'Terminée',
};

const NEXT_STATUT: Record<StatutCampagne, { label: string; value: StatutCampagne } | null> = {
  inactive: { label: 'Activer', value: 'active' },
  active: { label: 'Terminer', value: 'terminee' },
  terminee: null,
};

function CampagnesList(): ReactElement {
  const navigate = useNavigate();
  const { campagnes, isLoading, error, changerStatut } = useCampagnes();

  return (
    <div id="campagnesList">
      <Header />
      <SubNav />
      <main>
        <div className="campagnesList__container">
          <div className="campagnesList__back">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack /><span>Retour</span>
            </Button>
          </div>

          <div className="campagnesList__header">
            <div>
              <h1>Campagnes</h1>
              <p className="campagnesList__subtitle">{campagnes.length} campagne{campagnes.length !== 1 ? 's' : ''}</p>
            </div>
            <Button style="gradient" onClick={() => navigate('/campagnes/new')}>
              <IoAdd /> Nouvelle campagne
            </Button>
          </div>

          {error && <div className="campagnesList__error">{error}</div>}

          {isLoading ? (
            <div className="campagnesList__loading">Chargement...</div>
          ) : campagnes.length === 0 ? (
            <div className="campagnesList__empty">Aucune campagne. Créez-en une !</div>
          ) : (
            <div className="campagnesList__table-wrapper">
              <table className="campagnesList__table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Agents</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campagnes.map((c: Campagne) => {
                    const nextStatut = NEXT_STATUT[c.statut];
                    return (
                      <tr key={c.id_campagne}>
                        <td className="campagnesList__nom">{c.nom_campagne}</td>
                        <td>{c.type_campagne ?? '—'}</td>
                        <td>{c.date_debut}</td>
                        <td>{c.date_fin ?? '—'}</td>
                        <td className="campagnesList__agents-count">{c.agents_count ?? 0}</td>
                        <td>
                          <span className={`campagnesList__badge campagnesList__badge--${c.statut}`}>
                            {STATUT_LABELS[c.statut]}
                          </span>
                        </td>
                        <td className="campagnesList__actions">
                          <button
                            className="campagnesList__btn-edit"
                            onClick={() => navigate(`/campagnes/${c.id_campagne}`)}
                            title="Modifier"
                          >
                            <IoPencil />
                          </button>
                          {nextStatut && (
                            <button
                              className={`campagnesList__btn-statut campagnesList__btn-statut--${nextStatut.value}`}
                              onClick={() => changerStatut(c.id_campagne, nextStatut.value, c.nom_campagne)}
                            >
                              {nextStatut.label}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const CampagnesListWithAuth = WithAuth(CampagnesList);
export default CampagnesListWithAuth;
