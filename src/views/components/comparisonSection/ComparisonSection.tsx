import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useComparisonSection } from '../../../hooks/index.ts';
import type { ComparisonSection as SectionContract, MonthlyComparison } from '../../../utils/types/index.ts';

interface Props { section: SectionContract; report: MonthlyComparison; }

export function ComparisonSection({ section, report }: Props) {
  const vm = useComparisonSection(section, report);
  return <section className="comparison__panel" id={`comparison-${section.id}`} aria-labelledby={`title-${section.id}`}>
    <div className="comparison__panel-heading"><div><span className="comparison__eyebrow">{vm.snapshot ? 'Instantané · aujourd’hui' : 'Comparaison mensuelle'}</span><h2 id={`title-${section.id}`}>{section.title}</h2></div>
      <button className="comparison__secondary" onClick={vm.exportSection} disabled={Boolean(section.error)}>Exporter cette rubrique</button></div>
    <p className="comparison__description">{section.description}</p>
    {section.error ? <p className="comparison__error" role="alert">{section.error}</p> : !section.rows.length ? <div className="comparison__empty">Aucune donnée enregistrée pour cette rubrique sur les périodes sélectionnées.</div> : <>
      {vm.total.length > 0 ? <div className="comparison__metric-list">{vm.total.map((item) => <div className="comparison__metric" key={item.key} title={item.description}><span>{item.label}</span><strong>{item.current}</strong><small>{vm.snapshot ? 'État actuel' : `${item.reference} en référence · ${item.delta}`}</small></div>)}</div> : <>
        <div className="comparison__tools">
          <label>Indicateur<select value={vm.metricKey} onChange={(event) => vm.setMetric(event.target.value)}>{section.metrics.map((metric) => <option key={metric.key} value={metric.key}>{metric.label}</option>)}</select></label>
          <label>Rechercher un groupe<input type="search" placeholder="Commercial, secteur, statut…" value={vm.search} onChange={(event) => vm.setSearch(event.target.value)} /></label>
          <label>Trier par<select value={vm.sort} onChange={(event) => vm.setSort(event.target.value)}><option value="label">Libellé / ordre naturel</option><option value="current">Mois analysé décroissant</option><option value="reference">Référence décroissante</option></select></label>
        </div>
        {vm.metric.description && <p className="comparison__definition">{vm.metric.description}</p>}
        <div className="comparison__chart" role="img" aria-label={vm.chartLabel}>
          <ResponsiveContainer width="100%" height="100%">
            {vm.chronological ? <LineChart data={vm.chart} margin={{ top: 12, right: 16, left: 8, bottom: 12 }} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e5f0" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tickFormatter={vm.formatAxis} width={75} tick={{ fontSize: 11 }} />
              <Tooltip formatter={vm.formatTooltip} /><Legend />
              <Line type="linear" dataKey="current" name={report.periods.current.month} stroke="#7c3aed" strokeWidth={3} dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />
              {!vm.snapshot && <Line type="linear" dataKey="reference" name={report.periods.reference.month} stroke="#0891b2" strokeWidth={2} strokeDasharray="5 4" connectNulls={false} isAnimationActive={false} />}
            </LineChart> : <BarChart data={vm.chart} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8e5f0" /><XAxis type="number" tickFormatter={vm.formatAxis} tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" width={145} tick={{ fontSize: 10 }} />
              <Tooltip formatter={vm.formatTooltip} /><Legend /><Bar dataKey="current" name={vm.snapshot ? 'Aujourd’hui' : report.periods.current.month} fill="#7c3aed" radius={[0, 3, 3, 0]} isAnimationActive={false} />
              {!vm.snapshot && <Bar dataKey="reference" name={report.periods.reference.month} fill="#0891b2" radius={[0, 3, 3, 0]} isAnimationActive={false} />}
            </BarChart>}
          </ResponsiveContainer>
        </div>
        <p className="comparison__caption">{vm.chartLabel}. Valeurs exactes ci-dessous ; « — » = absent ou non calculable.</p>
        <div className="comparison__table-tools"><span>{vm.rowCount} groupes · toutes les données dans l’export</span><button className="comparison__secondary" onClick={vm.toggleDetails}>{vm.details ? 'Un indicateur à la fois' : 'Afficher tous les indicateurs'}</button></div>
        <div className="comparison__table-scroll"><table><caption>{section.title} — {vm.details ? 'détail complet' : vm.metric.label}</caption><thead><tr><th scope="col">Groupe</th>{vm.details && <th scope="col">Indicateur</th>}<th scope="col">{vm.snapshot ? 'Aujourd’hui' : report.periods.current.month}</th>{!vm.snapshot && <><th scope="col">{report.periods.reference.month}</th><th scope="col">Écart absolu</th><th scope="col">Variation</th></>}</tr></thead>
          <tbody>{vm.details ? vm.detailedRows.map((row) => <tr key={row.key}><th scope="row">{row.label}</th><td>{row.metric}</td><td>{row.current}</td>{!vm.snapshot && <><td>{row.reference}</td><td>{row.absolute}</td><td>{row.delta}</td></>}</tr>) : vm.rows.map((row) => <tr key={row.key}><th scope="row">{row.label}</th><td>{row.current}</td>{!vm.snapshot && <><td>{row.reference}</td><td>{row.absolute}</td><td>{row.delta}</td></>}</tr>)}</tbody>
        </table></div>
        {!vm.rows.length && <p className="comparison__empty">Aucun groupe ne correspond à votre recherche.</p>}
        <div className="comparison__pagination"><button className="comparison__secondary" disabled={vm.page <= 1} onClick={vm.previous}>Précédent</button><span>Page {vm.page} / {vm.pages}</span><button className="comparison__secondary" disabled={vm.page >= vm.pages} onClick={vm.next}>Suivant</button></div>
      </>}
    </>}
  </section>;
}
