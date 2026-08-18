import './partenairesExternes.scss';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { MdArrowBack, MdEdit, MdPersonAdd } from 'react-icons/md';
import { getAllCampagnesService, createPartenaireExterneService, getPartenairesExternesService, updatePartenaireExterneService } from '../../../API/services/index.ts';
import type { Campagne, PartenaireExterne, PartenaireExternePayload } from '../../../utils/types/index.ts';
import { PARTNER_DOCUMENTS_PERMISSION, PARTNER_STATISTICS_PERMISSION } from '../../../utils/scripts/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { Button, Header } from '../../components/index.ts';

const initialForm = (): PartenaireExternePayload => ({
  raison_sociale: '', nom: '', prenom: '', email: '', password: '',
  permissions: { [PARTNER_STATISTICS_PERMISSION]: true, [PARTNER_DOCUMENTS_PERMISSION]: false }, id_campagnes_autorisees: [], actif: true,
});

function PartenairesExternes(): ReactElement {
  const [partners, setPartners] = useState<PartenaireExterne[]>([]);
  const [campaigns, setCampaigns] = useState<Campagne[]>([]);
  const [form, setForm] = useState<PartenaireExternePayload>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = async (): Promise<void> => {
    const [loadedPartners, loadedCampaigns] = await Promise.all([getPartenairesExternesService(), getAllCampagnesService()]);
    setPartners(loadedPartners);
    setCampaigns(loadedCampaigns);
  };

  useEffect(() => { void refresh().catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Erreur de chargement')); }, []);

  const setField = (field: keyof PartenaireExternePayload, value: string | boolean): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const toggleCampaign = (id: number): void => {
    setForm((current) => ({
      ...current,
      id_campagnes_autorisees: current.id_campagnes_autorisees.includes(id)
        ? current.id_campagnes_autorisees.filter((campaignId) => campaignId !== id)
        : [...current.id_campagnes_autorisees, id],
    }));
  };
  const edit = (partner: PartenaireExterne): void => {
    setEditingId(partner.id_partenaire_externe);
    setForm({ ...partner, password: '' });
    setMessage(null); setError(null);
  };
  const reset = (): void => { setEditingId(null); setForm(initialForm()); setError(null); setMessage(null); };
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault(); setSaving(true); setError(null); setMessage(null);
    try {
      if (!editingId && !form.password) throw new Error('Le mot de passe est requis à la création.');
      if (editingId) await updatePartenaireExterneService(editingId, form);
      else await createPartenaireExterneService(form);
      await refresh(); reset(); setMessage(editingId ? 'Compte partenaire mis à jour.' : 'Compte partenaire créé.');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Erreur lors de l’enregistrement'); }
    finally { setSaving(false); }
  };

  return <div id="externalPartnersPage"><Header /><main className="externalPartners">
    <Button style="back" onClick={() => { window.history.back(); }}><MdArrowBack /> Retour</Button>
    <header><div><h1>Partenaires externes</h1><p>Comptes USV isolés des employés, du dialer et des données RH.</p></div><span>{partners.length} compte{partners.length > 1 ? 's' : ''}</span></header>
    {error && <p className="externalPartners__error">{error}</p>}
    {message && <p className="externalPartners__success">{message}</p>}
    <section className="externalPartners__grid">
      <div className="externalPartners__list">
        {partners.length === 0 ? <p>Aucun partenaire externe.</p> : partners.map((partner) => <article key={partner.id_partenaire_externe}>
          <div><h2>{partner.raison_sociale}</h2><p>{partner.prenom} {partner.nom} · {partner.email}</p><small>{partner.actif ? 'Actif' : 'Désactivé'} · {partner.id_campagnes_autorisees.length} campagne(s)</small></div>
          <Button style="white" onClick={() => edit(partner)}><MdEdit /> Modifier</Button>
        </article>)}
      </div>
      <form className="externalPartners__form" onSubmit={(event) => { void submit(event); }}>
        <h2>{editingId ? 'Modifier le compte' : 'Créer un compte partenaire'}</h2>
        <label>Raison sociale<input required value={form.raison_sociale} onChange={(event) => setField('raison_sociale', event.target.value)} /></label>
        <div className="externalPartners__row"><label>Prénom<input required value={form.prenom} onChange={(event) => setField('prenom', event.target.value)} /></label><label>Nom<input required value={form.nom} onChange={(event) => setField('nom', event.target.value)} /></label></div>
        <label>Email<input required type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} /></label>
        <label>Mot de passe {editingId ? '(laisser vide pour conserver)' : ''}<input required={!editingId} type="password" value={form.password || ''} onChange={(event) => setField('password', event.target.value)} /></label>
        <fieldset><legend>Accès USV</legend>
          <label className="externalPartners__check"><input type="checkbox" checked={form.permissions[PARTNER_STATISTICS_PERMISSION] === true} onChange={(event) => setForm((current) => ({ ...current, permissions: { ...current.permissions, [PARTNER_STATISTICS_PERMISSION]: event.target.checked } }))} /> Statistiques partenaire</label>
          <label className="externalPartners__check"><input type="checkbox" checked={form.permissions[PARTNER_DOCUMENTS_PERMISSION] === true} onChange={(event) => setForm((current) => ({ ...current, permissions: { ...current.permissions, [PARTNER_DOCUMENTS_PERMISSION]: event.target.checked } }))} /> Bons de commande et fiches de rendez-vous</label>
        </fieldset>
        <fieldset><legend>Campagnes autorisées</legend>{campaigns.map((campaign) => <label className="externalPartners__check" key={campaign.id_campagne}><input type="checkbox" checked={form.id_campagnes_autorisees.includes(campaign.id_campagne)} onChange={() => toggleCampaign(campaign.id_campagne)} /> {campaign.nom_campagne}</label>)}</fieldset>
        <label className="externalPartners__check"><input type="checkbox" checked={form.actif} onChange={(event) => setField('actif', event.target.checked)} /> Compte actif</label>
        <div className="externalPartners__actions"><Button style="gradient" type="submit" disabled={saving}><MdPersonAdd /> {saving ? 'Enregistrement…' : editingId ? 'Mettre à jour' : 'Créer le compte'}</Button>{editingId && <Button style="white" onClick={reset}>Annuler</Button>}</div>
      </form>
    </section>
  </main></div>;
}

export default WithAuth(PartenairesExternes);
