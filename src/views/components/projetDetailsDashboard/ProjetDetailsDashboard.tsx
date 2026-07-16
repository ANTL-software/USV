import type { ReactElement } from 'react';
import { IoCheckmarkCircle, IoPeople, IoStatsChart, IoTime } from 'react-icons/io5';
import type { ProjetDashboard } from '../../../utils/types/index.ts';

interface ProjetDetailsDashboardProps {
  dashboard: ProjetDashboard;
  memberCount: number;
}

export function ProjetDetailsDashboard({ dashboard, memberCount }: ProjetDetailsDashboardProps): ReactElement {
  const progress = Math.min(100, Math.max(0, dashboard.stats.progression_calculee));

  return (
    <div className="projetDetails__dashboard">
      <div className="projetDetails__kpi">
        <div className="projetDetails__kpi-icon projetDetails__kpi-icon--progress"><IoStatsChart /></div>
        <div className="projetDetails__kpi-content">
          <p className="projetDetails__kpi-label">Progression</p>
          <p className="projetDetails__kpi-value">{progress}%</p>
          <progress className="projetDetails__kpi-progress" max={100} value={progress}>{progress}%</progress>
        </div>
      </div>
      <div className="projetDetails__kpi">
        <div className="projetDetails__kpi-icon projetDetails__kpi-icon--tasks"><IoCheckmarkCircle /></div>
        <div className="projetDetails__kpi-content"><p className="projetDetails__kpi-label">Tâches terminées</p><p className="projetDetails__kpi-value">{dashboard.stats.taches_par_statut.termine} / {dashboard.stats.taches_total}</p></div>
      </div>
      <div className="projetDetails__kpi">
        <div className="projetDetails__kpi-icon projetDetails__kpi-icon--time"><IoTime /></div>
        <div className="projetDetails__kpi-content"><p className="projetDetails__kpi-label">Temps estimé</p><p className="projetDetails__kpi-value">{dashboard.stats.temps_esthe_total}h</p></div>
      </div>
      <div className="projetDetails__kpi">
        <div className="projetDetails__kpi-icon projetDetails__kpi-icon--members"><IoPeople /></div>
        <div className="projetDetails__kpi-content"><p className="projetDetails__kpi-label">Membres</p><p className="projetDetails__kpi-value">{memberCount}</p></div>
      </div>
    </div>
  );
}
