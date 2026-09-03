import './partenaireDocumentsContent.scss';
import type { ReactElement } from 'react';
import { IoChevronBack, IoChevronForward, IoCloudDownloadOutline, IoDocumentTextOutline, IoRefresh } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { PartenaireDocumentsViewModel } from '../../../hooks/index.ts';
import { formatCommandesDate, formatFileSize, formatMontant } from '../../../utils/scripts/index.ts';
import type { PartenaireDocumentCampaign, PartenaireDocumentsPeriod } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

const PERIOD_OPTIONS: Array<{ label: string; value: PartenaireDocumentsPeriod }> = [
  { label: 'Mois en cours', value: 'current_month' },
  { label: 'Mois précédent', value: 'previous_month' },
  { label: 'Période personnalisée', value: 'custom' },
];

const getDossierStatusLabel = (type: 'lead' | 'vente', status: string): string => {
  if (type === 'vente') return 'Commande validée';
  if (status === 'effectue') return 'Rendez-vous effectué';
  if (status === 'reporte') return 'Rendez-vous reporté';
  return 'Rendez-vous validé';
};

const getHeroTitle = (campaign: PartenaireDocumentCampaign | undefined): string => {
  if (!campaign) return 'Dossiers validés';
  return campaign.type_campagne === 'lead_b2b' ? 'Rendez-vous validés' : 'Commandes validées';
};

interface PartenaireDocumentsContentProps {
  viewModel: PartenaireDocumentsViewModel;
}

export default function PartenaireDocumentsContent({ viewModel }: PartenaireDocumentsContentProps): ReactElement {
  const {
    data,
    dateDebut,
    dateFin,
    downloadDocument,
    error,
    loading,
    navigateBack,
    nextPage,
    period,
    paginationPages,
    previousPage,
    refresh,
    selectPeriod,
    setDateDebut,
    setDateFin,
    setPage,
  } = viewModel;
  const heroTitle = getHeroTitle(data?.campagne);

  return <main className="partnerDocuments">
    <div className="partnerDocuments__back"><Button style="back" onClick={navigateBack}><MdArrowBack /> Retour</Button></div>
    <section className="partnerDocuments__hero">
      <div><p>Documents commerciaux</p><h1>{heroTitle}</h1><span>Retrouvez les pièces déposées pour les dossiers finalisés de votre campagne.</span></div>
      <Button style="white" onClick={refresh} disabled={loading}><IoRefresh /> Actualiser</Button>
    </section>

    <section className="partnerDocuments__filters" aria-label="Filtres des documents">
      <label>Période<select value={period} onChange={(event) => selectPeriod(event.target.value as PartenaireDocumentsPeriod)}>{PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      {period === 'custom' && <><label>Du<input type="date" value={dateDebut} max={dateFin} onChange={(event) => setDateDebut(event.target.value)} /></label><label>Au<input type="date" value={dateFin} min={dateDebut} onChange={(event) => setDateFin(event.target.value)} /></label></>}
      {data?.campagne && <div className="partnerDocuments__counter"><strong>{data.campagne.nom_campagne}</strong><span>Campagne partenaire</span></div>}
    </section>

    {error && <div className="partnerDocuments__error"><span>{error}</span><Button style="gradient" onClick={refresh}>Réessayer</Button></div>}
    {loading && !data && <div className="partnerDocuments__empty">Chargement des dossiers validés…</div>}
    {!loading && data?.dossiers.length === 0 && <div className="partnerDocuments__empty">Aucun dossier validé sur cette période.</div>}

    {data && data.dossiers.length > 0 && <section className="partnerDocuments__list" aria-busy={loading}>
      {data.dossiers.map((dossier) => <article key={`${dossier.type_dossier}-${dossier.id_dossier}`} className="partnerDocuments__card">
        <div className="partnerDocuments__identity">
          <span className={`partnerDocuments__badge partnerDocuments__badge--${dossier.type_dossier}`}>{getDossierStatusLabel(dossier.type_dossier, dossier.statut_dossier)}</span>
          <h2>{dossier.raison_sociale}</h2>
          <p>{dossier.nom_campagne}{dossier.ville ? ` · ${dossier.ville}` : ''}</p>
        </div>
        <dl className="partnerDocuments__details">
          <div><dt>Référence</dt><dd>{dossier.reference}</dd></div>
          <div><dt>Date de validation</dt><dd>{formatCommandesDate(dossier.date_validation)}</dd></div>
          {dossier.type_dossier === 'vente' && dossier.montant_total && <div><dt>Montant</dt><dd>{formatMontant(dossier.montant_total)}</dd></div>}
          {dossier.type_dossier === 'lead' && dossier.date_rendez_vous && <div><dt>Date du rendez-vous</dt><dd>{formatCommandesDate(dossier.date_rendez_vous)}{dossier.heure_rendez_vous ? ` à ${dossier.heure_rendez_vous.slice(0, 5)}` : ''}</dd></div>}
        </dl>
        <div className="partnerDocuments__files">
          {dossier.documents.length === 0
            ? <span className="partnerDocuments__pending"><IoDocumentTextOutline /> Document en attente de dépôt</span>
            : dossier.documents.map((document) => <button type="button" key={document.id_document_commercial} onClick={() => downloadDocument(document.id_document_commercial)}><IoCloudDownloadOutline /><span><strong>{document.nom_fichier}</strong><small>{formatFileSize(document.taille_octets)}</small></span></button>)}
        </div>
      </article>)}
    </section>}

    {data && data.pagination.total_pages > 1 && <nav className="partnerDocuments__pagination" aria-label="Pagination des documents">
      <span className="partnerDocuments__pagination-info">Page {data.pagination.page} / {data.pagination.total_pages} ({data.pagination.total} dossiers)</span>
      <div className="partnerDocuments__pagination-buttons">
        <button type="button" className="partnerDocuments__pagination-btn" onClick={previousPage} disabled={data.pagination.page <= 1} title="Page précédente"><IoChevronBack /></button>
        <span className="partnerDocuments__pagination-pages">
          {paginationPages.map((paginationPage) => <button key={paginationPage} type="button" className={data.pagination.page === paginationPage ? 'active' : ''} onClick={() => setPage(paginationPage)}>{paginationPage}</button>)}
        </span>
        <button type="button" className="partnerDocuments__pagination-btn" onClick={nextPage} disabled={data.pagination.page >= data.pagination.total_pages} title="Page suivante"><IoChevronForward /></button>
      </div>
    </nav>}
  </main>;
}
