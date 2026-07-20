import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useCourrier,
  useCourrierActions,
  useCourrierFieldOptions,
  useCourrierSelection,
} from './index.ts';
import {
  EMPTY_COURRIER_FILTERS,
  buildCourrierListParams,
  filterCourriers,
  getNextCourrierSortState,
  handleCourrierLoadError,
  hasActiveCourrierFilters,
  logError,
  showErrorNotification,
} from '../utils/scripts/index.ts';
import type {
  CourrierSortColumn,
  IColumnFilters,
  SortOrder,
} from '../utils/types/index.ts';

export interface CourrierTooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

const EMPTY_TOOLTIP: CourrierTooltipState = {
  visible: false,
  content: '',
  x: 0,
  y: 0,
};

export function useListeCourriersView() {
  const navigate = useNavigate();
  const {
    courriers,
    pagination,
    getAllCourriers,
    downloadCourrier,
    deleteCourrier,
    isLoading,
  } = useCourrier();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [tooltip, setTooltip] = useState<CourrierTooltipState>(EMPTY_TOOLTIP);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [sortBy, setSortBy] = useState<CourrierSortColumn | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [columnFilters, setColumnFilters] = useState<IColumnFilters>({ ...EMPTY_COURRIER_FILTERS });
  const [showFilters, setShowFilters] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);

  const kindOptions = useCourrierFieldOptions('kind');
  const departmentOptions = useCourrierFieldOptions('department');
  const emitterOptions = useCourrierFieldOptions('emitter');
  const recipientOptions = useCourrierFieldOptions('recipient');

  const loadCourriers = useCallback(async (page: number, limit = 10): Promise<void> => {
    try {
      await getAllCourriers(buildCourrierListParams(
        page,
        limit,
        { sortBy, sortOrder },
        columnFilters,
      ));
    } catch (error: unknown) {
      logError('loadCourriers', error);
      showErrorNotification(handleCourrierLoadError(error));
    }
  }, [columnFilters, getAllCourriers, sortBy, sortOrder]);

  useEffect(() => {
    const trimmedSearch = searchTerm.trim();
    if (trimmedSearch.length >= 3) {
      void loadCourriers(1, 100);
    } else if (!trimmedSearch) {
      void loadCourriers(currentPage);
    }
  }, [currentPage, loadCourriers, searchTerm]);

  useEffect(() => {
    const handleScroll = (): void => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowBackToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target;
      if (
        openActionMenu !== null
        && target instanceof Element
        && !target.closest('.actionMenuWrapper')
      ) {
        setOpenActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenu]);

  const filteredCourriers = useMemo(
    () => filterCourriers(courriers, searchTerm),
    [courriers, searchTerm],
  );
  const selection = useCourrierSelection(filteredCourriers);
  const courrierActions = useCourrierActions(
    filteredCourriers,
    downloadCourrier,
    deleteCourrier,
    loadCourriers,
    currentPage,
    selection.selected,
    selection.clear,
  );

  const handleSearchChange = useCallback((value: string): void => {
    setSearchTerm(value);
    if (!value.trim()) setCurrentPage(1);
  }, []);

  const handleSort = useCallback((column: CourrierSortColumn): void => {
    const next = getNextCourrierSortState({ sortBy, sortOrder }, column);
    setSortBy(next.sortBy);
    setSortOrder(next.sortOrder);
    setCurrentPage(1);
  }, [sortBy, sortOrder]);

  const handleFilterChange = useCallback((field: keyof IColumnFilters, value: string): void => {
    setColumnFilters((previous) => ({ ...previous, [field]: value }));
    setCurrentPage(1);
  }, []);

  const clearAllFilters = useCallback((): void => {
    setColumnFilters({ ...EMPTY_COURRIER_FILTERS });
    setCurrentPage(1);
  }, []);

  const toggleActionMenu = useCallback((courrierId: number): void => {
    setOpenActionMenu((current) => current === courrierId ? null : courrierId);
  }, []);

  const closeActionMenu = useCallback((): void => setOpenActionMenu(null), []);

  const showTooltip = useCallback((content: string, x: number, y: number): void => {
    if (content !== 'N/A' && content.length > 20) {
      setTooltip({ visible: true, content, x: x + 10, y: y - 10 });
    }
  }, []);

  const moveTooltip = useCallback((x: number, y: number): void => {
    setTooltip((current) => current.visible
      ? { ...current, x: x + 10, y: y - 10 }
      : current);
  }, []);

  const hideTooltip = useCallback((): void => setTooltip(EMPTY_TOOLTIP), []);
  const handleBackClick = useCallback((): void => {
    void navigate('/mail');
  }, [navigate]);
  const handleEdit = useCallback((courrierId: number): void => {
    void navigate(`/mail/update/${courrierId}`);
  }, [navigate]);
  const scrollToTop = useCallback((): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    columnFilters,
    courrierActions,
    currentPage,
    fieldOptions: {
      kind: kindOptions,
      department: departmentOptions,
      emitter: emitterOptions,
      recipient: recipientOptions,
    },
    filteredCourriers,
    handleBackClick,
    handleEdit,
    handleFilterChange,
    handleSearchChange,
    handleSort,
    hasActiveFilters: hasActiveCourrierFilters(columnFilters),
    hideTooltip,
    isLoading,
    moveTooltip,
    openActionMenu,
    pagination,
    searchTerm,
    selection,
    setCurrentPage,
    setShowFilters,
    showBackToTop,
    showFilters,
    showTooltip,
    sortBy,
    sortOrder,
    clearAllFilters,
    closeActionMenu,
    scrollToTop,
    toggleActionMenu,
    tooltip,
  };
}

export type ListeCourriersViewModel = ReturnType<typeof useListeCourriersView>;
