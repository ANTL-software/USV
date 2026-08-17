import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';

function PartenaireStatistiques(): ReactElement {
  return <main className="externalPartners"><header><div><h1>Statistiques partenaire</h1><p>Votre espace de consultation est en préparation. Les données affichées seront strictement limitées aux campagnes qui vous sont autorisées.</p></div></header></main>;
}

export default WithAuth(PartenaireStatistiques);
