import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import type { GroupBase, StylesConfig } from 'react-select';

import './supervisionView.scss';

import { useSupervisionView } from '../../../hooks/index.ts';
import type { SupervisionSelectOption } from '../../../utils/scripts/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import {
  BackToTop,
  Button,
  Header,
  Loader,
  SubNav,
  SupervisionCalls,
  SupervisionOverview,
  SupervisionPerformance,
  WhisperPanel,
} from '../../components/index.ts';

const selectStyles = reactSelectStyles as StylesConfig<
  SupervisionSelectOption,
  false,
  GroupBase<SupervisionSelectOption>
>;

function SupervisionView(): ReactElement {
  const viewModel = useSupervisionView();
  const { supervision, whisper } = viewModel;

  return (
    <div id="supervisionView">
      <Header />
      <SubNav />
      <main>
        <div className="supervisionView__container">
          <div className="supervisionView__header">
            <Button style="back" onClick={viewModel.navigateBack}>
              <MdArrowBack /> Retour
            </Button>
            <h2>Supervision des campagnes</h2>
          </div>

          <div className="supervisionView__selector">
            <label>Sélectionner une campagne active</label>
            <Select<SupervisionSelectOption>
              options={viewModel.campaignOptions}
              value={viewModel.selectedCampaignOption}
              onChange={viewModel.handleCampaignChange}
              styles={selectStyles}
              placeholder="Choisir une campagne..."
              isClearable
            />
          </div>

          {viewModel.selectedCampagne && (
            <>
              {supervision.isLoading && !supervision.queueState && (
                <Loader message="Chargement de la supervision..." />
              )}
              {supervision.error && (
                <div className="supervisionView__error">{supervision.error}</div>
              )}
              {supervision.queueState && (
                <div className="supervisionView__content">
                  <SupervisionOverview viewModel={viewModel} />
                  <SupervisionCalls viewModel={viewModel} />
                  <SupervisionPerformance viewModel={viewModel} />
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BackToTop />
      <WhisperPanel
        isConnected={whisper.isConnected}
        isConnecting={whisper.isConnecting}
        isMuted={whisper.isMuted}
        duration={whisper.duration}
        agentName={whisper.agentName}
        error={whisper.error}
        onMuteToggle={whisper.toggleMute}
        onDisconnect={whisper.disconnectWhisper}
        onCloseError={whisper.clearError}
      />
    </div>
  );
}

const SupervisionViewWithAuth = WithAuth(SupervisionView);
export default SupervisionViewWithAuth;
