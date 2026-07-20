import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  buildProduitListRows,
  buildProduitsListCampaignOptions,
  buildProduitsListPaginationPages,
} from '../utils/scripts/index.ts';
import type {
  ProduitsListNavigationState,
  ProduitsListSelectOption,
} from '../utils/scripts/index.ts';
import { useCampagneProduitsPaginated } from './useCampagneProduitsPaginated.ts';
import { useCampagnes } from './useCampagnes.ts';
import { useCategoriesAndTypes } from './useCategoriesAndTypes.ts';
import { useProduitImport } from './useProduitImport.ts';

export function useProduitsListView() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as Partial<ProduitsListNavigationState> | null;
  const { campagnes, isLoading: campagnesLoading } = useCampagnes();
  const {
    categorieOptions,
    typeOptions,
    isLoading: categoriesTypesLoading,
  } = useCategoriesAndTypes();
  const [selectedCampagne, setSelectedCampagne] = useState<ProduitsListSelectOption | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [fileInputVersion, setFileInputVersion] = useState(0);
  const [highlightedProductId, setHighlightedProductId] = useState<number | null>(null);
  const importState = useProduitImport();
  const campagneOptions = useMemo(
    () => buildProduitsListCampaignOptions(campagnes),
    [campagnes],
  );
  const campagneId = selectedCampagne ? Number(selectedCampagne.value) : null;
  const productState = useCampagneProduitsPaginated(campagneId);
  const productRows = useMemo(
    () => buildProduitListRows(productState.produits),
    [productState.produits],
  );
  const paginationPages = useMemo(
    () => productState.pagination
      ? buildProduitsListPaginationPages(
        productState.pagination.page,
        productState.pagination.totalPages,
      )
      : [],
    [productState.pagination],
  );
  const navigationState = useMemo<ProduitsListNavigationState | undefined>(
    () => selectedCampagne
      ? {
        campagneId: Number(selectedCampagne.value),
        campagneNom: selectedCampagne.label.replace(/ \(terminée\)$/, ''),
      }
      : undefined,
    [selectedCampagne],
  );
  const loadForScroll = productState.loadForScroll;

  useEffect(() => {
    if (!locationState?.campagneId || campagneOptions.length === 0) return;
    const option = campagneOptions.find(
      ({ value }) => Number(value) === locationState.campagneId,
    );
    if (option) queueMicrotask(() => setSelectedCampagne(option));
  }, [campagneOptions, locationState?.campagneId]);

  useEffect(() => {
    if (locationState?.highlightProductId) {
      const productId = locationState.highlightProductId;
      void loadForScroll(productId).then((found) => {
        if (found) setHighlightedProductId(productId);
      });
    }
  }, [loadForScroll, locationState?.highlightProductId]);

  const navigateBack = useCallback((): void => {
    void navigate('/operations');
  }, [navigate]);

  const navigateToNewProduct = useCallback((): void => {
    void navigate('/produits/new', { state: navigationState });
  }, [navigate, navigationState]);

  const navigateToProduct = useCallback((productId: number): void => {
    void navigate(`/produits/${productId}`, { state: navigationState });
  }, [navigate, navigationState]);

  const navigateToBaskets = useCallback((): void => {
    void navigate('/paniers');
  }, [navigate]);

  const openImportModal = useCallback((): void => setShowImportModal(true), []);
  const closeImportModal = useCallback((): void => {
    setShowImportModal(false);
    setFileInputVersion((version) => version + 1);
    importState.reset();
  }, [importState]);

  const handleImportFileChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file || !campagneId) return;
    void importState.importFile(campagneId, file, () => productState.load(1));
  }, [campagneId, importState, productState]);

  return {
    campagneId,
    campagneOptions,
    campagnesLoading,
    categorieOptions,
    categoriesTypesLoading,
    closeImportModal,
    fileInputVersion,
    handleImportFileChange,
    highlightedProductId,
    importState,
    navigateBack,
    navigateToBaskets,
    navigateToNewProduct,
    navigateToProduct,
    openImportModal,
    paginationPages,
    productRows,
    productState,
    selectedCampagne,
    setSelectedCampagne,
    showImportModal,
    typeOptions,
  };
}

export type ProduitsListViewModel = ReturnType<typeof useProduitsListView>;

export interface ProduitsImportModalViewModel {
  closeImportModal: ProduitsListViewModel['closeImportModal'];
  fileInputVersion: ProduitsListViewModel['fileInputVersion'];
  handleImportFileChange: ProduitsListViewModel['handleImportFileChange'];
  importState: Pick<
    ProduitsListViewModel['importState'],
    'error' | 'isLoading' | 'result' | 'selectedFile'
  >;
  showImportModal: ProduitsListViewModel['showImportModal'];
}
