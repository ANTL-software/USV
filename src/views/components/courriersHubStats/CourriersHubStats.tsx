import type { ReactElement } from 'react';
import { FiCalendar, FiFileText } from 'react-icons/fi';
import { IoMail, IoMailOpen } from 'react-icons/io5';
import type { CourriersHubViewModel } from '../../../hooks/index.ts';

interface CourriersHubStatsProps { viewModel: CourriersHubViewModel }

export function CourriersHubStats({ viewModel }: CourriersHubStatsProps): ReactElement {
  const stats = [
    { id: 'total', label: 'Total courriers', value: viewModel.values.total, icon: <FiFileText />, color: 'primary' },
    { id: 'incoming', label: 'Entrants', value: viewModel.values.incoming, icon: <IoMail />, color: 'info' },
    { id: 'outgoing', label: 'Sortants', value: viewModel.values.outgoing, icon: <IoMailOpen />, color: 'success' },
    { id: 'monthly', label: 'Ce mois', value: viewModel.values.monthly, icon: <FiCalendar />, color: 'warning' },
  ];
  return (
    <section className="courriersStats" data-aos="fade-up" data-aos-delay="200"><h2 className="statsTitle">Statistiques</h2><div className="statsGrid">{stats.map((stat, index) => (
      <div key={stat.id} className={`statCard ${stat.color}`} data-aos="zoom-in" data-aos-delay={250 + index * 100}><div className="statIcon">{stat.icon}</div><div className="statContent"><div className="statValue">{stat.value}</div><div className="statLabel">{stat.label}</div></div></div>
    ))}</div></section>
  );
}
