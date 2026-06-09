import { ReactElement, useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  IoArrowBack, 
  IoCheckmarkCircle, 
  IoHourglass, 
  IoCloseCircle, 
  IoDocumentText, 
  IoCloudUpload, 
  IoPrint, 
  IoPerson, 
  IoBusiness, 
  IoLocation, 
  IoCart, 
  IoInformationCircle,
  IoTrash
} from 'react-icons/io5';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import WithAuth from '../../../utils/middleware/WithAuth';
import { getVenteByIdService, updateVenteStatutService, getVenteDocumentUrl } from '../../../API/services/vente.service.ts';
import { confirm, showSuccess, showError } from '../../../utils/services/alertService';
import type { VenteComplete, StatutVente } from '../../../utils/types/vente.types';
import { STATUT_VENTE_LABELS, STATUT_VENTE_COLORS, MODE_PAIEMENT_LABELS } from '../../../utils/types/vente.types';
import './commandeDetails.scss';

function formatMontant(montant: string | number | undefined): string {
  if (montant === undefined) return '0,00 €';
  const num = typeof montant === 'string' ? parseFloat(montant) : montant;
  if (isNaN(num)) return '0,00 €';
  return num.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

interface MockSignedDoc {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

function CommandeDetails(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idVente = Number(id);

  const [commande, setCommande] = useState<VenteComplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mock Upload state
  const [mockDocs, setMockDocs] = useState<MockSignedDoc[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCommande = useCallback(async () => {
    if (isNaN(idVente)) {
      setError('ID de commande invalide');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getVenteByIdService(idVente);
      setCommande(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Impossible de récupérer la commande');
    } finally {
      setLoading(false);
    }
  }, [idVente]);

  useEffect(() => {
    loadCommande();
  }, [loadCommande]);

  const handleStatusChange = useCallback(async (targetStatus: StatutVente) => {
    if (!commande) return;

    const label = STATUT_VENTE_LABELS[targetStatus];
    const confirmed = await confirm(
      `Voulez-vous vraiment changer le statut de la commande en "${label}" ?`,
      "Changement de statut",
      "Confirmer",
      "Annuler"
    );
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await updateVenteStatutService(commande.id_vente, targetStatus, commande.mode_paiement);
      await showSuccess(`Statut mis à jour : ${label}`, 'Succès');
      // Recharger la commande pour refléter les changements
      await loadCommande();
    } catch (err) {
      console.error(err);
      await showError(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
    } finally {
      setIsUpdating(false);
    }
  }, [commande, loadCommande]);

  const handlePrint = useCallback(() => {
    if (!commande) return;
    const url = getVenteDocumentUrl(commande.id_vente);
    window.open(url, '_blank');
  }, [commande]);

  // Mock Upload logic
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (commande?.statut_vente === 'validee') {
      setDragging(true);
    }
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const simulateUpload = (fileName: string, fileSize: number) => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc: MockSignedDoc = {
              id: Math.random().toString(36).substring(2, 9),
              name: fileName,
              size: fileSize,
              uploadedAt: new Date().toISOString()
            };
            setMockDocs(prevDocs => [...prevDocs, newDoc]);
            setUploadProgress(null);
            showSuccess('Le bon de commande signé a été simulé avec succès.', 'Upload réussi');
          }, 400);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (commande?.statut_vente !== 'validee') return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        simulateUpload(file.name, file.size);
      } else {
        showError('Format non supporté. Veuillez déposer un fichier PDF ou une Image.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (commande?.statut_vente !== 'validee') return;
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      simulateUpload(file.name, file.size);
    }
  };

  const handleDeleteMockDoc = (docId: string) => {
    confirm('Voulez-vous supprimer ce document signé ?', 'Suppression de document').then(confirmed => {
      if (confirmed) {
        setMockDocs(prev => prev.filter(d => d.id !== docId));
        showSuccess('Document supprimé.');
      }
    });
  };

  const prospectName = () => {
    if (!commande?.prospect) return '—';
    const parts = [];
    if (commande.prospect.nom) parts.push(commande.prospect.nom.toUpperCase());
    if (commande.prospect.prenom) parts.push(commande.prospect.prenom);
    return parts.join(' ');
  };

  const agentName = () => {
    if (!commande?.agent) return '—';
    return `${commande.agent.prenom} ${commande.agent.nom.toUpperCase()}`;
  };

  if (loading) {
    return (
      <div id="commandeDetails">
        <Header />
        <SubNav />
        <main className="commandeDetails__loading">
          <Loader message="Chargement de la commande..." />
        </main>
      </div>
    );
  }

  if (error || !commande) {
    return (
      <div id="commandeDetails">
        <Header />
        <SubNav />
        <main>
          <div className="commandeDetails__container">
            <div className="commandeDetails__header">
              <Button style="back" onClick={() => navigate('/operations/commandes')}>
                <IoArrowBack /> Retour
              </Button>
            </div>
            <div className="commandeDetails__error">
              <h3>Erreur de chargement</h3>
              <p>{error || 'Commande introuvable'}</p>
              <Button style="gradient" onClick={() => navigate('/operations/commandes')}>
                Retour aux commandes
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calcul du montant total HT
  const montantTotalHT = commande.details?.reduce((sum, det) => sum + parseFloat(det.montant_ligne || '0'), 0) || 0;

  return (
    <div id="commandeDetails">
      <Header />
      <SubNav />
      <main>
        <div className="commandeDetails__container">
          {/* Header */}
          <div className="commandeDetails__header">
            <Button style="back" onClick={() => navigate('/operations/commandes')}>
              <IoArrowBack /> Retour
            </Button>
            <h2>Commande {commande.reference_doc ?? `#${commande.id_vente}`}</h2>
            <span 
              className={`statut-badge statut-badge--${commande.statut_vente}`}
              style={{ backgroundColor: STATUT_VENTE_COLORS[commande.statut_vente] }}
            >
              {STATUT_VENTE_LABELS[commande.statut_vente]}
            </span>
          </div>

          <div className="commandeDetails__content">
            {/* Colonne gauche - Détails */}
            <div className="commandeDetails__left">
              {/* Infos Client */}
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
                    <span className="grid-value"><IoPerson style={{ fontSize: '0.9em', marginRight: '4px' }} />{prospectName()}</span>
                  </div>
                  {commande.prospect?.telephone && (
                    <div className="grid-item">
                      <span className="grid-label">Téléphone</span>
                      <span className="grid-value">{commande.prospect.telephone}</span>
                    </div>
                  )}
                  {commande.prospect?.email && (
                    <div className="grid-item">
                      <span className="grid-label">Email</span>
                      <span className="grid-value">{commande.prospect.email}</span>
                    </div>
                  )}
                </div>

                {/* Adresses */}
                <div className="addresses-grid">
                  <div className="address-block">
                    <span className="grid-label"><IoLocation /> Adresse de Facturation</span>
                    <p className="grid-value address-text">
                      {commande.adresse_facturation || commande.prospect?.adresse_facturation || '—'}<br />
                      {commande.code_postal_facturation || commande.prospect?.code_postal || ''} {commande.ville_facturation || commande.prospect?.ville || ''}<br />
                      {commande.pays_facturation || commande.prospect?.pays || 'France'}
                    </p>
                  </div>
                  <div className="address-block">
                    <span className="grid-label"><IoLocation /> Adresse de Livraison</span>
                    <p className="grid-value address-text">
                      {commande.adresse_livraison || 'Identique à la facturation'}<br />
                      {commande.adresse_livraison ? `${commande.code_postal_livraison || ''} ${commande.ville_livraison || ''}` : ''}<br />
                      {commande.adresse_livraison ? (commande.pays_livraison || 'France') : ''}
                    </p>
                  </div>
                </div>
              </section>

              {/* Infos Commande */}
              <section className="details-section card-style">
                <h3 className="section-title"><IoInformationCircle /> Informations de la vente</h3>
                <div className="details-grid">
                  <div className="grid-item">
                    <span className="grid-label">Date de vente</span>
                    <span className="grid-value">{formatDate(commande.date_vente)}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">Commercial (Agent)</span>
                    <span className="grid-value">{agentName()}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">Campagne</span>
                    <span className="grid-value">{commande.campagne?.nom_campagne ?? '—'}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">Mode de paiement</span>
                    <span className="grid-value">
                      {commande.mode_paiement ? MODE_PAIEMENT_LABELS[commande.mode_paiement] ?? commande.mode_paiement : '—'}
                    </span>
                  </div>
                  {commande.notes && (
                    <div className="grid-item full-width">
                      <span className="grid-label">Notes de la commande</span>
                      <p className="notes-text">{commande.notes}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Produits */}
              <section className="details-section card-style">
                <h3 className="section-title"><IoCart /> Produits commandés</h3>
                <div className="products-table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Désignation</th>
                        <th style={{ textAlign: 'center' }}>Quantité</th>
                        <th style={{ textAlign: 'right' }}>Prix Unitaire</th>
                        <th style={{ textAlign: 'right' }}>Remise</th>
                        <th style={{ textAlign: 'right' }}>Total Ligne</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commande.details?.map(detail => {
                        const pu = parseFloat(detail.prix_unitaire);
                        const rem = parseFloat(detail.remise || '0');
                        const totalLigne = parseFloat(detail.montant_ligne);
                        return (
                          <tr key={detail.id_detail}>
                            <td className="code-cell">{detail.produit?.code_produit ?? '—'}</td>
                            <td className="name-cell">{detail.produit?.nom_produit ?? 'Produit inconnu'}</td>
                            <td style={{ textAlign: 'center' }}>{detail.quantite}</td>
                            <td style={{ textAlign: 'right' }}>{formatMontant(pu)}</td>
                            <td style={{ textAlign: 'right' }}>{rem > 0 ? `${formatMontant(rem)}` : '—'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatMontant(totalLigne)}</td>
                          </tr>
                        );
                      })}
                      {(!commande.details || commande.details.length === 0) && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2em' }}>Aucun produit associé à cette commande.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="order-total-block">
                  <div className="total-row">
                    <span>Total HT :</span>
                    <span>{formatMontant(montantTotalHT)}</span>
                  </div>
                  <div className="total-row total-row--grand">
                    <span>Total TTC :</span>
                    <span>{formatMontant(commande.montant_total)}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Colonne droite - Aside */}
            <aside className="commandeDetails__right">
              {/* Qualification */}
              <div className="aside-card card-style">
                <h3>Qualification</h3>
                <p className="aside-hint">Définir l'état opérationnel de la commande :</p>
                <div className="qualification-buttons">
                  <button 
                    onClick={() => handleStatusChange('validee')}
                    className={`qualif-btn qualif-btn--validee ${commande.statut_vente === 'validee' ? 'active' : ''}`}
                    disabled={isUpdating}
                  >
                    <IoCheckmarkCircle />
                    <span>Validée</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange('en_attente')}
                    className={`qualif-btn qualif-btn--attente ${commande.statut_vente === 'en_attente' ? 'active' : ''}`}
                    disabled={isUpdating}
                  >
                    <IoHourglass />
                    <span>En attente</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange('annulee')}
                    className={`qualif-btn qualif-btn--annulee ${commande.statut_vente === 'annulee' ? 'active' : ''}`}
                    disabled={isUpdating}
                  >
                    <IoCloseCircle />
                    <span>Annulée</span>
                  </button>
                </div>
              </div>

              {/* Actions & Documents */}
              <div className="aside-card card-style">
                <h3>Actions de commande</h3>
                <div className="aside-actions-list">
                  <Button 
                    style="gradient"
                    onClick={handlePrint}
                    className="action-btn-aside"
                  >
                    <IoPrint />
                    <span>Réimprimer le bon de commande</span>
                  </Button>
                </div>

                <div className="aside-divider"></div>

                {/* Bon de commande signé */}
                <h4>Bon de commande signé</h4>
                {commande.statut_vente === 'validee' ? (
                  <>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                      style={{ display: 'none' }}
                      accept=".pdf,image/*"
                    />
                    
                    <div 
                      className={`upload-zone ${dragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadProgress !== null ? (
                        <div className="upload-progress-container">
                          <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                          <span>Téléchargement... {uploadProgress}%</span>
                        </div>
                      ) : (
                        <>
                          <IoCloudUpload className="upload-icon" />
                          <p className="upload-title">Uploader le bon signé</p>
                          <span className="upload-hint">Glissez un fichier ou cliquez ici (PDF, JPG, PNG)</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="upload-zone-disabled">
                    <IoInformationCircle className="info-icon" />
                    <p>L'upload du bon signé est activé uniquement lorsque la commande est <strong>Validée</strong>.</p>
                  </div>
                )}

                {/* Liste des docs signés */}
                {mockDocs.length > 0 && (
                  <div className="signed-docs-list">
                    <h5>Fichiers liés :</h5>
                    {mockDocs.map(doc => (
                      <div key={doc.id} className="signed-doc-item">
                        <div className="doc-info">
                          <IoDocumentText className="doc-icon" />
                          <span className="doc-name" title={doc.name}>{doc.name}</span>
                          <span className="doc-size">({Math.round(doc.size / 1024)} Ko)</span>
                        </div>
                        <button 
                          className="doc-delete-btn"
                          title="Supprimer" 
                          onClick={() => handleDeleteMockDoc(doc.id)}
                        >
                          <IoTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const CommandeDetailsWithAuth = WithAuth(CommandeDetails);
export default CommandeDetailsWithAuth;
