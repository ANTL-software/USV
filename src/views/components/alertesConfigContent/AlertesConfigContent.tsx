import type { ReactElement } from 'react';
import { MdAdd, MdArrowBack } from 'react-icons/md';
import type { AlertesConfigPageViewModel } from '../../../hooks/index.ts';
import { AlerteConfigCard } from '../alerteConfigCard/index.ts';
import { Button } from '../button/index.ts';
import { Loader } from '../loader/index.ts';

interface AlertesConfigContentProps { viewModel: AlertesConfigPageViewModel }

export function AlertesConfigContent({ viewModel }: AlertesConfigContentProps): ReactElement {
  return <div className="alertesConfigView__container"><div className="alertesConfigView__header"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /> Retour</Button><h2>Configuration des alertes</h2><Button style="orange" onClick={() => { void viewModel.createAlerte(); }}><MdAdd /> Nouvelle alerte</Button></div>{viewModel.isLoading && <Loader message="Chargement de la configuration..." />}{viewModel.error && <div className="alertesConfigView__error">{viewModel.error}</div>}{!viewModel.isLoading && viewModel.alertes.length === 0 && <div className="alertesConfigView__empty"><p>Aucune alerte configurée</p><Button style="orange" onClick={() => { void viewModel.createAlerte(); }}><MdAdd /> Créer la première alerte</Button></div>}<div className="alertesConfigView__alertes">{viewModel.alertes.map((alerte) => <AlerteConfigCard key={alerte.id_alerte} alerte={alerte} onUpdate={(id, payload) => { void viewModel.updateAlerte(id, payload); }} onDelete={(id) => { void viewModel.deactivate(id); }} />)}</div></div>;
}
