import type { ReactElement } from 'react';
import type { SitesProspectionViewModel } from '../../../hooks/index.ts';
import { Button, Modal } from '../index.ts';

interface SitesProspectionDetailModalProps { viewModel: SitesProspectionViewModel }

export function SitesProspectionDetailModal({ viewModel: vm }: SitesProspectionDetailModalProps): ReactElement | null {
 if (!vm.selected || !vm.form) return null;
 return <Modal isVisible onClose={() => { if (!vm.saving) vm.close(); }} title={`Fiche ${vm.selected.domain}`}>
  <div className="sitesProspection__detail">
   <p>{vm.selected.identification} · {vm.selected.etat_entreprise || 'État inconnu'}</p>
   <form onSubmit={e => { e.preventDefault(); void vm.save(); }}><fieldset disabled={vm.saving}><div className="sitesProspection__formGrid">
   {vm.fields.map(field => <label className="sitesProspection__field" key={field.key}>{field.label}{['adresse', 'agence_note', 'notes'].includes(field.key) ? <textarea maxLength={field.max} value={vm.form?.[field.key] || ''} onChange={e => vm.changeForm(field.key, e.target.value)} /> : <input maxLength={field.max} value={vm.form?.[field.key] || ''} onChange={e => vm.changeForm(field.key, e.target.value)} />}</label>)}
   <label className="sitesProspection__field">Statut de preuve agence<select value={vm.form.agence_statut} onChange={e => vm.changeForm('agence_statut', e.target.value)}>{vm.agencyOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
   <label className="sitesProspection__field">Statut de suivi<select value={vm.form.suivi} onChange={e => vm.changeForm('suivi', e.target.value)}>{vm.followupOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
   </div></fieldset>{vm.error && <p role="alert">{vm.error}</p>}{vm.success && <p role="status">{vm.success}</p>}<div className="sitesProspection__actions"><Button style="grey" disabled={vm.saving} onClick={vm.reloadSelected}>Recharger la fiche</Button><Button style="gradient" type="submit" disabled={vm.saving}>{vm.saving ? 'Enregistrement…' : 'Enregistrer'}</Button></div></form>
   <section className="sitesProspection__sources"><h3>Sources téléphone</h3><p>{vm.phoneLabel}{vm.selected.telephone_type === 'voip' ? ' · Numéro 09' : ''} · Consultation : {vm.selected.telephone_verifie_at || 'Non recherchée'}</p><p>Numéro publié, sans vérification de fonctionnement de la ligne. Les candidats multiples restent à examiner.</p>{vm.phoneSourceLink && <a href={vm.phoneSourceLink} target="_blank" rel="noreferrer">Source du numéro retenu ↗</a>}{vm.phoneProofs.map((proof, index) => <article key={index}><strong>{proof.display} · {proof.mode === 'site_public' ? 'Site consulté' : proof.mode === 'annuaire_indexe' ? 'Annuaire indexé' : 'Page indexée'}</strong><p>{proof.excerpt}</p><small>{proof.eligible ? 'Candidat publié' : `Écarté : ${proof.excluded_reason}`} · {proof.checked_at}{proof.match_basis ? ` · Rapprochement : ${proof.match_basis}` : ''}{proof.source_freshness ? ` · Index : ${proof.source_freshness}` : ''}</small><br />{proof.link && <a href={proof.link} target="_blank" rel="noreferrer">Page source ↗</a>}</article>)}</section>
   <section className="sitesProspection__sources"><h3>Sources entreprise</h3><p>Adresse publiée sur le site : {vm.sourceAddress || 'Non trouvée'}</p><p>Registre consulté : {vm.sourceDate || 'Non vérifié'}</p>{vm.sourceLinks.map(link => <a key={link.label} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗ </a>)}</section>
   <section className="sitesProspection__sources"><h3>Preuves agence</h3>{vm.proofs.length === 0 && <p>Aucune preuve explicite de réalisation. Agence à vérifier.</p>}{vm.proofs.map((proof, index) => <article key={index}><strong>{proof.label}</strong><p>{proof.excerpt}</p><small>Consulté le {proof.fetched_at || 'date inconnue'}</small><br />{proof.link && <a href={proof.link} target="_blank" rel="noreferrer">Page source ↗ </a>}{proof.resourceLink && <a href={proof.resourceLink} target="_blank" rel="noreferrer">Lien du crédit ↗</a>}</article>)}</section>

  </div>
 </Modal>;
}
