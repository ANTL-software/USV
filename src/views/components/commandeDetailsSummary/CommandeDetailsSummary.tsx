import type { ReactElement } from 'react';
import {
  IoBusiness,
  IoCart,
  IoInformationCircle,
  IoLocation,
  IoPerson,
} from 'react-icons/io5';

import type { useCommandeDetails } from '../../../hooks/index.ts';
import {
  formatCommandeCurrency,
  formatCommandeDateTime,
} from '../../../utils/scripts/index.ts';

type CommandeDetailsViewModel = ReturnType<typeof useCommandeDetails>;

interface CommandeDetailsSummaryProps {
  viewModel: CommandeDetailsViewModel;
}

export function CommandeDetailsSummary({ viewModel }: CommandeDetailsSummaryProps): ReactElement {
  const {
    agentName,
    billingAddress,
    commande,
    deliveryAddress,
    paymentLabel,
    productRows,
    prospectName,
    totals,
  } = viewModel;

  if (!commande || !billingAddress || !deliveryAddress) return <></>;

  return (
    <>
      <section className="details-section card-style">
        <h3 className="section-title"><IoBusiness /> Client & Contact</h3>
        <div className="details-grid">
          {commande.prospect?.raison_sociale && (
            <div className="grid-item full-width">
              <span className="grid-label">Raison Sociale</span>
              <span className="grid-value grid-value--bold">{commande.prospect.raison_sociale}</span>
            </div>
          )}
          {commande.prospect?.siret && (
            <div className="grid-item">
              <span className="grid-label">SIRET</span>
              <span className="grid-value">{commande.prospect.siret}</span>
            </div>
          )}
          <div className="grid-item">
            <span className="grid-label">Nom du Contact</span>
            <span className="grid-value"><IoPerson className="commandeDetails__contact-icon" />{prospectName}</span>
          </div>
          {commande.prospect?.telephone && (
            <div className="grid-item"><span className="grid-label">Téléphone</span><span className="grid-value">{commande.prospect.telephone}</span></div>
          )}
          {commande.prospect?.email && (
            <div className="grid-item"><span className="grid-label">Email</span><span className="grid-value">{commande.prospect.email}</span></div>
          )}
        </div>

        <div className="addresses-grid">
          {[billingAddress, deliveryAddress].map((address) => (
            <div className="address-block" key={address.title}>
              <span className="grid-label"><IoLocation /> {address.title}</span>
              <p className="grid-value address-text">
                {address.lines.map((line) => <span key={line}>{line}<br /></span>)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="details-section card-style">
        <h3 className="section-title"><IoInformationCircle /> Informations de la vente</h3>
        <div className="details-grid">
          <div className="grid-item"><span className="grid-label">Date de vente</span><span className="grid-value">{formatCommandeDateTime(commande.date_vente)}</span></div>
          <div className="grid-item"><span className="grid-label">Commercial (Agent)</span><span className="grid-value">{agentName}</span></div>
          <div className="grid-item"><span className="grid-label">Campagne</span><span className="grid-value">{commande.campagne?.nom_campagne ?? '—'}</span></div>
          <div className="grid-item"><span className="grid-label">Mode de paiement</span><span className="grid-value">{paymentLabel}</span></div>
          <div className="grid-item"><span className="grid-label">Délai de livraison</span><span className="grid-value">{commande.delais_livraison !== undefined ? `${commande.delais_livraison} semaines` : '2 semaines'}</span></div>
          <div className="grid-item"><span className="grid-label">Livraison offerte (Geste)</span><span className="grid-value">{commande.livraison_offerte ? 'Oui' : 'Non'}</span></div>
          <div className="grid-item full-width"><span className="grid-label">Plage horaire de livraison</span><span className="grid-value">{commande.plage_horaire_livraison || '—'}</span></div>
          {commande.notes && (
            <div className="grid-item full-width"><span className="grid-label">Notes de la commande</span><p className="notes-text">{commande.notes}</p></div>
          )}
        </div>
      </section>

      <section className="details-section card-style">
        <h3 className="section-title"><IoCart /> Produits commandés</h3>
        <div className="products-table-wrapper">
          <table>
            <thead><tr><th>Code</th><th>Désignation</th><th className="cell-center">Quantité</th><th className="cell-right">Prix Unitaire</th><th className="cell-right">Remise</th><th className="cell-right">Total Ligne</th></tr></thead>
            <tbody>
              {productRows.map((product) => (
                <tr key={product.id}>
                  <td className="code-cell">{product.code}</td><td className="name-cell">{product.name}</td><td className="cell-center">{product.quantity}</td><td className="cell-right">{product.unitPrice}</td><td className="cell-right">{product.discount}</td><td className="cell-right cell-bold">{product.lineTotal}</td>
                </tr>
              ))}
              {productRows.length === 0 && <tr><td colSpan={6} className="empty-table-cell">Aucun produit associé à cette commande.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="order-total-block">
          <div className="total-row"><span>Total Articles HT :</span><span>{formatCommandeCurrency(totals.montantArticlesHt)}</span></div>
          <div className="total-row"><span>Frais de livraison HT :</span><span>{totals.fraisLivraisonHt === 0 ? (totals.livraisonOfferte ? 'Offerts (Geste)' : 'Offerts') : formatCommandeCurrency(totals.fraisLivraisonHt)}</span></div>
          {totals.fraisLivraisonHt > 0 && <div className="total-row total-row--accent"><span>Total HT final :</span><span>{formatCommandeCurrency(totals.totalHt)}</span></div>}
          <div className="total-row total-row--grand"><span>Total TTC :</span><span>{formatCommandeCurrency(totals.totalTtc)}</span></div>
        </div>
      </section>
    </>
  );
}
