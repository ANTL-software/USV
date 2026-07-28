import type { ReactElement } from 'react';
import { MdImage, MdOpenInNew } from 'react-icons/md';
import type { SocialPublicationDetail, SocialPublicationHistoryEntry } from '../../../utils/types/index.ts';
import { Button, Modal } from '../index.ts';

const platformLabels = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn' } as const;
const statusLabels = { scheduled: 'Programmé', published: 'Publié', failed: 'En échec' } as const;

const formatDate = (value: string | null): string => value ? new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value)) : '—';

interface SocialPublicationHistoryDetailModalProps {
  entry: SocialPublicationHistoryEntry | null;
  detail: SocialPublicationDetail | null;
  error: string | null;
  isLoading: boolean;
  onClose: () => void;
}

export function SocialPublicationHistoryDetailModal({ entry, detail, error, isLoading, onClose }: SocialPublicationHistoryDetailModalProps): ReactElement | null {
  if (!entry) return null;
  const text = detail?.textes[entry.platform] || '';
  return <Modal isVisible onClose={onClose} title={`Détail · ${entry.subject}`}><div className="socialPublicationView__history-detail">
    {isLoading && <p className="socialPublicationView__empty">Chargement du brouillon…</p>}
    {error && <p className="socialPublicationView__table-error">{error}</p>}
    {!isLoading && !error && detail && <>
      <div className="socialPublicationView__history-detail-header"><div><span className="socialPublicationView__section-kicker">{platformLabels[entry.platform]}</span><h2>{detail.sujet}</h2><p>{detail.categorie} · <span className={`socialPublicationView__history-status socialPublicationView__history-status--${entry.status}`}>{statusLabels[entry.status]}</span></p></div><dl><div><dt>Programmée</dt><dd>{formatDate(entry.scheduledAt)}</dd></div><div><dt>Traitée</dt><dd>{formatDate(entry.processedAt)}</dd></div></dl></div>
      <div className="socialPublicationView__history-detail-grid"><section><h3>Texte publié sur {platformLabels[entry.platform]}</h3><p className="socialPublicationView__history-copy">{text || 'Aucun texte enregistré pour ce réseau.'}</p>{detail.visuel_notes && <><h3>Note visuelle</h3><p>{detail.visuel_notes}</p></>}</section><section><h3><MdImage /> Visuel associé</h3>{detail.visuel_apercu_url ? <a className="socialPublicationView__history-visual" href={detail.visuel_apercu_url} target="_blank" rel="noreferrer"><img src={detail.visuel_apercu_url} alt={`Visuel de ${detail.sujet}`} /><span><MdOpenInNew /> Ouvrir le visuel</span></a> : <p>Aucun visuel archivé.</p>}</section></div>
      <div className="socialPublicationView__history-detail-meta"><div><span>Créé le</span><strong>{formatDate(detail.created_at)}</strong></div><div><span>Validé le</span><strong>{formatDate(detail.valide_le)}</strong></div><div><span>Demandé pour</span><strong>{formatDate(detail.date_souhaitee)}</strong></div><div><span>Programmé par</span><strong>{entry.scheduledBy || entry.validatedBy || entry.createdBy || 'Système'}</strong></div>{entry.postId && <div><span>Identifiant de publication</span><strong>{entry.postId}</strong></div>}</div>
      {entry.error && <p className="socialPublicationView__history-detail-error">{entry.error}</p>}
    </>}
    <div className="socialPublicationView__history-detail-actions"><Button style="grey" onClick={onClose}>Fermer</Button></div>
  </div></Modal>;
}
