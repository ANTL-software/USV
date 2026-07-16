import './updateCourrier.scss';

import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useUpdateCourrierView } from '../../../hooks/index.ts';
import { CourrierUpdateContent, Header, SubNav } from '../../components/index.ts';

function UpdateCourrier(): ReactElement {
  const viewModel = useUpdateCourrierView();

  return (
    <>
      <Header />
      <SubNav />
      <main id="updateCourrier" className="updateCourrierMain">
        <div className="updateCourrierContainer">
          <CourrierUpdateContent viewModel={viewModel} />
        </div>
      </main>
    </>
  );
}

const AuthenticatedUpdateCourrier = WithAuth(UpdateCourrier);

export default function UpdateCourrierRoute(): ReactElement {
  return <AuthenticatedUpdateCourrier />;
}
