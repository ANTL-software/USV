import type { ReactElement } from 'react';
import { MdArrowBack, MdCancel, MdSave } from 'react-icons/md';

import './nouveauCourrier.scss';

import { useNouveauCourrierView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import {
  Button,
  Header,
  NouveauCourrierFields,
  NouveauCourrierUpload,
  SubNav,
} from '../../components/index.ts';

function NouveauCourrier(): ReactElement {
  const viewModel = useNouveauCourrierView();

  return (
    <>
      <Header />
      <SubNav />
      <main id="nouveauCourrier" className="nouveauCourrierMain">
        <div className="nouveauCourrierContainer">
          <header className="nouveauCourrierHeader" data-aos="fade-down">
            <Button style="back" onClick={viewModel.handleCancel} type="button">
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1 className="pageTitle">Nouveau courrier</h1>
          </header>

          <form
            className="courrierForm"
            onSubmit={viewModel.handleSubmit}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="formGrid">
              <NouveauCourrierUpload viewModel={viewModel} />
              <NouveauCourrierFields viewModel={viewModel} />
            </div>

            <div className="formActions">
              <button
                type="button"
                className="btnCancel"
                onClick={viewModel.handleCancel}
                disabled={viewModel.isLoading}
              >
                <MdCancel />
                Annuler
              </button>
              <button type="submit" className="btnSubmit" disabled={viewModel.submitDisabled}>
                <MdSave />
                {viewModel.isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}

const NouveauCourrierWithAuth = WithAuth(NouveauCourrier);
export default NouveauCourrierWithAuth;
