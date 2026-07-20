import type { MouseEvent, ReactElement } from 'react';
import { useEffect, useRef } from 'react';
import { IoChevronBack, IoChevronForward, IoPencil, IoTrash } from 'react-icons/io5';

import type { ProduitsListViewModel } from '../../../hooks/index.ts';
import { Loader } from '../index.ts';

interface ProduitsListTableProps {
  viewModel: ProduitsListViewModel;
}

export function ProduitsListTable({ viewModel }: ProduitsListTableProps): ReactElement {
  const { productState } = viewModel;
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewModel.highlightedProductId) return;
    const row = tableWrapperRef.current?.querySelector<HTMLElement>(
      `[data-product-id="${viewModel.highlightedProductId}"]`,
    );
    if (!row) return;
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.add('produitsList__row-highlight');
    const timeout = window.setTimeout(
      () => row.classList.remove('produitsList__row-highlight'),
      2000,
    );
    return () => window.clearTimeout(timeout);
  }, [viewModel.highlightedProductId]);

  if (!viewModel.selectedCampagne) {
    return <div className="produitsList__empty">Sélectionnez une campagne pour voir ses produits.</div>;
  }
  if (productState.error) return <div className="produitsList__error">{productState.error}</div>;
  if (productState.isLoading) {
    return <div className="produitsList__loading"><Loader size="large" message="Chargement des produits..." /></div>;
  }
  if (viewModel.productRows.length === 0) {
    return <div className="produitsList__empty">Aucun produit pour cette campagne.</div>;
  }

  const stopAndEdit = (event: MouseEvent, productId: number): void => {
    event.stopPropagation();
    viewModel.navigateToProduct(productId);
  };
  const stopAndRemove = (event: MouseEvent, productId: number, name: string): void => {
    event.stopPropagation();
    void productState.removeProduit(productId, name);
  };

  return (
    <>
      <div className="produitsList__table-wrapper" ref={tableWrapperRef}>
        <table className="produitsList__table">
          <thead>
            <tr>
              <th>Id antl</th><th>Code produit</th><th>Nom produit</th><th>Type</th>
              <th>Conditionnement</th><th>Lot</th><th>Prix</th><th>Panier</th>
              <th>Origine (code / nom)</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {viewModel.productRows.map((row) => (
              <tr key={row.campaignProductId} data-product-id={row.productId} className="produitsList__row-clickable" onClick={() => viewModel.navigateToProduct(row.productId)}>
                <td className="produitsList__id">#{row.antlId}</td>
                <td>{row.code && <span className="produitsList__code">{row.code}</span>}</td>
                <td><span className="produitsList__nom">{row.name}</span></td>
                <td>{row.type}</td><td>{row.packaging}</td><td>{row.lot}</td><td>{row.price}</td>
                <td>{row.basket || <em className="produitsList__empty">—</em>}</td>
                <td className="produitsList__origine">
                  {row.originCode || row.originName ? (
                    <span className="produitsList__origine-info">
                      <span className="produitsList__code-origine">{row.originCode || '—'}</span>
                      {row.originName && <span className="produitsList__nom-origine">/ {row.originName}</span>}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  <div className="produitsList__actions">
                    <button className="produitsList__btn-edit" title="Modifier" onClick={(event) => stopAndEdit(event, row.productId)} type="button"><IoPencil /></button>
                    <button className="produitsList__btn-delete" title="Retirer de la campagne" onClick={(event) => stopAndRemove(event, row.productId, row.name)} type="button"><IoTrash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {productState.pagination && productState.pagination.totalPages > 1 && (
        <div className="produitsList__pagination">
          <span className="produitsList__pagination-info">
            Page {productState.pagination.page} / {productState.pagination.totalPages} ({productState.pagination.total} produits)
          </span>
          <div className="produitsList__pagination-buttons">
            <button className="produitsList__pagination-btn" onClick={() => productState.setPage(productState.pagination!.page - 1)} disabled={productState.pagination.page <= 1} title="Page précédente" type="button"><IoChevronBack /></button>
            <span className="produitsList__pagination-pages">
              {viewModel.paginationPages.map((page) => (
                <button key={page} className={`produitsList__pagination-page ${productState.pagination?.page === page ? 'active' : ''}`} onClick={() => productState.setPage(page)} type="button">{page}</button>
              ))}
            </span>
            <button className="produitsList__pagination-btn" onClick={() => productState.setPage(productState.pagination!.page + 1)} disabled={productState.pagination.page >= productState.pagination.totalPages} title="Page suivante" type="button"><IoChevronForward /></button>
          </div>
        </div>
      )}
    </>
  );
}
