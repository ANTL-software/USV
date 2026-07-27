import type { ReactElement } from 'react';
import type { SocialPublicationState } from '../../../hooks/index.ts';
import { SocialDraftComposer } from './SocialDraftComposer.tsx';
import { SocialDrafts } from './SocialDrafts.tsx';
import { SocialPackages } from './SocialPackages.tsx';
import { SocialStatusOverview } from './SocialStatusOverview.tsx';
import { SocialWorkflow } from './SocialWorkflow.tsx';

export function SocialPublicationWorkspace({ state }: { state: SocialPublicationState }): ReactElement {
  return (
    <div className="socialPublicationView__content">
      <SocialStatusOverview state={state} />
      <SocialDraftComposer state={state} />
      <SocialWorkflow status={state.status} />
      <SocialPackages status={state.status} />
      <SocialDrafts state={state} />
    </div>
  );
}
