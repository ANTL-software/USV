import './partenairesExternes.scss';
import type { ReactElement } from 'react';
import { MdArrowBack, MdEdit, MdPersonAdd } from 'react-icons/md';
import { usePartenairesExternesPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import {
  PARTNER_DOCUMENTS_PERMISSION,
  PARTNER_PROSPECTS_PERMISSION,
  PARTNER_RECORDINGS_PERMISSION,
  PARTNER_STATISTICS_PERMISSION,
} from '../../../utils/scripts/index.ts';
import { Button, Header } from '../../components/index.ts';

function PartenairesExternes(): ReactElement {
  const viewModel = usePartenairesExternesPage();

  return <div id="externalPartnersPage"><Header /><main className="externalPartners">
    <Button style="back" onClick={() => { window.history.back(); }}><MdArrowBack /> Retour</Button>
    <header><div><h1>Partenaires externes</h1><p>Comptes USV isolés des employés, du dialer et des données RH.</p></div><span>{viewModel.partners.length} compte{viewModel.partners.length > 1 ? 's' : ''}</span></header>
    {viewModel.error && <p className="externalPartners__error">{viewModel.error}</p>}
    {viewModel.message && <p className="externalPartners__success">{viewModel.message}</p>}
    <section className="externalPartners__grid">
      <div className="externalPartners__list">
        {viewModel.partners.length === 0 ? <p>Aucun partenaire externe.</p> : viewModel.partners.map((partner) => <article key={partner.id_partenaire_externe}>
          <div><h2>{partner.raison_sociale}</h2><p>{partner.prenom} {partner.nom} · {partner.email}</p><small>{partner.actif ? 'Actif' : 'Désactivé'} · {partner.id_campagnes_autorisees.length === 1 ? '1 campagne active' : 'Configuration campagne à corriger'}</small></div>
          <Button style="white" onClick={() => viewModel.edit(partner)}><MdEdit /> Modifier</Button>
        </article>)}
      </div>
      <form className="externalPartners__form" onSubmit={(event) => { void viewModel.submit(event); }}>
        <h2>{viewModel.editingId ? 'Modifier le compte' : 'Créer un compte partenaire'}</h2>
        <label>Raison sociale<input required value={viewModel.form.raison_sociale} onChange={(event) => viewModel.setField('raison_sociale', event.target.value)} /></label>
        <div className="externalPartners__row"><label>Prénom<input required value={viewModel.form.prenom} onChange={(event) => viewModel.setField('prenom', event.target.value)} /></label><label>Nom<input required value={viewModel.form.nom} onChange={(event) => viewModel.setField('nom', event.target.value)} /></label></div>
        <label>Email<input required type="email" value={viewModel.form.email} onChange={(event) => viewModel.setField('email', event.target.value)} /></label>
        <label>Mot de passe {viewModel.editingId ? '(laisser vide pour conserver)' : ''}<input required={!viewModel.editingId} type="password" value={viewModel.form.password || ''} onChange={(event) => viewModel.setField('password', event.target.value)} /></label>
        <fieldset><legend>Accès USV</legend>
          <label className="externalPartners__check"><input type="checkbox" checked={viewModel.form.permissions[PARTNER_STATISTICS_PERMISSION] === true} onChange={(event) => viewModel.togglePermission(PARTNER_STATISTICS_PERMISSION, event.target.checked)} /> Statistiques partenaire</label>
          <label className="externalPartners__check"><input type="checkbox" checked={viewModel.form.permissions[PARTNER_DOCUMENTS_PERMISSION] === true} onChange={(event) => viewModel.togglePermission(PARTNER_DOCUMENTS_PERMISSION, event.target.checked)} /> Bons de commande et fiches de rendez-vous</label>
          <label className="externalPartners__check"><input type="checkbox" checked={viewModel.form.permissions[PARTNER_PROSPECTS_PERMISSION] === true} onChange={(event) => viewModel.togglePermission(PARTNER_PROSPECTS_PERMISSION, event.target.checked)} /> Extraction des prospects et export CSV</label>
          <label className="externalPartners__check"><input type="checkbox" checked={viewModel.form.permissions[PARTNER_RECORDINGS_PERMISSION] === true} onChange={(event) => viewModel.togglePermission(PARTNER_RECORDINGS_PERMISSION, event.target.checked)} /> Écoute des appels de campagne</label>
        </fieldset>
        <fieldset><legend>Campagne active du partenaire</legend>{viewModel.campaigns.map((campaign) => <label className="externalPartners__check" key={campaign.id_campagne}><input required type="radio" name="partner-active-campaign" checked={viewModel.form.id_campagnes_autorisees[0] === campaign.id_campagne} onChange={() => viewModel.selectCampaign(campaign.id_campagne)} /> {campaign.nom_campagne}</label>)}</fieldset>
        <label className="externalPartners__check"><input type="checkbox" checked={viewModel.form.actif} onChange={(event) => viewModel.setField('actif', event.target.checked)} /> Compte actif</label>
        <div className="externalPartners__actions"><Button style="gradient" type="submit" disabled={viewModel.saving}><MdPersonAdd /> {viewModel.saving ? 'Enregistrement…' : viewModel.editingId ? 'Mettre à jour' : 'Créer le compte'}</Button>{viewModel.editingId && <Button style="white" onClick={viewModel.reset}>Annuler</Button>}</div>
      </form>
    </section>
  </main></div>;
}

export default WithAuth(PartenairesExternes);
