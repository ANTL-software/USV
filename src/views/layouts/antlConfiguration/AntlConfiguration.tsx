import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';

import '../campagneForm/campagneForm.scss';

import { useAntlConfigurationView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import {
  AntlConfigurationBilling,
  AntlConfigurationCompany,
  AntlConfigurationUploadModal,
  BackToTop,
  Button,
  Header,
  SubNav,
} from '../../components/index.ts';

function AntlConfiguration(): ReactElement {
  const viewModel = useAntlConfigurationView();
  const { configuration } = viewModel;

  if (configuration.isFetching) {
    return <div id="campagneForm"><Header /><SubNav /><main><div className="campagneForm__loading">Chargement...</div></main></div>;
  }

  return (
    <div id="campagneForm">
      <Header />
      <SubNav />
      <main>
        <div className="campagneForm__container">
          <div className="campagneForm__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour au commercial</span></Button></div>
          <h1>Configuration antl</h1>
          {configuration.error && <div className="campagneForm__error">{configuration.error}</div>}
          {configuration.success && <div className="campagneForm__success">{configuration.success}</div>}
          <div className="campagneForm__layout">
            <form onSubmit={configuration.handleSubmit} className="campagneForm__form">
              <AntlConfigurationCompany viewModel={viewModel} />
              <AntlConfigurationBilling viewModel={viewModel} />
              <div className="campagneForm__actions">
                <Button style="grey" type="button" onClick={viewModel.navigateBack}>Annuler</Button>
                <Button style="gradient" type="submit" disabled={configuration.isLoading}>{configuration.isLoading ? 'Enregistrement...' : 'Mettre à jour la configuration'}</Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <BackToTop />
      <AntlConfigurationUploadModal state={configuration.logoUpload} title="Uploader un logo antl" placeholder="Ex: logo-antl" accept="image/png,image/jpeg,image/jpg,image/webp" formatHint="PNG, JPG, WEBP (max 2 Mo)" />
      <AntlConfigurationUploadModal state={configuration.ribUpload} title="Uploader un RIB numérique" placeholder="Ex: rib-antl" accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp" formatHint="PDF, PNG, JPG, WEBP (max 10 Mo)" />
    </div>
  );
}

const AuthenticatedAntlConfiguration = WithAuth(AntlConfiguration);
export default function AntlConfigurationRoute(): ReactElement {
  return <AuthenticatedAntlConfiguration />;
}
