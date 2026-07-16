import type { ReactElement } from 'react';
import type { Projet } from '../../../utils/types/index.ts';
import { formatProjectDate } from '../../../utils/scripts/index.ts';

interface ProjetInformationCardProps { projet: Projet }

export function ProjetInformationCard({ projet }: ProjetInformationCardProps): ReactElement {
  const startDate = formatProjectDate(projet.date_debut);
  const endDate = formatProjectDate(projet.date_fin);
  return (
    <div className="projetDetails__card">
      <div className="projetDetails__card-header"><h2>Informations</h2></div>
      <div className="projetDetails__card-body">
        <div className="projetDetails__info"><span className="projetDetails__info-label">Type</span><span className="projetDetails__info-value">{projet.type_projet}</span></div>
        <div className="projetDetails__info"><span className="projetDetails__info-label">Priorité</span><span className={`projetDetails__badge projetDetails__badge--${projet.priorite}`}>{projet.priorite}</span></div>
        <div className="projetDetails__info"><span className="projetDetails__info-label">Pilote</span><span className="projetDetails__info-value">{projet.pilote ? `${projet.pilote.prenom} ${projet.pilote.nom}` : 'Non assigné'}</span></div>
        {startDate && <div className="projetDetails__info"><span className="projetDetails__info-label">Date de début</span><span className="projetDetails__info-value">{startDate}</span></div>}
        {endDate && <div className="projetDetails__info"><span className="projetDetails__info-label">Date de fin</span><span className="projetDetails__info-value">{endDate}</span></div>}
        {projet.description && <div className="projetDetails__description"><span className="projetDetails__info-label">Description</span><p>{projet.description}</p></div>}
      </div>
    </div>
  );
}
