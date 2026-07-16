import type { ReactElement } from 'react';
import Select from 'react-select';
import Creatable from 'react-select/creatable';

import type { ProduitFormViewModel } from '../../../hooks/index.ts';
import type { ProduitPanierOption } from '../../../utils/scripts/index.ts';
import { PanierMultiValue, PanierOption } from '../index.ts';

interface ProduitFormIdentityProps {
  viewModel: ProduitFormViewModel;
}

export function ProduitFormIdentity({ viewModel }: ProduitFormIdentityProps): ReactElement {
  const { form, handleChange } = viewModel.productForm;
  return (
    <fieldset>
      <legend>Identification</legend>
      <div className="produitForm__row">
        <label>Code produit *<input name="code_produit" value={form.code_produit} onChange={handleChange} required placeholder="Ex : BV-FEN-001" /></label>
        <label>Nom du produit *<input name="nom_produit" value={form.nom_produit} onChange={handleChange} required placeholder="Ex : Fenêtre PVC double vitrage" /></label>
      </div>
      <div className="produitForm__row">
        <label>Code fournisseur<input name="code_produit_origine" value={form.code_produit_origine} onChange={handleChange} placeholder="Ex : REF-001" /></label>
        <label>Nom fournisseur<input name="nom_produit_origine" value={form.nom_produit_origine} onChange={handleChange} placeholder="Ex : Stylo Bic Réf" /></label>
      </div>
      <div className="produitForm__row">
        <label>
          Catégorie
          <Creatable
            value={viewModel.selectedCategory}
            onChange={viewModel.handleCategoryChange}
            options={viewModel.categoryOptions}
            isClearable
            placeholder="— Sélectionner ou taper une nouvelle catégorie —"
            noOptionsMessage={() => 'Aucune catégorie'}
            classNamePrefix="reactSelect"
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </label>
        <label>
          Type de produit
          <Creatable
            value={viewModel.selectedType}
            onChange={(option) => { void viewModel.handleTypeChange(option); }}
            options={viewModel.typeOptions}
            isClearable
            isDisabled={!form.id_categorie || viewModel.typesLoading}
            placeholder={viewModel.typePlaceholder}
            noOptionsMessage={() => 'Aucun type pour cette catégorie'}
            formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
            classNamePrefix="reactSelect"
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </label>
        <label>Prix unitaire (€)<input type="number" name="prix_unitaire" value={form.prix_unitaire} onChange={handleChange} min="0" step="0.01" placeholder="0.00" /></label>
      </div>
      <div className="produitForm__row">
        <label>
          Paniers
          <Select<ProduitPanierOption, true>
            isMulti
            value={viewModel.selectedBaskets}
            options={viewModel.basketOptions}
            onChange={(options) => { void viewModel.handleBasketsChange(options); }}
            isSearchable
            placeholder="— Sélectionner des paniers —"
            noOptionsMessage={() => 'Aucun panier'}
            classNamePrefix="reactSelect"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            closeMenuOnSelect={false}
            components={{ MultiValue: PanierMultiValue, Option: PanierOption }}
            styles={{
              multiValue: (base) => ({ ...base, background: 'transparent', padding: 0 }),
              multiValueLabel: (base) => ({ ...base, padding: 0 }),
            }}
          />
        </label>
      </div>
      <label className="produitForm__label-full">
        Description
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Description du produit..." />
      </label>
    </fieldset>
  );
}
