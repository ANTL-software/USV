import type { ReactElement } from 'react';
import { IoAdd, IoBasketOutline, IoCloudUpload } from 'react-icons/io5';
import Select from 'react-select';

import type { ProduitsListViewModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';

interface ProduitsListControlsProps {
  viewModel: ProduitsListViewModel;
}

export function ProduitsListControls({ viewModel }: ProduitsListControlsProps): ReactElement {
  const { productState } = viewModel;

  return (
    <>
      <div className="produitsList__header">
        <div>
          <h1>Produits</h1>
          <p className="produitsList__subtitle">Gérez les produits par campagne client</p>
        </div>
        <div className="produitsList__actions">
          <Button style="gradient" onClick={viewModel.navigateToNewProduct} disabled={!viewModel.selectedCampagne}>
            <IoAdd /> Nouveau produit
          </Button>
          <Button style="gradient" onClick={viewModel.openImportModal} disabled={!viewModel.selectedCampagne}>
            <IoCloudUpload /> Import CSV
          </Button>
          <Button style="gradient" onClick={viewModel.navigateToBaskets}>
            <IoBasketOutline /> Paniers
          </Button>
        </div>
      </div>

      <div className="produitsList__campagne-select">
        <label className="produitsList__label">Campagne</label>
        <Select
          value={viewModel.selectedCampagne}
          onChange={viewModel.setSelectedCampagne}
          options={viewModel.campagneOptions}
          isLoading={viewModel.campagnesLoading}
          isClearable
          placeholder="— Sélectionner une campagne —"
          noOptionsMessage={() => 'Aucune campagne'}
          classNamePrefix="reactSelect"
        />
      </div>

      {viewModel.selectedCampagne && (
        <div className="produitsList__filters">
          <div className="produitsList__search">
            <label className="produitsList__label">Recherche</label>
            <input
              type="text"
              className="produitsList__search-input"
              placeholder="Rechercher (code, nom, fournisseur...)"
              value={productState.search}
              onChange={(event) => productState.setSearch(event.target.value)}
            />
          </div>
          <div className="produitsList__filter">
            <label className="produitsList__label">Catégorie</label>
            <Select
              value={productState.categorieFilter}
              onChange={productState.setCategorieFilter}
              options={viewModel.categorieOptions}
              isLoading={viewModel.categoriesTypesLoading}
              isClearable
              placeholder="Toutes catégories"
              noOptionsMessage={() => 'Aucune catégorie'}
              classNamePrefix="reactSelect"
            />
          </div>
          <div className="produitsList__filter">
            <label className="produitsList__label">Type</label>
            <Select
              value={productState.typeFilter}
              onChange={productState.setTypeFilter}
              options={viewModel.typeOptions}
              isLoading={viewModel.categoriesTypesLoading}
              isClearable
              placeholder="Tous types"
              noOptionsMessage={() => 'Aucun type'}
              classNamePrefix="reactSelect"
            />
          </div>
        </div>
      )}
    </>
  );
}
