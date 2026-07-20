import type { ReactElement } from 'react';
import { IoAdd, IoPencil } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';

import type { CampagnesListPageViewModel } from '../../../hooks/index.ts';
import type { Campagne, StatutCampagne } from '../../../utils/types/index.ts';
import { BackToTop, Button, Header, SubNav } from '../index.ts';
import { getCampaignVariantLabel } from '../../../utils/scripts/index.ts';

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

interface CampagnesListContentProps { viewModel: CampagnesListPageViewModel; }

export function CampagnesListContent({ viewModel }: CampagnesListContentProps): ReactElement {
  const { campagnes, isLoading, error, changerStatut, navigateBack, navigateToCampaign, navigateToCreate } = viewModel;

  return (
    <div id="campagnesList">
      <Header />
      <SubNav />
      <main>
        <div className="campagnesList__container">
          <div className="campagnesList__back">
            <Button style="back" onClick={navigateBack}>
              <MdArrowBack /><span>Retour</span>
            </Button>
          </div>

          <div className="campagnesList__header">
            <div>
              <h1>Campagnes</h1>
              <p className="campagnesList__subtitle">{campagnes.length} campagne{campagnes.length !== 1 ? 's' : ''}</p>
            </div>
            <Button style="gradient" onClick={navigateToCreate}>
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
                      <tr
                        key={c.id_campagne}
                        onClick={() => navigateToCampaign(c.id_campagne)}
                        className="campagnesList__row--clickable"
                      >
                        <td className="campagnesList__nom">{c.nom_campagne}</td>
                        <td>{getCampaignVariantLabel(c.type_campagne)}</td>
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
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToCampaign(c.id_campagne);
                            }}
                            title="Modifier"
                          >
                            <IoPencil />
                          </button>
                          {nextStatut && (
                            <button
                              className={`campagnesList__btn-statut campagnesList__btn-statut--${nextStatut.value}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                changerStatut(c.id_campagne, nextStatut.value, c.nom_campagne);
                              }}
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
