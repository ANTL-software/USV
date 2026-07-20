import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import type { UpdateCourrierViewModel } from '../../../hooks/index.ts';
import {
  Button,
  CourrierUpdateForm,
  CourrierUpdatePreview,
  Loader,
} from '../index.ts';

interface CourrierUpdateContentProps {
  viewModel: UpdateCourrierViewModel;
}

export function CourrierUpdateContent({ viewModel }: CourrierUpdateContentProps): ReactElement {
  if (viewModel.loadingCourrier) {
    return <div className="loadingState"><Loader size="large" message="Chargement du courrier..." /></div>;
  }

  if (!viewModel.courrier) {
    return (
      <div className="errorState">
        <p>Courrier non trouvé</p>
        <Button style="green" onClick={viewModel.navigateToList}>Retour à la liste</Button>
      </div>
    );
  }

  return (
    <>
      <header className="updateCourrierHeader" data-aos="fade-down">
        <Button style="back" onClick={viewModel.navigateToList} type="button">
          <MdArrowBack />
          <span>Retour</span>
        </Button>
        <h1 className="pageTitle">Modifier le courrier</h1>
      </header>
      <div className="updateCourrierContent" data-aos="fade-up" data-aos-delay="100">
        <CourrierUpdateForm viewModel={viewModel} />
        <CourrierUpdatePreview {...viewModel} />
      </div>
    </>
  );
}
