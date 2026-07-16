import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import type { AlertesHistoryPageViewModel } from '../../../hooks/index.ts';
import type { AlerteStatut, AlerteType } from '../../../utils/types/index.ts';
import { AlerteHistoryRow } from '../alerteHistoryRow/index.ts';
import { Button } from '../button/index.ts';
import { Loader } from '../loader/index.ts';

interface AlertesHistoryContentProps { viewModel: AlertesHistoryPageViewModel }

export function AlertesHistoryContent({ viewModel }: AlertesHistoryContentProps): ReactElement {
  return <div className="alertesHistoryView__container"><div className="alertesHistoryView__header"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /> Retour</Button><h2>Historique des alertes</h2></div><div className="alertesHistoryView__filters"><label className="alertesHistoryView__filter">Statut<select value={viewModel.filters.statut} onChange={(event) => viewModel.setStatusFilter(event.target.value as AlerteStatut | '')}><option value="">Tous</option><option value="active">Actives</option><option value="resolue">Résolues</option><option value="inactive">Inactives</option></select></label><label className="alertesHistoryView__filter">Type<select value={viewModel.filters.type_alerte} onChange={(event) => viewModel.setTypeFilter(event.target.value as AlerteType | '')}><option value="">Tous</option><option value="taux_echec">Taux d’échec</option><option value="duree_courte">Durée courte</option><option value="zero_appel">Aucun appel abouti</option><option value="consommation_trunk">Consommation trunk</option></select></label></div>{viewModel.isLoading && <Loader message="Chargement de l’historique..." />}{viewModel.error && <div className="alertesHistoryView__error">{viewModel.error}</div>}{!viewModel.isLoading && viewModel.alertes.length === 0 && <div className="alertesHistoryView__empty"><p>Aucune alerte trouvée</p></div>}<div className="alertesHistoryView__list">{viewModel.alertes.map((alerte) => <AlerteHistoryRow key={alerte.id_alerte} alerte={alerte} onResolve={(id, comment) => { void viewModel.resolveAlerte(id, comment); }} />)}</div></div>;
}
