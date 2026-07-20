import type { ReactElement } from 'react';
import { IoFlagOutline, IoRefreshOutline } from 'react-icons/io5';

import type { VigieViewState } from '../../../hooks/index.ts';
import { formatVigieDate, formatVigieNumber, formatVigiePercent, formatVigiePerThousand } from '../../../utils/scripts/index.ts';

interface VigieOverviewProps {
  state: VigieViewState;
}

export function VigieOverview({ state }: VigieOverviewProps): ReactElement | null {
  const { snapshot } = state;
  if (!snapshot) return null;
  const progress = Math.min(snapshot.objectif.taux_atteinte || 0, 100);
  return (
    <>
      <div className="vigieView__period">
        <div><strong>{snapshot.campagne.nom_campagne}</strong><span>Du {formatVigieDate(snapshot.periode.date_debut)} au {formatVigieDate(snapshot.periode.date_fin)} · actualisé à {new Date(snapshot.meta.donnees_actualisees_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>{snapshot.campagne.code_postal_maison_mere && <span>Point de référence proximité : {snapshot.campagne.ville || 'siège client'} ({snapshot.campagne.code_postal_maison_mere})</span>}</div>
        <button className="vigieView__button vigieView__button--secondary" type="button" onClick={() => { void state.refresh(); }} disabled={state.isLoading}><IoRefreshOutline /> Actualiser</button>
      </div>
      <section className="vigieView__objective" aria-label="Objectif d’appels du jour">
        <div className="vigieView__objective-copy"><span><IoFlagOutline /> Objectif du jour</span><strong>{formatVigieNumber(snapshot.objectif.appels_aujourdhui)} / {formatVigieNumber(snapshot.objectif.objectif_jour)} appels</strong><small>{snapshot.objectif.agents_ayant_appele} commercial(aux) actif(s) aujourd’hui · {snapshot.objectif.appels_par_agent} appels par commercial</small></div>
        <div className="vigieView__progress" aria-label={`Objectif atteint à ${snapshot.objectif.taux_atteinte || 0}%`}><span style={{ width: `${progress}%` }} /></div><b>{formatVigiePercent(snapshot.objectif.taux_atteinte)}</b>
      </section>
      <section className="vigieView__kpis" aria-label="Indicateurs clés">
        <article><span>Appels analysés</span><strong>{formatVigieNumber(snapshot.summary.appels)}</strong><small>{formatVigieNumber(snapshot.summary.prospects_appeles)} prospects distincts</small></article>
        <article><span>Décrochés estimés</span><strong>{formatVigiePercent(snapshot.summary.taux_decroche)}</strong><small>{formatVigieNumber(snapshot.summary.decroches)} appels décrochés</small></article>
        <article><span>Contacts humains</span><strong>{formatVigiePercent(snapshot.summary.taux_contact_humain)}</strong><small>{formatVigieNumber(snapshot.summary.contacts_humains)} conversations</small></article>
        <article className="vigieView__kpi--result"><span>{snapshot.resultat_metier.libelle_pluriel}</span><strong>{formatVigieNumber(snapshot.resultat_metier.total)}</strong><small>{formatVigiePerThousand(snapshot.resultat_metier.pour_1000_appels)} pour 1 000 appels</small></article>
        <article><span>Fiches distribuables</span><strong>{formatVigieNumber(snapshot.summary.fiches_pretes)}</strong><small>{snapshot.summary.jours_couverture_file === null ? 'couverture non calculable' : `≈ ${snapshot.summary.jours_couverture_file} jours de couverture`}</small></article>
        <article><span>Rappels réservés</span><strong>{formatVigieNumber(snapshot.summary.rappels_reserves)}</strong><small>restent prioritaires à l’échéance</small></article>
      </section>
    </>
  );
}
