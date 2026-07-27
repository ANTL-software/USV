import type { ReactElement } from 'react';
import { MdOutlineAccountTree } from 'react-icons/md';
import type { SocialPublicationStatus } from '../../../utils/types/index.ts';

const workflowSteps = [
  { number: '01', title: 'Préparation', detail: 'Texte et visuel' },
  { number: '02', title: 'Validation Mehdi', detail: 'Contrôle éditorial et technique' },
  { number: '03', title: 'Programmation', detail: 'Après validation Mehdi' },
  { number: '04', title: 'Publication', detail: 'Selon l’horaire choisi' },
];

export function SocialWorkflow({ status }: { status: SocialPublicationStatus | null }): ReactElement {
  return (
    <section className="socialPublicationView__panel">
      <div className="socialPublicationView__panel-header socialPublicationView__panel-header--actions">
        <div className="socialPublicationView__heading-copy">
          <MdOutlineAccountTree />
          <div>
            <span className="socialPublicationView__section-kicker">Workflow</span>
            <h2>Circuit de validation</h2>
            <p>Une diffusion ne peut partir qu’après validation humaine, contrôle des accès et programmation.</p>
          </div>
        </div>
        <span className={`socialPublicationView__policy${status?.policy.automaticPublishing ? ' socialPublicationView__policy--active' : ''}`}>
          Publication automatique {status?.policy.automaticPublishing ? 'activée' : 'désactivée'}
        </span>
      </div>
      <div className="socialPublicationView__workflow">
        {workflowSteps.map((step) => (
          <article className="socialPublicationView__workflow-step" key={step.number}>
            <span>{step.number}</span>
            <strong>{step.title}</strong>
            <small>{step.detail}</small>
          </article>
        ))}
      </div>
      <div className="socialPublicationView__workflow-stages">
        {(status?.workflow.stages ?? []).map((stage) => (
          <span key={stage.key}>
            <span className={`socialPublicationView__status-dot${stage.connected ? ' socialPublicationView__status-dot--ready' : ''}`} />
            {stage.label}
          </span>
        ))}
      </div>
    </section>
  );
}
