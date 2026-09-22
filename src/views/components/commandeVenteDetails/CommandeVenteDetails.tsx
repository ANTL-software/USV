import type { ReactElement } from 'react';
import { IoArrowBack, IoEye } from 'react-icons/io5';

import { useCommandeDetails } from '../../../hooks/index.ts';
import { formatCommandeDateTime } from '../../../utils/scripts/index.ts';
import {
  BackToTop,
  Button,
  CommandeDetailsActions,
  CommandeDetailsHistories,
  CommandeDetailsSummary,
  CommandeSignedOrderEmailModal,
  Header,
  Loader,
  SubNav,
} from '../index.ts';

interface CommandeVenteDetailsProps {
  idVente: number;
  onBack: () => void;
}

export function CommandeVenteDetails({ idVente, onBack }: CommandeVenteDetailsProps): ReactElement {
  const viewModel = useCommandeDetails(idVente);

  if (viewModel.loading) {
    return (
      <div id="commandeDetails">
        <Header /><SubNav />
        <main className="commandeDetails__loading"><Loader message="Chargement de la commande..." /></main>
      </div>
    );
  }

  if (viewModel.error || !viewModel.commande) {
    return (
      <div id="commandeDetails">
        <Header /><SubNav />
        <main>
          <div className="commandeDetails__container">
            <div className="commandeDetails__header"><Button style="back" onClick={onBack}><IoArrowBack /> Retour</Button></div>
            <div className="commandeDetails__error">
              <h3>Erreur de chargement</h3>
              <p>{viewModel.error || 'Commande introuvable'}</p>
              <Button style="gradient" onClick={onBack}>Retour aux commandes</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { commande, statusPresentation } = viewModel;

  return (
    <div id="commandeDetails">
      <Header />
      <SubNav />
      <main>
        <div className="commandeDetails__container">
          <div className="commandeDetails__header">
            <Button style="back" onClick={onBack}><IoArrowBack /> Retour</Button>
            <h2>Commande {commande.reference_doc ?? `#${commande.id_vente}`}</h2>
            {statusPresentation && (
              <span className={`statut-badge statut-badge--${commande.statut_vente}`} style={{ backgroundColor: statusPresentation.color }}>
                {statusPresentation.label}
              </span>
            )}
            {commande.bon_commande_signe_consulte_at && <span className="commandeDetails__email-open" title="Consultation du mail par notre client détectée lors du chargement de l’e-mail"><IoEye /> Consultation du mail par notre client détectée le {formatCommandeDateTime(commande.bon_commande_signe_consulte_at)}</span>}
          </div>
          <div className="commandeDetails__content">
            <div className="commandeDetails__left">
              <CommandeDetailsSummary viewModel={viewModel} />
              <CommandeDetailsHistories viewModel={viewModel} />
            </div>
            <CommandeDetailsActions viewModel={viewModel} />
          </div>
        </div>
      </main>
      <CommandeSignedOrderEmailModal viewModel={viewModel} />
      <BackToTop />
    </div>
  );
}
