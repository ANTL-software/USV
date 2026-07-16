import type { ReactElement } from 'react';
import { IoPeopleOutline, IoShieldCheckmarkOutline, IoStatsChartOutline, IoTimeOutline } from 'react-icons/io5';

import type { VigieViewState } from '../../../hooks/index.ts';
import { formatVigieNumber, formatVigiePercent } from '../../../utils/scripts/index.ts';

interface VigieQualitySignalsProps {
  state: VigieViewState;
}

export function VigieQualitySignals({ state }: VigieQualitySignalsProps): ReactElement | null {
  const { snapshot } = state;
  if (!snapshot) return null;
  return (
    <>
      <div className="vigieView__grid vigieView__grid--quality">
        <section className="vigieView__panel">
          <div className="vigieView__panel-title"><IoShieldCheckmarkOutline /><div><h2>Qualité du fichier</h2><p>Les champs réellement utiles au ciblage et au discours.</p></div></div>
          <dl className="vigieView__quality-list">
            <div><dt>Fiches campagne</dt><dd>{formatVigieNumber(snapshot.qualite_fichier.fiches_file)}</dd></div><div><dt>Sans segment exploitable</dt><dd>{formatVigieNumber(snapshot.qualite_fichier.sans_segment_exploitable)}</dd></div><div><dt>Sans contact nommé</dt><dd>{formatVigieNumber(snapshot.qualite_fichier.sans_contact_nomme)}</dd></div><div><dt>Sans code NAF</dt><dd>{formatVigieNumber(snapshot.qualite_fichier.sans_code_naf)}</dd></div><div><dt>Sans code postal</dt><dd>{formatVigieNumber(snapshot.qualite_fichier.sans_code_postal)}</dd></div><div><dt>Sans maturité</dt><dd>{formatVigieNumber(snapshot.qualite_fichier.sans_maturite)}</dd></div><div><dt>Mobiles identifiés</dt><dd>{formatVigieNumber(snapshot.qualite_fichier.mobiles)}</dd></div><div><dt>Doublons / blacklist</dt><dd>{formatVigieNumber(snapshot.qualite_fichier.doublons + snapshot.qualite_fichier.blacklists)}</dd></div>
          </dl>
          <p className="vigieView__quality-note">Le secteur brut manquant ({formatVigieNumber(snapshot.qualite_fichier.sans_secteur_brut)}) est compensé lorsque l’activité ou le code NAF permet une segmentation exploitable.</p>
        </section>
        <section className="vigieView__panel">
          <div className="vigieView__panel-title"><IoPeopleOutline /><div><h2>Cadence par commercial</h2><p>L’objectif de 200 appels reste complété par la qualité des contacts.</p></div></div>
          <div className="vigieView__compact-list">{snapshot.agents.map((agent) => <article key={agent.id_agent}><div><strong>{agent.prenom} {agent.nom.toUpperCase()}</strong><span>{formatVigiePercent(agent.taux_contact_humain)} de contacts humains · {agent.resultats} résultat(s)</span></div><div><b>{formatVigieNumber(agent.appels_aujourdhui)}</b><small>/ {snapshot.objectif.appels_par_agent} aujourd’hui</small></div></article>)}</div>
        </section>
      </div>
      <div className="vigieView__grid vigieView__grid--signals">
        <section className="vigieView__panel"><div className="vigieView__panel-title"><IoTimeOutline /><div><h2>Créneaux de contact</h2><p>Taux de contact humain constaté par heure.</p></div></div><div className="vigieView__hour-grid">{state.topContactHours.map((hour) => <article key={hour.heure}><strong>{String(hour.heure).padStart(2, '0')}h–{String(hour.heure + 1).padStart(2, '0')}h</strong><span>{formatVigiePercent(hour.taux_contact_humain)}</span><small>{formatVigieNumber(hour.appels)} appels</small></article>)}</div></section>
        <section className="vigieView__panel"><div className="vigieView__panel-title"><IoStatsChartOutline /><div><h2>Statuts d’appel</h2><p>Répartition exhaustive sur la période sélectionnée.</p></div></div><div className="vigieView__status-list">{snapshot.statuts_appels.map((status) => <div key={status.statut}><span>{status.statut.replace(/_/g, ' ')}</span><strong>{formatVigieNumber(status.total)}</strong><small>{formatVigiePercent(status.taux ?? null)}</small></div>)}</div></section>
      </div>
    </>
  );
}
