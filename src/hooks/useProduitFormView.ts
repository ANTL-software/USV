import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  buildProduitCampaignOptions,
  buildProduitCategoryOptions,
  buildProduitFormReturnState,
  buildProduitPanierOptions,
  buildProduitTypeOptions,
  getProduitTypePlaceholder,
} from '../utils/scripts/index.ts';
import type {
  ProduitFormReturnState,
  ProduitFormSelectOption,
  ProduitPanierOption,
} from '../utils/scripts/index.ts';
import { showError } from '../utils/services/index.ts';
import { useCampagnes } from './useCampagnes.ts';
import { useProduitForm } from './useProduitForm.ts';
import { useProduitPaniers } from './useProduitPaniers.ts';
import { useCategories } from './useProduits.ts';
import { useTypesProduits } from './useTypesProduits.ts';

export function useProduitFormView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const locationState = location.state as Partial<ProduitFormReturnState> | null;
  const productId = id && Number.isFinite(Number(id)) ? Number(id) : null;
  const productForm = useProduitForm();
  const { categories, handleCategorieChange } = useCategories();
  const { campagnes } = useCampagnes();
  const categoryId = productForm.form.id_categorie
    ? Number(productForm.form.id_categorie)
    : null;
  const typeState = useTypesProduits({ categorieId: categoryId });
  const basketState = useProduitPaniers({ produitId: productId });

  const categoryOptions = useMemo(
    () => buildProduitCategoryOptions(categories),
    [categories],
  );
  const campaignOptions = useMemo(
    () => buildProduitCampaignOptions(campagnes),
    [campagnes],
  );
  const typeOptions = useMemo(
    () => buildProduitTypeOptions(typeState.types),
    [typeState.types],
  );
  const basketOptions = useMemo(
    () => buildProduitPanierOptions(productForm.paniers, basketState.paniersDuProduit),
    [basketState.paniersDuProduit, productForm.paniers],
  );
  const selectedBaskets = useMemo(
    () => basketOptions.filter(({ isSelected }) => isSelected),
    [basketOptions],
  );
  const selectedCampaign = productForm.campagneId
    ? campaignOptions.find(({ value }) => value === String(productForm.campagneId))
      ?? (productForm.campagneNom
        ? { value: String(productForm.campagneId), label: productForm.campagneNom }
        : null)
    : null;
  const selectedCategory = categoryOptions.find(
    ({ value }) => value === productForm.form.id_categorie,
  ) ?? null;
  const selectedType = typeOptions.find(
    ({ value }) => value === productForm.form.id_type_produit,
  ) ?? null;
  const typePlaceholder = getProduitTypePlaceholder(
    productForm.form.id_categorie,
    typeState.isLoading,
  );
  const returnState = buildProduitFormReturnState({
    campagneId: productForm.campagneId,
    campagneNom: productForm.campagneNom,
    isEdit: productForm.isEdit,
    productId,
    returnPage: locationState?.returnPage,
    returnScrollPosition: locationState?.returnScrollPosition,
  });

  const navigateBack = useCallback((): void => {
    void navigate('/produits', { state: returnState });
  }, [navigate, returnState]);

  const handleCampaignChange = useCallback((option: ProduitFormSelectOption | null): void => {
    productForm.setCampagneId(option ? Number(option.value) : null);
    productForm.setCampagneNom(option?.label ?? '');
  }, [productForm]);

  const handleCategoryChange = useCallback((option: ProduitFormSelectOption | null): void => {
    void handleCategorieChange(
      option,
      (categoryValue) => productForm.handleSelectChange('id_categorie', categoryValue),
    );
  }, [handleCategorieChange, productForm]);

  const handleTypeChange = useCallback(async (
    option: ProduitFormSelectOption | null,
  ): Promise<void> => {
    if (!option) {
      productForm.handleSelectChange('id_type_produit', '');
      return;
    }
    if (!option.__isNew__) {
      productForm.handleSelectChange('id_type_produit', option.value);
      return;
    }

    try {
      const newType = await typeState.getOrCreate(option.label);
      productForm.handleSelectChange('id_type_produit', String(newType.id_type_produit));
    } catch (creationError) {
      await showError(
        creationError instanceof Error
          ? creationError.message
          : 'Erreur lors de la création du type',
      );
    }
  }, [productForm, typeState]);

  const handleBasketsChange = useCallback(async (
    options: readonly ProduitPanierOption[],
  ): Promise<void> => {
    await basketState.updatePaniers(options.map(({ panier }) => panier));
  }, [basketState]);

  return {
    basketOptions,
    campaignOptions,
    categoryOptions,
    handleBasketsChange,
    handleCampaignChange,
    handleCategoryChange,
    handleTypeChange,
    navigateBack,
    productForm,
    selectedBaskets,
    selectedCampaign,
    selectedCategory,
    selectedType,
    typeOptions,
    typePlaceholder,
    typesLoading: typeState.isLoading,
  };
}

export type ProduitFormViewModel = ReturnType<typeof useProduitFormView>;
