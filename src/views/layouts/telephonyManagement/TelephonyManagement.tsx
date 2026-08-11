import type { ReactElement } from 'react';
import { IoCallOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';

import './telephonyManagement.scss';

import { useTelephonyManagementView } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import {
  BackToTop,
  Button,
  Header,
  SubNav,
  TelephonyProviderSwitch,
  TelephonyTrunkConfiguration,
} from '../../components/index.ts';

function TelephonyManagement(): ReactElement {
  const viewModel = useTelephonyManagementView();

  return (
    <div id="telephonyManagement">
      <Header />
      <SubNav />
      <main>
        <div className="telephonyManagement__container">
          <div className="telephonyManagement__back">
            <Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button>
          </div>
          <div className="telephonyManagement__page-heading">
            <h1><IoCallOutline /> Gestion de la téléphonie</h1>
            <p>Préparez le trunk opérateur, contrôlez son état réel puis choisissez le moteur utilisé par les commerciaux.</p>
          </div>
          <TelephonyProviderSwitch viewModel={viewModel.provider} />
          <TelephonyTrunkConfiguration viewModel={viewModel.trunk} />
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const TelephonyManagementWithAuth = WithAuth(TelephonyManagement);
export default TelephonyManagementWithAuth;
