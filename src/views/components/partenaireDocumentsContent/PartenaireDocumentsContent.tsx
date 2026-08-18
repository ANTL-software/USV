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

const getHeroTitle = (campaigns: PartenaireDocumentCampaign[], selectedCampaignId: number | null): string => {
  const visibleCampaigns = selectedCampaignId
    ? campaigns.filter(({ id_campagne: campaignId }) => campaignId === selectedCampaignId)
    : campaigns;
  const types = new Set(visibleCampaigns.map(({ type_campagne: campaignType }) => campaignType));
  if (types.size !== 1) return 'Dossiers validés';
  return types.has('lead_b2b') ? 'Rendez-vous validés' : 'Commandes validées';
};

interface PartenaireDocumentsContentProps {
  navigateBack: () => void;
  viewModel: PartenaireDocumentsViewModel;
}

export default function PartenaireDocumentsContent({ navigateBack, viewModel }: PartenaireDocumentsContentProps): ReactElement {
  const {
    data,
    dateDebut,
    dateFin,
    downloadDocument,
    error,
    loading,
    nextPage,
    period,
    previousPage,
    refresh,
    selectCampaign,
    selectPeriod,
    selectedCampaignId,
    setDateDebut,
    setDateFin,
  } = viewModel;
  const heroTitle = getHeroTitle(data?.campagnes || [], selectedCampaignId);

  return <main className="partnerDocuments">
    <div className="partnerDocuments__back"><Button style="back" onClick={navigateBack}><MdArrowBack /> Retour</Button></div>
    <section className="partnerDocuments__hero">
      <div><p>Documents commerciaux</p><h1>{heroTitle}</h1><span>Retrouvez les pièces déposées pour les dossiers finalisés de vos campagnes.</span></div>
      <Button style="white" onClick={refresh} disabled={loading}><IoRefresh /> Actualiser</Button>
    </section>

    <section className="partnerDocuments__filters" aria-label="Filtres des documents">
      <label>Campagne<select value={selectedCampaignId || ''} onChange={(event) => selectCampaign(event.target.value ? Number(event.target.value) : null)}><option value="">Toutes les campagnes autorisées</option>{data?.campagnes.map((campaign) => <option key={campaign.id_campagne} value={campaign.id_campagne}>{campaign.nom_campagne}</option>)}</select></label>
      <label>Période<select value={period} onChange={(event) => selectPeriod(event.target.value as PartenaireDocumentsPeriod)}>{PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      {period === 'custom' && <><label>Du<input type="date" value={dateDebut} max={dateFin} onChange={(event) => setDateDebut(event.target.value)} /></label><label>Au<input type="date" value={dateFin} min={dateDebut} onChange={(event) => setDateFin(event.target.value)} /></label></>}
      <div className="partnerDocuments__counter"><strong>{data?.pagination.total || 0}</strong><span>dossier{(data?.pagination.total || 0) > 1 ? 's' : ''}</span></div>
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
      <button type="button" onClick={previousPage} disabled={data.pagination.page <= 1}><IoChevronBack /> Précédent</button>
      <span>Page {data.pagination.page} sur {data.pagination.total_pages}</span>
      <button type="button" onClick={nextPage} disabled={data.pagination.page >= data.pagination.total_pages}>Suivant <IoChevronForward /></button>
    </nav>}
  </main>;
}
