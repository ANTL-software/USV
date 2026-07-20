import type { ReactElement } from 'react';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import type { PaniersListViewModel } from '../../../hooks/index.ts';
import { PANIER_ORIGIN_OPTIONS } from '../../../utils/scripts/index.ts';
import type { PanierOriginOption } from '../../../utils/types/index.ts';

interface PanierListFormProps { viewModel: PaniersListViewModel }

export function PanierListForm({ viewModel }: PanierListFormProps): ReactElement {
  return (
    <div className="paniersList__form-wrapper"><div className="paniersList__form-card">
      <h2>{viewModel.editingId !== null ? 'Modifier le panier' : 'Nouveau panier'}</h2>
      <form onSubmit={viewModel.submit} className="paniersList__form">
        {viewModel.formError && <div className="paniersList__error">{viewModel.formError}</div>}
        <label>Label *<input value={viewModel.form.label} onChange={(event) => viewModel.updateField('label', event.target.value)} required placeholder="Ex : Panier Standard" /></label>
        <label>Origine<Select<PanierOriginOption> value={viewModel.selectedOrigin} onChange={(option: SingleValue<PanierOriginOption>) => viewModel.updateOrigin(option?.value ?? null)} options={PANIER_ORIGIN_OPTIONS} placeholder="— Sélectionner une origine —" classNamePrefix="reactSelect" menuPosition="fixed" /></label>
        <label>Prix HT<input type="number" min="0" step="0.01" value={viewModel.form.prix_ht} onChange={(event) => viewModel.updateField('prix_ht', event.target.value)} placeholder="Ex : 49.90" /></label>
        <label className="paniersList__checkbox"><input type="checkbox" checked={viewModel.form.actif} onChange={(event) => viewModel.updateField('actif', event.target.checked)} /> Panier actif</label>
        <div className="paniersList__form-actions"><button type="button" onClick={viewModel.closeForm}>Annuler</button><button type="submit" className="paniersList__btn-submit">{viewModel.editingId !== null ? 'Mettre à jour' : 'Créer'}</button></div>
      </form>
    </div></div>
  );
}
