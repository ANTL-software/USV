import './partenairePortalCards.scss';
import type { ReactElement } from 'react';
import { IoChevronForward, IoDocumentTextOutline, IoStatsChartOutline } from 'react-icons/io5';
import type { PartenairePortalViewModel } from '../../../hooks/index.ts';

export default function PartenairePortalCards({ modules, openModule }: PartenairePortalViewModel): ReactElement {
  if (modules.length === 1) {
    return <main className="partnerPortal"><div className="partnerPortal__message">Ouverture de votre espace…</div></main>;
  }

  return <main className="partnerPortal">
    <section className="partnerPortal__hero">
      <p>Espace partenaire</p>
      <h1>Que souhaitez-vous consulter&nbsp;?</h1>
      <span>Vos accès sont limités aux campagnes et aux modules autorisés pour votre compte.</span>
    </section>
    {modules.length === 0
      ? <div className="partnerPortal__message">Aucun module n’est encore autorisé pour votre compte. Contactez votre interlocuteur ANTL.</div>
      : <section className="partnerPortal__grid" aria-label="Modules partenaire">
        {modules.map((module) => <button type="button" key={module.id} className="partnerPortal__card" onClick={() => openModule(module.path)}>
          <span className="partnerPortal__icon">{module.id === 'documents' ? <IoDocumentTextOutline /> : <IoStatsChartOutline />}</span>
          <span className="partnerPortal__content"><strong>{module.label}</strong><small>{module.description}</small></span>
          <IoChevronForward className="partnerPortal__arrow" />
        </button>)}
      </section>}
  </main>;
}
