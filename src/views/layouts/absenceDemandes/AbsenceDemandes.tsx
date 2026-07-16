import './absenceDemandes.scss';

import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useAbsenceManagementView } from '../../../hooks/index.ts';
import {
  AbsenceManagementFilters,
  AbsenceManagementHeader,
  AbsenceManagementTable,
  AbsenceRequestModal,
  BackToTop,
  Header,
  SubNav,
} from '../../components/index.ts';

function AbsenceDemandes(): ReactElement {
  const viewModel = useAbsenceManagementView();

  return (
    <div id="absenceDemandes">
      <Header />
      <SubNav />
      <main>
        <div className="absenceDemandes__container">
          <AbsenceManagementHeader {...viewModel} />
          <AbsenceManagementFilters {...viewModel} />
          <AbsenceManagementTable {...viewModel} />
        </div>
      </main>
      <BackToTop />
      <AbsenceRequestModal viewModel={viewModel} />
    </div>
  );
}

const AuthenticatedAbsenceDemandes = WithAuth(AbsenceDemandes);

export default function AbsenceDemandesRoute(): ReactElement {
  return <AuthenticatedAbsenceDemandes />;
}
