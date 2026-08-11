import type { ReactElement } from 'react';
import { IoAdd, IoCallOutline, IoLaptopOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';

import './materielList.scss';

import { useMaterielListView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import {
  BackToTop,
  Button,
  Header,
  MaterielAssignmentModals,
  MaterielFormModal,
  MaterielTable,
  SubNav,
} from '../../components/index.ts';

function MaterielList(): ReactElement {
  const viewModel = useMaterielListView();

  return (
    <div id="materielList">
      <Header />
      <SubNav />
      <main>
        <div className="materielList__container">
          <div className="materielList__back">
            <Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button>
          </div>
          <div className="materielList__header">
            <div><h1><IoLaptopOutline /> Matériel</h1><p className="materielList__subtitle">{viewModel.countLabel}</p></div>
            <div className="materielList__header-actions">
              {viewModel.canManageTelephony && (
                <Button style="white" onClick={viewModel.navigateToTelephony}><IoCallOutline /> Gestion de la téléphonie</Button>
              )}
              <Button style="gradient" onClick={viewModel.openCreate}><IoAdd /> Ajouter un matériel</Button>
            </div>
          </div>
          {viewModel.materielStore.error && <div className="materielList__error">{viewModel.materielStore.error}</div>}
          <MaterielTable viewModel={viewModel} />
        </div>
      </main>
      <MaterielFormModal viewModel={viewModel} />
      <MaterielAssignmentModals viewModel={viewModel} />
      <BackToTop />
    </div>
  );
}

const MaterielListWithAuth = WithAuth(MaterielList);
export default MaterielListWithAuth;
