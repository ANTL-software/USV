import type { ReactElement, ReactNode } from 'react';
import { IoCallOutline, IoCheckmarkCircleOutline, IoPeopleOutline, IoRefresh, IoTimeOutline } from 'react-icons/io5';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PartenaireStatisticsPeriod, PartenaireStatisticsPoint } from '../../../utils/types/index.ts';
import type { PartenaireStatisticsViewModel } from '../../../hooks/index.ts';
import {
  formatPartnerHourRange,
  formatPartnerStatisticDate,
  formatPartnerStatisticNumber,
  formatPartnerStatisticPercent,
  getPartnerWeekdayLabel,
  PARTNER_STATISTICS_PERIODS,
} from '../../../utils/scripts/index.ts';
import { Button } from '../button/index.ts';

const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe'];

interface DashboardProps { viewModel: PartenaireStatisticsViewModel; }
interface PanelProps { children: ReactNode; description?: string; title: string; }
interface MetricProps { detail?: string; icon?: ReactNode; label: string; tone?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal'; value: string; }

function Panel({ children, description, title }: PanelProps): ReactElement {
  return <section className="partnerStats__panel"><header><div><h2>{title}</h2>{description && <p>{description}</p>}</div></header>{children}</section>;
}

function Metric({ detail, icon, label, tone = 'teal', value }: MetricProps): ReactElement {
  return <article className={`partnerStats__metric partnerStats__metric--${tone}`}><div className="partnerStats__metricIcon">{icon}</div><div><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div></article>;
}

function EmptyChart({ message = 'Les données apparaîtront dès que des appels auront été enregistrés.' }: { message?: string }): ReactElement {
  return <div className="partnerStats__empty">{message}</div>;
}

function OutcomesPie({ data }: { data: PartenaireStatisticsPoint[] }): ReactElement {
  if (data.length === 0) return <EmptyChart />;
  return <div className="partnerStats__chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="valeur" nameKey="label" innerRadius={55} outerRadius={88} paddingAngle={2}>{data.map((point, index) => <Cell key={`${point.label}-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" height={42} /></PieChart></ResponsiveContainer></div>;
}

function PartenaireStatisticsDashboard({ viewModel }: DashboardProps): ReactElement {
  const { data, error, loading, period, refresh, selectCampaign, selectPeriod, selectedCampaignId } = viewModel;

  if (loading && !data) return <main className="partnerStats"><div className="partnerStats__loading">Chargement des indicateurs de joignabilité…</div></main>;
  if (error && !data) return <main className="partnerStats"><div className="partnerStats__error"><p>{error}</p><Button style="gradient" onClick={refresh}><IoRefresh /> Réessayer</Button></div></main>;
  if (!data) return <main className="partnerStats"><EmptyChart message="Aucune statistique disponible." /></main>;

  const hourly = data.joignabilite.par_horaire.map((point) => ({ ...point, label: `${point.heure} h` }));
  const weekdays = data.joignabilite.par_jour.map((point) => ({ ...point, label: getPartnerWeekdayLabel(point.jour) }));
  const daily = data.joignabilite.quotidienne.map((point) => ({
    ...point,
    label: new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(new Date(`${point.date}T12:00:00`)),
  }));

  return <main className="partnerStats">
    <section className="partnerStats__hero">
      <div><p className="partnerStats__eyebrow">Analyse de joignabilité</p><h1>{data.campagne.nom_campagne}</h1><p>Repérez les créneaux où les prospects décrochent le plus et la part des répondeurs pour ajuster les horaires d’appel.</p></div>
      <div className="partnerStats__updated"><span>Dernière actualisation</span><strong>{formatPartnerStatisticDate(data.generated_at)}</strong><Button style="white" onClick={refresh} disabled={loading}><IoRefresh /> Actualiser</Button></div>
    </section>

    <section className="partnerStats__filters" aria-label="Filtres statistiques">
      <label>Campagne<select value={selectedCampaignId || ''} onChange={(event) => selectCampaign(Number(event.target.value))}>{data.campagnes.map((campaign) => <option key={campaign.id_campagne} value={campaign.id_campagne}>{campaign.nom_campagne}</option>)}</select></label>
      <label>Période d’analyse<select value={period} onChange={(event) => selectPeriod(event.target.value as PartenaireStatisticsPeriod)}>{PARTNER_STATISTICS_PERIODS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      <p>Les résultats sont agrégés : aucune donnée individuelle de collaborateur n’est affichée.</p>
    </section>

    {error && <p className="partnerStats__warning">Les dernières données sont affichées, mais l’actualisation a échoué : {error}</p>}

    <section className="partnerStats__metrics">
      <Metric label="Prospects de la campagne" value={formatPartnerStatisticNumber(data.synthese.total_prospects, 0)} icon={<IoPeopleOutline />} />
      <Metric label="Prospects appelés" value={formatPartnerStatisticNumber(data.synthese.prospects_appeles, 0)} detail={`${formatPartnerStatisticPercent(data.synthese.taux_couverture)} de la base`} icon={<IoCallOutline />} tone="blue" />
      <Metric label="Prospects joints" value={formatPartnerStatisticNumber(data.synthese.prospects_joints, 0)} detail={`${formatPartnerStatisticPercent(data.synthese.taux_decroche)} de décroché`} icon={<IoCheckmarkCircleOutline />} tone="green" />
      <Metric label="Répondeurs" value={formatPartnerStatisticNumber(data.synthese.repondeurs, 0)} detail={`${formatPartnerStatisticPercent(data.synthese.taux_repondeur)} des appels`} tone="purple" />
      <Metric label="Sans réponse" value={formatPartnerStatisticNumber(data.synthese.sans_reponse, 0)} detail={`${formatPartnerStatisticPercent(data.synthese.taux_sans_reponse)} des appels`} tone="orange" />
      <Metric label="Appels analysés" value={formatPartnerStatisticNumber(data.synthese.total_appels, 0)} detail="Sur la période sélectionnée" icon={<IoTimeOutline />} tone="teal" />
    </section>

    <section className="partnerStats__grid partnerStats__grid--wide">
      <Panel title="Meilleurs créneaux de décroché" description="Seuls les créneaux disposant d’un volume suffisant sont recommandés.">
        {data.joignabilite.meilleurs_creneaux.length === 0
          ? <EmptyChart message={`Au moins ${data.joignabilite.minimum_appels_recommandation} appels sur un même créneau sont nécessaires avant de proposer une recommandation.`} />
          : <ol className="partnerStats__slots">{data.joignabilite.meilleurs_creneaux.map((slot) => <li key={slot.heure} className="partnerStats__slot"><strong>{formatPartnerHourRange(slot.heure)}</strong><span>{formatPartnerStatisticPercent(slot.taux_decroche)} de décroché</span><small>{formatPartnerStatisticNumber(slot.appels, 0)} appels · {formatPartnerStatisticNumber(slot.repondeurs, 0)} répondeur{slot.repondeurs > 1 ? 's' : ''}</small></li>)}</ol>}
      </Panel>
      <Panel title="Issues des appels" description="Répartition sur la période sélectionnée."><OutcomesPie data={data.joignabilite.resultats} /></Panel>
    </section>

    <section className="partnerStats__grid partnerStats__grid--wide">
      <Panel title="Taux de décroché par horaire" description="Comparez le volume d’appels et le taux de décroché pour chaque heure.">
        {hourly.length === 0 ? <EmptyChart /> : <div className="partnerStats__chart partnerStats__chart--large"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={hourly} margin={{ top: 12, right: 12, left: -18, bottom: 6 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" /><YAxis yAxisId="volume" allowDecimals={false} /><YAxis yAxisId="taux" orientation="right" domain={[0, 100]} tickFormatter={(value: number) => `${value} %`} /><Tooltip /><Legend /><Bar yAxisId="volume" dataKey="appels" name="Appels" fill="#a78bfa" radius={[6, 6, 0, 0]} /><Line yAxisId="taux" type="monotone" dataKey="taux_decroche" name="Taux de décroché" stroke="#5b21b6" strokeWidth={3} dot={{ r: 3 }} /></ComposedChart></ResponsiveContainer></div>}
      </Panel>
      <Panel title="Répondeurs par horaire" description="Identifiez les horaires où les répondeurs sont les plus présents.">
        {hourly.length === 0 ? <EmptyChart /> : <div className="partnerStats__chart partnerStats__chart--large"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={hourly} margin={{ top: 12, right: 12, left: -18, bottom: 6 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" /><YAxis yAxisId="volume" allowDecimals={false} /><YAxis yAxisId="taux" orientation="right" domain={[0, 100]} tickFormatter={(value: number) => `${value} %`} /><Tooltip /><Legend /><Bar yAxisId="volume" dataKey="repondeurs" name="Répondeurs" fill="#7c3aed" radius={[6, 6, 0, 0]} /><Line yAxisId="taux" type="monotone" dataKey="taux_repondeur" name="Taux de répondeur" stroke="#c4b5fd" strokeWidth={3} dot={{ r: 3 }} /></ComposedChart></ResponsiveContainer></div>}
      </Panel>
    </section>

    <section className="partnerStats__grid partnerStats__grid--wide">
      <Panel title="Taux de décroché par jour" description="Lecture complémentaire pour orienter les jours d’appel.">
        {weekdays.length === 0 ? <EmptyChart /> : <div className="partnerStats__chart"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={weekdays} margin={{ top: 12, right: 12, left: -18, bottom: 6 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" /><YAxis yAxisId="volume" allowDecimals={false} /><YAxis yAxisId="taux" orientation="right" domain={[0, 100]} tickFormatter={(value: number) => `${value} %`} /><Tooltip /><Legend /><Bar yAxisId="volume" dataKey="appels" name="Appels" fill="#c4b5fd" radius={[6, 6, 0, 0]} /><Line yAxisId="taux" type="monotone" dataKey="taux_decroche" name="Taux de décroché" stroke="#5b21b6" strokeWidth={3} dot={{ r: 3 }} /></ComposedChart></ResponsiveContainer></div>}
      </Panel>
      <Panel title="Évolution de la joignabilité" description="Suivez l’évolution du taux de décroché dans le temps.">
        {daily.length === 0 ? <EmptyChart /> : <div className="partnerStats__chart"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={daily} margin={{ top: 12, right: 12, left: -18, bottom: 6 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="label" /><YAxis yAxisId="volume" allowDecimals={false} /><YAxis yAxisId="taux" orientation="right" domain={[0, 100]} tickFormatter={(value: number) => `${value} %`} /><Tooltip /><Legend /><Bar yAxisId="volume" dataKey="appels" name="Appels" fill="#ddd6fe" radius={[6, 6, 0, 0]} /><Line yAxisId="taux" type="monotone" dataKey="taux_decroche" name="Taux de décroché" stroke="#7c3aed" strokeWidth={3} dot={false} /></ComposedChart></ResponsiveContainer></div>}
      </Panel>
    </section>
  </main>;
}

export { PartenaireStatisticsDashboard };
export default PartenaireStatisticsDashboard;
