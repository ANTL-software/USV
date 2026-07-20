import './emailModal.scss';
import type { FormEvent, ReactElement } from 'react';
import { FiFileText, FiUser } from 'react-icons/fi';
import { MdClose, MdEmail, MdMessage, MdSend, MdSubject } from 'react-icons/md';
import type { EmailComposerViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';

export default function EmailModal({ viewModel }: { viewModel: EmailComposerViewModel }): ReactElement | null {
  if (!viewModel.isVisible) return null;
  const submit = (event: FormEvent<HTMLFormElement>): void => { event.preventDefault(); void viewModel.submit(); };
  return <div id="emailModal"><div className="emailModalOverlay" onClick={viewModel.close}><div className="emailModalContent" onClick={(event) => event.stopPropagation()}>
    <header className="emailModalHeader"><div className="modalTitle"><MdEmail className="titleIcon" /><h2>{viewModel.copy.title}</h2></div><button className="closeBtn" onClick={viewModel.close} type="button"><MdClose /></button></header>
    {viewModel.bulkMode
      ? <div className="bulkCourrierInfo"><FiFileText className="courrierIcon" /><div className="bulkDetails"><h3>Envoi groupé de {viewModel.selectedCount} courrier{viewModel.selectedCount > 1 ? 's' : ''}</h3><p className="bulkDescription">Les courriers sélectionnés seront envoyés en pièces jointes dans un seul email.</p></div></div>
      : viewModel.courrier && <div className="courrierInfo"><FiFileText className="courrierIcon" /><div className="courrierDetails"><span className="fileName">{viewModel.courrier.fileName}</span><span className="fileInfo">{viewModel.courrier.kind} • {viewModel.courrier.department} • {viewModel.courrier.direction}</span></div></div>}
    <form onSubmit={submit} className="emailForm">
      <div className="formGroup"><label htmlFor="emailTo" className="formLabel"><FiUser className="labelIcon" />Destinataire *</label><input id="emailTo" type="email" placeholder="exemple@domaine.com" value={viewModel.form.to} onChange={(event) => viewModel.updateField('to', event.target.value)} className="formInput" disabled={viewModel.isLoading} required /></div>
      <div className="formGroup"><label htmlFor="emailSubject" className="formLabel"><MdSubject className="labelIcon" />Sujet *</label><input id="emailSubject" type="text" placeholder="Objet de l'email" value={viewModel.form.subject} onChange={(event) => viewModel.updateField('subject', event.target.value)} className="formInput" disabled={viewModel.isLoading} required /></div>
      <div className="formGroup"><label htmlFor="emailMessage" className="formLabel"><MdMessage className="labelIcon" />Note personnelle</label><textarea id="emailMessage" placeholder="Ajoutez une note personnelle à votre envoi (optionnel)..." value={viewModel.form.message} onChange={(event) => viewModel.updateField('message', event.target.value)} className="formTextarea" rows={4} disabled={viewModel.isLoading} /></div>
      {viewModel.form.error && <div className="errorMessage">{viewModel.form.error}</div>}
      <div className="formActions"><Button type="button" style="grey" onClick={viewModel.close} disabled={viewModel.isLoading}>Annuler</Button><Button type="submit" style="green" disabled={viewModel.isLoading}>{viewModel.isLoading ? <><span className="loadingSpinner" />{viewModel.copy.sendingLabel}</> : <>{viewModel.copy.sendLabel}<MdSend fill="#ffffff" /></>}</Button></div>
    </form>
    <div className="infoNote"><span className="infoIcon">ℹ️</span><p>{viewModel.copy.information}</p></div>
  </div></div></div>;
}
