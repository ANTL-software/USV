import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buildAvailablePanierProductOptions, sortPanierProducts } from '../utils/scripts/index.ts';
import type { PanierProductOption } from '../utils/scripts/index.ts';
import { usePanierProduits } from './usePanierProduits.ts';

export function usePanierProduitsListView() {
  const navigate = useNavigate();
  const { idPanier } = useParams<{ idPanier: string }>();
  const parsedId = idPanier ? Number.parseInt(idPanier, 10) : Number.NaN;
  const panierId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
  const state = usePanierProduits({ panierId });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<PanierProductOption[]>([]);
  const availableProductOptions = useMemo(
    () => buildAvailablePanierProductOptions(state.allProduits, state.produits),
    [state.allProduits, state.produits],
  );
  const sortedProducts = useMemo(() => sortPanierProducts(state.produits), [state.produits]);

  const openAddModal = useCallback((): void => setShowAddModal(true), []);
  const closeAddModal = useCallback((): void => { setShowAddModal(false); setSelectedProducts([]); }, []);
  const addSelectedProducts = useCallback(async (): Promise<void> => {
    const added = await state.addProducts(selectedProducts.map(({ value }) => Number(value)));
    if (added) closeAddModal();
  }, [closeAddModal, selectedProducts, state]);
  const navigateBack = useCallback((): void => { void navigate('/paniers'); }, [navigate]);
  const moveProductUp = useCallback(async (associationId: number, order: number): Promise<void> => {
    await state.moveProduct(associationId, order - 1);
  }, [state]);
  const moveProductDown = useCallback(async (associationId: number, order: number): Promise<void> => {
    await state.moveProduct(associationId, order + 1);
  }, [state]);

  return {
    ...state,
    addSelectedProducts,
    availableProductOptions,
    closeAddModal,
    moveProductDown,
    moveProductUp,
    navigateBack,
    openAddModal,
    selectedProducts,
    setSelectedProducts,
    showAddModal,
    sortedProducts,
  };
}

export type PanierProduitsListViewModel = ReturnType<typeof usePanierProduitsListView>;
