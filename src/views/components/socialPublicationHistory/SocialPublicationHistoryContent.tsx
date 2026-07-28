import type { ReactElement } from 'react';
import Select from 'react-select';
import { MdChevronLeft, MdChevronRight, MdHistory, MdRefresh } from 'react-icons/md';
import type { SocialPublicationHistoryState } from '../../../hooks/index.ts';
import type { SocialPlatform } from '../../../utils/types/index.ts';
import { Button } from '../index.ts';
import { SocialPublicationHistoryDetailModal } from './SocialPublicationHistoryDetailModal.tsx';

const platformOptions: Array<{ value: SocialPlatform | null; label: string }> = [
  { value: null, label: 'Tous les réseaux' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
];

const formatDate = (value: string | null): string => value ? new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value)) : '—';

const statusLabels = { scheduled: 'Programmé', published: 'Publié', failed: 'En échec' } as const;

export function SocialPublicationHistoryContent({ state }: { state: SocialPublicationHistoryState }): ReactElement {
  const page = state.data?.page ?? state.page;
  const totalPages = state.data?.totalPages ?? 1;
  return (
    <section className="socialPublicationView__panel socialPublicationView__history-panel">
      <div className="socialPublicationView__panel-header socialPublicationView__panel-header--actions">
        <div className="socialPublicationView__heading-copy"><MdHistory /><div><span className="socialPublicationView__section-kicker">Traçabilité</span><h2>Historique de diffusion</h2><p>Chaque réseau est tracé séparément, de sa programmation à son résultat de publication.</p></div></div>
        <Button style="white" onClick={() => void state.refresh()} disabled={state.isLoading}><MdRefresh />Actualiser</Button>
      </div>
      <div className="socialPublicationView__history-filters">
        <label><span>Réseau</span><Select<{ value: SocialPlatform | null; label: string }, false> options={platformOptions} value={platformOptions.find((option) => option.value === state.platform) ?? platformOptions[0]} onChange={(option) => state.setPlatform(option?.value ?? null)} classNamePrefix="socialSelect" isSearchable={false} menuPortalTarget={document.body} menuPosition="fixed" /></label>
        <span className="socialPublicationView__summary">{state.data?.total ?? 0} diffusion{(state.data?.total ?? 0) > 1 ? 's' : ''}</span>
      </div>
      {state.error && <p className="socialPublicationView__table-error">{state.error}</p>}
      {state.isLoading ? <p className="socialPublicationView__empty">Chargement de l’historique…</p> : state.data?.items.length ? (
        <div className="socialPublicationView__table-wrap"><table className="socialPublicationView__table socialPublicationView__history-table"><thead><tr><th>Publication</th><th>Réseau</th><th>Programmée</th><th>Résultat</th><th>Responsable</th><th>Identifiant</th></tr></thead><tbody>{state.data.items.map((item) => <tr key={`${item.draftId}-${item.platform}`} className="socialPublicationView__history-row" tabIndex={0} onClick={() => void state.openDetail(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); void state.openDetail(item); } }}><td><strong>{item.subject}</strong><small>{item.category}</small></td><td>{platformOptions.find((option) => option.value === item.platform)?.label}</td><td>{formatDate(item.scheduledAt)}</td><td><span className={`socialPublicationView__history-status socialPublicationView__history-status--${item.status}`}>{statusLabels[item.status]}{item.processedAt ? ` · ${formatDate(item.processedAt)}` : ''}</span>{item.error && <small className="socialPublicationView__table-error">{item.error}</small>}</td><td>{item.scheduledBy || item.validatedBy || item.createdBy || 'Système'}</td><td>{item.postId || '—'}</td></tr>)}</tbody></table></div>
      ) : <p className="socialPublicationView__empty">Aucune publication programmée ou diffusée.</p>}
      <div className="socialPublicationView__pagination"><Button style="white" disabled={page <= 1 || state.isLoading} onClick={() => state.setPage(page - 1)}><MdChevronLeft />Précédent</Button><span>Page {page} / {totalPages}</span><Button style="white" disabled={page >= totalPages || state.isLoading} onClick={() => state.setPage(page + 1)}>Suivant<MdChevronRight /></Button></div>
      <SocialPublicationHistoryDetailModal entry={state.selectedEntry} detail={state.selectedDetail} error={state.detailError} isLoading={state.isDetailLoading} onClose={state.closeDetail} />
    </section>
  );
}
