// styles
import './produitsList.scss';

// hooks | library
import { ReactElement, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoPencil, IoTrash, IoAdd, IoCloudUpload, IoClose, IoBasketOutline, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { useCampagnes } from '../../../hooks/useCampagnes';
import { useCampagneProduitsPaginated } from '../../../hooks/useCampagneProduitsPaginated';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

type SelectOption = { value: string; label: string };

interface LocationState {
  campagneId?: number;
  campagneNom?: string;
  highlightProductId?: number;
}

function ProduitsList(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const { campagnes, isLoading: campagnesLoading } = useCampagnes();
  const [selectedCampagne, setSelectedCampagne] = useState<SelectOption | null>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import CSV states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number; errors: Array<{ ligne: number; message: string }> } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  // Restaurer la campagne depuis le state de navigation
  useEffect(() => {
    if (state?.campagneId && campagnes.length > 0) {
      const c = campagnes.find(c => c.id_campagne === state.campagneId);
      if (c) queueMicrotask(() => setSelectedCampagne({ value: String(c.id_campagne), label: c.nom_campagne }));
    }
  }, [state?.campagneId, campagnes]);

  const campagneId = selectedCampagne ? Number(selectedCampagne.value) : null;

  const {
    produits: campagneProduits,
    pagination,
    isLoading: produitsLoading,
    error: produitsError,
    search,
    setSearch,
    load: loadProduits,
    setPage,
    loadForScroll,
    removeProduit,
  } = useCampagneProduitsPaginated(campagneId, {
    tableScrollableRef: tableWrapperRef,
  });

  const navState = selectedCampagne
    ? { campagneId: Number(selectedCampagne.value), campagneNom: selectedCampagne.label }
    : undefined;

  const campagneOptions: SelectOption[] = campagnes.map(c => ({
    value: String(c.id_campagne),
    label: `${c.nom_campagne}${c.statut === 'terminee' ? ' (terminée)' : ''}`,
  }));

  // Appeler loadForScroll quand on revient avec un produit à mettre en évidence
  useEffect(() => {
    const productId = state?.highlightProductId;
    if (productId) {
      loadForScroll(productId);
    }
  }, [state?.highlightProductId, loadForScroll]);

  // Handler pour l'import CSV
  const handleImportFileChange = (campagneId: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportResult(null);
    setImportError(null);
    setImportLoading(true);

    try {
      const text = await file.text();
      const separator = text.trim().split(/\r?\n/)[0].includes(';') ? ';' : ',';
      const rows = text.trim().split(/\r?\n/).slice(1)
        .filter(line => line.trim())
        .map(line => {
          const cells = line.split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
          return {
            code_produit_origine: cells[0] || '',
            nom_produit_origine: cells[1] || '',
            description: cells[2] || undefined,
            prix_unitaire: cells[3] ? parseFloat(cells[3].replace(',', '.')) : undefined,
            conditionnement: cells[4] || undefined,
          };
        })
        .filter(row => row.code_produit_origine || row.nom_produit_origine);

      const result = await fetch(`/api/campagnes/${campagneId}/import-produits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produits: rows }),
        credentials: 'include'
      }).then(res => res.json());

      setImportResult(result);

      if (result.created > 0) {
        await loadProduits(1);
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setImportLoading(false);
    }
  };

  const handleEditProduct = (idProduit: number) => {
    navigate(`/produits/${idProduit}`, { state: navState });
  };

  return (
    <div id="produitsList">
      <Header />
      <SubNav />
      <main>
        <div className="produitsList__container">
          <div className="produitsList__back">
            <Button style="back" onClick={() => navigate("/operations")}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
          </div>

          <div className="produitsList__header">
            <div>
              <h1>Produits</h1>
              <p className="produitsList__subtitle">
                Gérez les produits par campagne client
              </p>
            </div>
            <div className="produitsList__actions">
              <Button
                style="gradient"
                onClick={() => navigate("/produits/new", { state: navState })}
                disabled={!selectedCampagne}
              >
                <IoAdd /> Nouveau produit
              </Button>
              <Button
                style="gradient"
                onClick={() => setShowImportModal(true)}
                disabled={!selectedCampagne}
              >
                <IoCloudUpload /> Import CSV
              </Button>
              <Button style="gradient" onClick={() => navigate("/paniers")}>
                <IoBasketOutline /> Paniers
              </Button>
            </div>
          </div>

          <div className="produitsList__campagne-select">
            <label className="produitsList__label">Campagne</label>
            <Select
              value={selectedCampagne}
              onChange={(opt) => setSelectedCampagne(opt)}
              options={campagneOptions}
              isLoading={campagnesLoading}
              isClearable
              placeholder="— Sélectionner une campagne —"
              noOptionsMessage={() => "Aucune campagne"}
              classNamePrefix="reactSelect"
            />
          </div>

          {selectedCampagne && (
            <div className="produitsList__search">
              <label className="produitsList__label">Recherche</label>
              <input
                type="text"
                className="produitsList__search-input"
                placeholder="Rechercher (code, nom, fournisseur...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          {!selectedCampagne ? (
            <div className="produitsList__empty">
              Sélectionnez une campagne pour voir ses produits.
            </div>
          ) : produitsError ? (
            <div className="produitsList__error">{produitsError}</div>
          ) : produitsLoading ? (
            <div className="produitsList__loading">Chargement...</div>
          ) : campagneProduits.length === 0 ? (
            <div className="produitsList__empty">
              Aucun produit pour cette campagne.
            </div>
          ) : (
            <>
              <div className="produitsList__table-wrapper" ref={tableWrapperRef}>
                <table className="produitsList__table">
                  <thead>
                    <tr>
                      <th>Id antl</th>
                      <th>Code produit</th>
                      <th>Nom produit</th>
                      <th>Type</th>
                      <th>Conditionnement</th>
                      <th>Lot</th>
                      <th>Prix</th>
                      <th>Panier</th>
                      <th>Origine (code / nom)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campagneProduits.map((cp) => {
                      const p = cp.produit;
                      const nomProduit =
                        p?.nom_produit ?? `Produit #${cp.id_produit}`;
                      const codeOrigine = p?.code_produit_origine || "—";
                      const nomOrigine = p?.nom_produit_origine || "—";

                      return (
                        <tr
                          key={cp.id_campagne_produit}
                          className="produitsList__row-clickable"
                          onClick={() => handleEditProduct(cp.id_produit)}
                        >
                          {/* Id antl */}
                          <td className="produitsList__id">
                            #{p?.id_produit || cp.id_produit}
                          </td>

                          {/* Code produit */}
                          <td>
                            {p?.code_produit && (
                              <span className="produitsList__code">
                                {p.code_produit}
                              </span>
                            )}
                          </td>

                          {/* Nom produit */}
                          <td>
                            <span className="produitsList__nom">
                              {nomProduit}
                            </span>
                          </td>

                          {/* Type */}
                          <td>{p?.type_produit || "—"}</td>

                          {/* Conditionnement */}
                          <td>{p?.conditionnement || "—"}</td>

                          {/* Lot */}
                          <td>
                            {p?.quantite_lot != null
                              ? String(p.quantite_lot)
                              : "—"}
                          </td>

                          {/* Prix */}
                          <td>
                            {p?.prix_unitaire != null
                              ? new Intl.NumberFormat("fr-FR", {
                                  style: "currency",
                                  currency: "EUR",
                                }).format(p.prix_unitaire)
                              : "—"}
                          </td>

                          {/* Panier */}
                          <td>
                            {p?.panier?.label || <em className="produitsList__empty">—</em>}
                          </td>

                          {/* Origine */}
                          <td className="produitsList__origine">
                            {codeOrigine !== "—" || nomOrigine !== "—" ? (
                              <span className="produitsList__origine-info">
                                <span className="produitsList__code-origine">
                                  {codeOrigine}
                                </span>
                                {nomOrigine !== "—" && (
                                  <span className="produitsList__nom-origine">
                                    / {nomOrigine}
                                  </span>
                                )}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="produitsList__actions">
                              <button
                                className="produitsList__btn-edit"
                                title="Modifier"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProduct(cp.id_produit);
                                }}
                              >
                                <IoPencil />
                              </button>
                              <button
                                className="produitsList__btn-delete"
                                title="Retirer de la campagne"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeProduit(cp.id_produit, nomProduit);
                                }}
                              >
                                <IoTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination classique */}
              {pagination && pagination.totalPages > 1 && (
                <div className="produitsList__pagination">
                  <span className="produitsList__pagination-info">
                    Page {pagination.page} / {pagination.totalPages} ({pagination.total} produits)
                  </span>
                  <div className="produitsList__pagination-buttons">
                    <button
                      className="produitsList__pagination-btn"
                      onClick={() => setPage(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      title="Page précédente"
                    >
                      <IoChevronBack />
                    </button>
                    <span className="produitsList__pagination-pages">
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            className={`produitsList__pagination-page ${pagination.page === pageNum ? 'active' : ''}`}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </span>
                    <button
                      className="produitsList__pagination-btn"
                      onClick={() => setPage(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      title="Page suivante"
                    >
                      <IoChevronForward />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BackToTop />

      {/* Modal d'import CSV inline */}
      {showImportModal && (
        <div
          className="produitsList__modal-backdrop"
          onClick={() => setShowImportModal(false)}
        >
          <div
            className="produitsList__modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="produitsList__modal-header">
              <h3>Importer des produits (CSV)</h3>
              <button type="button" onClick={() => setShowImportModal(false)}>
                <IoClose />
              </button>
            </div>

            {/* Content */}
            <div className="produitsList__modal-content">
              <p className="produitsList__modal-format">
                Format attendu (séparateur ; ou ,) :<br />
                <code>
                  code_produit_origine; nom_produit_origine; description;
                  prix_unitaire; conditionnement;
                </code>
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportFileChange(campagneId!)}
                style={{ display: "none" }}
              />

              <button
                className="produitsList__modal-btn-select"
                onClick={() => fileInputRef.current?.click()}
                disabled={importLoading}
              >
                {importFile ? importFile.name : "Choisir un fichier CSV"}
              </button>

              {importLoading && (
                <p className="produitsList__modal-status">
                  Import en cours... (cela peut prendre plusieurs minutes pour
                  les gros fichiers)
                </p>
              )}

              {importResult && (
                <div className="produitsList__modal-result">
                  <p className="produitsList__modal-success">
                    ✅ {importResult.created} produits créés
                  </p>
                  {importResult.skipped > 0 && (
                    <p className="produitsList__modal-warning">
                      ⚠️ {importResult.skipped} produits ignorés (déjà
                      existants)
                    </p>
                  )}
                  {importResult.errors.length > 0 && (
                    <div className="produitsList__modal-errors">
                      <p className="produitsList__modal-error">
                        ❌ {importResult.errors.length} erreurs :
                      </p>
                      <ul className="produitsList__modal-error-list">
                        {importResult.errors.map((err, idx) => (
                          <li key={idx}>
                            Ligne {err.ligne}: {err.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {importError && (
                <p className="produitsList__modal-error">{importError}</p>
              )}

              <div className="produitsList__modal-actions">
                <button type="button" onClick={() => setShowImportModal(false)}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ProduitsListWithAuth = WithAuth(ProduitsList);
export default ProduitsListWithAuth;
