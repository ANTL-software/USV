import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';

import './listeCourriers.scss';

import { useListeCourriersView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import {
  Button,
  CourrierListContent,
  CourrierListFilters,
  CourrierMobileSearch,
  CourrierListOverlays,
  Header,
  SubNav,
} from '../../components/index.ts';

function ListeCourriers(): ReactElement {
  const viewModel = useListeCourriersView();

  return (
    <>
      <Header />
      <SubNav />
      <main id="listeCourriers" className="listeCourrierMain">
        <CourrierMobileSearch viewModel={viewModel} />
        <div className="listeCourrierContainer">
          <header className="listeCourrierHeader" data-aos="fade-down">
            <Button style="back" onClick={viewModel.handleBackClick} type="button">
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1 className="pageTitle">Liste des courriers</h1>
          </header>
          <CourrierListFilters viewModel={viewModel} />
          <CourrierListContent viewModel={viewModel} />
        </div>
        <CourrierListOverlays viewModel={viewModel} />
      </main>
    </>
  );
}

const ListeCourriersWithAuth = WithAuth(ListeCourriers);
export default ListeCourriersWithAuth;
