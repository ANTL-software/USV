import './qualiteComparatif.scss';
import { IoArrowBack, IoDownloadOutline, IoGitCompareOutline, IoSwapHorizontal } from 'react-icons/io5';
import { useMonthlyComparison } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Button, ComparisonSection, Header, SubNav } from '../../components/index.ts';

function QualiteComparatif() {
  const vm = useMonthlyComparison();
  return <div id="qualiteComparatif"><Header /><SubNav /><main className="comparison__wrapper">
    <div><Button style="back" onClick={vm.navigateBack}><IoArrowBack /><span>Retour à la qualité</span></Button></div>
    <header className="comparison__hero"><div><span className="comparison__eyebrow"><IoGitCompareOutline /> Observatoire commercial</span><h1>Comprendre ce qui change.</h1><p>Du premier appel au résultat commercial : comparez vos mois, identifiez les écarts et explorez les données qui les expliquent.</p></div><div className="comparison__hero-aside"><strong>Comparatif mensuel</strong><span>Campagne par campagne<br />Données réelles · heure de Paris</span></div></header>
    <form className="comparison__filters" onSubmit={(event) => { event.preventDefault(); vm.apply(); }} aria-label="Filtres du comparatif">
      <label>Campagne<select aria-label="Campagne" id="comparison-campaign" value={vm.draft.campaign} onChange={(event) => vm.changeCampaign(event.target.value)} disabled={!vm.options}><option value="0" disabled>Choisir une campagne</option>{vm.options?.campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></label>
      <label>Commercial<select aria-label="Commercial" value={vm.draft.agent ?? ''} onChange={(event) => vm.changeAgent(event.target.value)}><option value="">Tous les commerciaux</option>{vm.agents.map((agent) => <option value={agent.id} key={agent.id}>{agent.name}</option>)}</select></label>
      <label>Mois analysé<input aria-label="Mois analysé" type="date" value={vm.monthDate} max={vm.maxDate} min="2000-01-01" required onChange={(event) => vm.changeMonth(event.target.value)} /></label>
      <button type="button" className="comparison__swap" title="Inverser les mois" aria-label="Inverser les mois" onClick={vm.swap}><IoSwapHorizontal /></button>
      <label>Mois de référence<input aria-label="Mois de référence" type="date" value={vm.referenceDate} max={vm.maxDate} min="2000-01-01" required onChange={(event) => vm.changeReference(event.target.value)} /></label>
      <label>Base de comparaison<select aria-label="Base de comparaison" value={vm.draft.mode} onChange={(event) => vm.changeMode(event.target.value)}><option value="aligned">Même nombre de jours terminés</option><option value="full">Mois entiers / en cours à date</option></select></label>
      <button className="comparison__primary" type="submit" disabled={vm.loading || !vm.options?.campaigns.length}>{vm.loading ? 'Chargement…' : 'Comparer les mois'}</button>
      <p className="comparison__filter-help"><strong>Choisissez une date dans chacun des deux mois à comparer.</strong> Le jour choisi sert de repère pour le mois. À durée égale, seuls les jours calendaires terminés communs sont comparés. <em>Les différences de jours ouvrés et de saisonnalité restent à prendre en compte.</em></p>
      {vm.filterError && <p className="comparison__error" role="alert">{vm.filterError}</p>}
    </form>
    {vm.loading && <div className="comparison__loading" role="status"><span className="comparison__loading-dot" /> Construction du rapport : appels, production et portefeuille…</div>}
    {vm.error && <div className="comparison__error" role="alert"><p>{vm.error}</p><button className="comparison__secondary" onClick={vm.retry}>Réessayer</button></div>}
    {!vm.loading && !vm.error && vm.options?.campaigns.length === 0 && <p className="comparison__empty">Aucune campagne disponible.</p>}
    {vm.data && <>
      <div className="comparison__report-heading"><div><h2>{vm.data.campaign.name}</h2><p><span className="comparison__legend-dot comparison__legend-dot--current" />{vm.currentLabel}<br /><span className="comparison__legend-dot comparison__legend-dot--reference" />{vm.referenceLabel}</p><small>Calculé le {vm.generatedLabel} · {vm.data.sections.length} rubriques · {vm.metricCount} indicateurs croisés</small></div><button className="comparison__primary" onClick={vm.exportAll}><IoDownloadOutline /> Exporter le rapport complet</button></div>
      {vm.emptyDays && <p className="comparison__notice">Aucun jour terminé comparable pour l’instant. Choisissez « Mois entiers / en cours à date » pour inclure la journée en cours.</p>}
      <div className="comparison__kpis">{vm.cards.map((card) => <article className="comparison__kpi" key={card.key} title={card.description}><span>{card.label}</span><strong>{card.value}</strong><div><b className={card.deltaClass}>{card.delta}</b><small>Réf. {card.previous}</small></div></article>)}</div>
      <p className="comparison__definition-call"><strong>Contact humain = ProgPA ≥ 1 saisi par le commercial.</strong> Le taux compare ces appels à <strong>tous les appels terminés</strong> de la période, répondeurs et autres issues compris. <em>Il ne dépend ni du décrochage technique ni de la détection automatique.</em></p>
      <aside className="comparison__signals"><h2>Points d’attention</h2><div className="comparison__signals-list">{vm.signals.map((signal) => <div className={`comparison__attention comparison__attention--${signal.tone}`} key={signal.title}><strong>{signal.title}</strong><p>{signal.message}</p></div>)}</div></aside>
      <div className="comparison__explorer"><nav aria-label="Axes d’analyse">{vm.groups.map((group) => <button key={group.id} className={vm.group === group.id && !vm.sectionSearch ? 'comparison__tab comparison__tab--active' : 'comparison__tab'} aria-pressed={vm.group === group.id && !vm.sectionSearch} onClick={() => { vm.setGroup(group.id); vm.setSectionSearch(''); }}>{group.label}</button>)}</nav><label className="comparison__section-search">Rechercher une rubrique<input type="search" value={vm.sectionSearch} placeholder="Ex. enregistrements, produits…" onChange={(event) => vm.setSectionSearch(event.target.value)} /></label></div>
      <div className="comparison__sections">{vm.visibleSections.map((section) => <ComparisonSection key={`${vm.data?.campaign.id}-${vm.data?.generatedAt}-${section.id}`} section={section} report={vm.data!} />)}</div>
      {!vm.visibleSections.length && <p className="comparison__empty">Aucune rubrique ne correspond à votre recherche.</p>}
      <details className="comparison__methodology"><summary>Méthode, couverture et limites des données</summary><ul>{vm.data.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul><p>Les exports contiennent toutes les rubriques et toutes leurs lignes (jours, commerciaux, activités, sources de fichiers…), indépendamment de l’onglet affiché ou des recherches locales. Ils reprennent les filtres appliqués, les périodes, les unités et les définitions.</p></details>
    </>}
  </main><BackToTop /></div>;
}
export default WithAuth(QualiteComparatif);
