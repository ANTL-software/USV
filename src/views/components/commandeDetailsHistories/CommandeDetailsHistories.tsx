import type { ReactElement } from 'react';
import { IoCall, IoCart, IoChevronDown, IoChevronForward } from 'react-icons/io5';

import type { useCommandeDetails } from '../../../hooks/index.ts';
import { Loader } from '../index.ts';

type CommandeDetailsViewModel = ReturnType<typeof useCommandeDetails>;

interface CommandeDetailsHistoriesProps {
  viewModel: CommandeDetailsViewModel;
}

export function CommandeDetailsHistories({ viewModel }: CommandeDetailsHistoriesProps): ReactElement {
  const {
    appelsError,
    appelsLoading,
    appelsPage,
    appelsTotal,
    appelsTotalPages,
    callRows,
    expandedVenteId,
    loadAppels,
    previousCommandeRows,
    setExpandedVenteId,
    ventesError,
    ventesLoading,
  } = viewModel;

  return (
    <>
      <section className="details-section card-style">
        <h3 className="section-title"><IoCall /> Historique des appels ({appelsTotal})</h3>
        {appelsLoading && <Loader message="Chargement des appels..." />}
        {appelsError && <p className="history-error">{appelsError}</p>}
        {!appelsLoading && !appelsError && callRows.length === 0 && (
          <p className="history-empty">Aucun appel enregistré pour ce prospect.</p>
        )}
        {!appelsLoading && !appelsError && callRows.length > 0 && (
          <div className="appels-history-list">
            {callRows.map((call) => (
              <div key={call.id} className="appel-history-item">
                <div className="appel-history-header">
                  <div className="appel-history-meta"><span className="appel-history-date">{call.date}</span><span className="appel-history-time">{call.time}</span></div>
                  <span className={`appel-history-status ${call.statusClassName}`}>{call.statusLabel}</span>
                </div>
                <div className="appel-history-body">
                  <div className="appel-history-details">
                    <span><strong>Durée :</strong> {call.duration}</span>
                    {call.agentName && <span><strong>Agent :</strong> {call.agentName}</span>}
                  </div>
                  {call.notes && <p className="appel-history-notes">{call.notes}</p>}
                </div>
              </div>
            ))}
            {appelsTotalPages > 1 && (
              <div className="appels-history-pagination">
                <button className="pag-btn" onClick={() => { void loadAppels(appelsPage - 1); }} disabled={appelsPage === 1} type="button">Précédent</button>
                <span className="pag-info">Page {appelsPage} sur {appelsTotalPages}</span>
                <button className="pag-btn" onClick={() => { void loadAppels(appelsPage + 1); }} disabled={appelsPage === appelsTotalPages} type="button">Suivant</button>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="details-section card-style">
        <h3 className="section-title"><IoCart /> Commandes précédentes ({previousCommandeRows.length})</h3>
        {ventesLoading && <Loader message="Chargement des offres..." />}
        {ventesError && <p className="history-error">{ventesError}</p>}
        {!ventesLoading && !ventesError && previousCommandeRows.length === 0 && <p className="history-empty">Aucune autre commande pour ce prospect.</p>}
        {!ventesLoading && !ventesError && previousCommandeRows.length > 0 && (
          <div className="ventes-history-list">
            {previousCommandeRows.map((vente) => {
              const isExpanded = expandedVenteId === vente.id;
              return (
                <div key={vente.id} className="vente-history-item">
                  <button
                    className="vente-history-header"
                    onClick={() => setExpandedVenteId(isExpanded ? null : vente.id)}
                    type="button"
                    aria-expanded={isExpanded}
                  >
                    <span className="vente-history-info"><span className="vente-history-date">{vente.date}</span><span className="vente-history-ref">{vente.reference}</span><span className="vente-history-amount">{vente.amount}</span></span>
                    <span className="vente-history-actions"><span className="statut-badge statut-badge--mini" style={{ backgroundColor: vente.statusColor }}>{vente.statusLabel}</span><span className="expand-btn">{isExpanded ? <IoChevronDown /> : <IoChevronForward />}</span></span>
                  </button>
                  {isExpanded && (
                    <div className="vente-history-details-expanded">
                      {vente.agentName && <p className="vente-history-agent"><strong>Commercial :</strong> {vente.agentName}</p>}
                      {vente.notes && <p className="vente-history-notes"><strong>Notes :</strong> {vente.notes}</p>}
                      <div className="vente-history-products-table">
                        <table>
                          <thead><tr><th>Désignation</th><th className="cell-center">Qté</th><th className="cell-right">PU HT</th><th className="cell-right">Remise</th><th className="cell-right">Total HT</th></tr></thead>
                          <tbody>
                            {vente.products.map((product) => <tr key={product.id}><td>{product.name}</td><td className="cell-center">{product.quantity}</td><td className="cell-right">{product.unitPrice}</td><td className="cell-right">{product.discount}</td><td className="cell-right cell-bold">{product.lineTotal}</td></tr>)}
                            {vente.products.length === 0 && <tr><td colSpan={5} className="empty-table-cell compact">Aucun produit dans cette commande.</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
