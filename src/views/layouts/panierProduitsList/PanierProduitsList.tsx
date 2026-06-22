// styles
import './panierProduitsList.scss';

// hooks | library
import { ReactElement, useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoAdd, IoTrash, IoArrowUp, IoArrowDown, IoClose } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';

// hooks
import { usePanierProduits } from '../../../hooks/usePanierProduits';

// services
import {
  addProduitToPanierService,
  removeProduitFromPanierService,
  updatePanierProduitService
} from '../../../API/services/panierProduit.service';
import { getPanierByIdService } from '../../../API/services/panier.service';
import { getAllProduitsService } from '../../../API/services/produit.service';

// types
import type { Panier } from '../../../utils/types/panier.types';
import type { Produit } from '../../../utils/types/produit.types';

type SelectOption = { value: string; label: string };

function PanierProduitsList(): ReactElement {
  const navigate = useNavigate();
  const { idPanier } = useParams<{ idPanier: string }>();

  // Hook pour charger les produits du panier
  const { produits: panierProduits, isLoading: produitsLoading, error: produitsError, load } = usePanierProduits({
    panierId: idPanier ? Number(idPanier) : null
  });

  // États locaux pour le panier, tous les produits et le modal
  const [panier, setPanier] = useState<Panier | null>(null);
  const [allProduits, setAllProduits] = useState<Produit[]>([]);
  const [isLoadingPanier, setIsLoadingPanier] = useState(true);
  const [panierError, setPanierError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectOption[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const availableProductOptions: SelectOption[] = allProduits
    .filter(p => !panierProduits.some(pp => pp.id_produit === p.id_produit))
    .sort((a, b) => a.code_produit.localeCompare(b.code_produit, 'fr', { numeric: true }))
    .map(p => ({
      value: String(p.id_produit),
      label: `${p.code_produit} - ${p.nom_produit}${p.code_produit_origine ? ` - Ref. origine ${p.code_produit_origine}` : ''}`
    }));

  // Charger les infos du panier
  const loadPanier = useCallback(async () => {
    if (!idPanier) return;

    setIsLoadingPanier(true);
    setPanierError(null);

    try {
      const panierData = await getPanierByIdService(Number(idPanier));
      setPanier(panierData);
    } catch (err) {
      setPanierError(err instanceof Error ? err.message : 'Erreur chargement du panier');
    } finally {
      setIsLoadingPanier(false);
    }
  }, [idPanier]);

  // Charger tous les produits disponibles
  const loadAllProduits = useCallback(async () => {
    try {
      const produits = await getAllProduitsService({ actif: true });
      setAllProduits(produits);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    }
  }, []);

  // Charger au montage
  useEffect(() => {
    loadPanier();
    loadAllProduits();
  }, [loadPanier, loadAllProduits]);

  // Ajouter des produits au panier
  const handleAddProducts = async () => {
    if (!idPanier || selectedProducts.length === 0) return;

    setIsAdding(true);
    setPanierError(null);

    try {
      // Ajouter chaque produit sélectionné
      for (const [index, option] of selectedProducts.entries()) {
        await addProduitToPanierService(Number(idPanier), Number(option.value), {
          ordre_affichage: panierProduits.length + index
        });
      }

      // Recharger les produits du panier
      await load();

      // Fermer le modal et réinitialiser
      setShowAddModal(false);
      setSelectedProducts([]);
    } catch (err) {
      setPanierError(err instanceof Error ? err.message : 'Erreur ajout des produits');
    } finally {
      setIsAdding(false);
    }
  };

  // Retirer un produit du panier
  const handleRemoveProduct = async (panierProduitId: number, produitNom: string) => {
    if (!idPanier) return;

    if (!confirm(`Retirer "${produitNom}" de ce panier ?`)) return;

    setPanierError(null);

    try {
      // Trouver l'id_produit à partir de panierProduitId
      const panierProduit = panierProduits.find(pp => pp.id_panier_produit === panierProduitId);
      if (!panierProduit) return;

      await removeProduitFromPanierService(Number(idPanier), panierProduit.id_produit);
      await load();
    } catch (err) {
      setPanierError(err instanceof Error ? err.message : 'Erreur suppression produit');
    }
  };

  // Déplacer un produit vers le haut
  const handleMoveUp = async (panierProduitId: number, currentOrder: number) => {
    if (!idPanier || currentOrder <= 0) return;

    setPanierError(null);

    try {
      const panierProduit = panierProduits.find(pp => pp.id_panier_produit === panierProduitId);
      if (!panierProduit || panierProduit.id_produit === undefined) return;

      await updatePanierProduitService(Number(idPanier), panierProduit.id_produit, {
        ordre_affichage: currentOrder - 1
      });
      await load();
    } catch (err) {
      setPanierError(err instanceof Error ? err.message : 'Erreur mise à jour ordre');
    }
  };

  // Déplacer un produit vers le bas
  const handleMoveDown = async (panierProduitId: number, currentOrder: number) => {
    if (!idPanier || currentOrder >= panierProduits.length - 1) return;

    setPanierError(null);

    try {
      const panierProduit = panierProduits.find(pp => pp.id_panier_produit === panierProduitId);
      if (!panierProduit || panierProduit.id_produit === undefined) return;

      await updatePanierProduitService(Number(idPanier), panierProduit.id_produit, {
        ordre_affichage: currentOrder + 1
      });
      await load();
    } catch (err) {
      setPanierError(err instanceof Error ? err.message : 'Erreur mise à jour ordre');
    }
  };

  const isLoading = isLoadingPanier || produitsLoading || isAdding;
  const error = panierError || produitsError;

  // Trier les produits par ordre d'affichage
  const sortedProduits = [...panierProduits].sort((a, b) => (a.ordre_affichage || 0) - (b.ordre_affichage || 0));

  return (
    <div id="panierProduitsList">
      <Header />
      <SubNav />
      <main>
        <div className="panierProduitsList__container">
          {/* Header avec retour */}
          <div className="panierProduitsList__header">
            <Button style="back" onClick={() => navigate('/paniers')}>
              <MdArrowBack />
              <span>Retour aux paniers</span>
            </Button>
            <div>
              <h1>Produits du panier</h1>
              {panier && (
                <p className="panierProduitsList__subtitle">
                  {panier.label}
                </p>
              )}
            </div>
            <div className="panierProduitsList__actions">
              <Button
                style="gradient"
                onClick={() => setShowAddModal(true)}
              >
                <IoAdd /> Ajouter des produits
              </Button>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="panierProduitsList__error">
              {error}
              <button onClick={() => setPanierError(null)}><IoClose /></button>
            </div>
          )}

          {/* Liste des produits */}
          {isLoading ? (
            <div className="panierProduitsList__loading">
              <Loader size="large" />
              <p>Chargement...</p>
            </div>
          ) : sortedProduits.length === 0 ? (
            <div className="panierProduitsList__empty">
              <p>Ce panier ne contient aucun produit.</p>
              <Button
                style="gradient"
                onClick={() => setShowAddModal(true)}
              >
                <IoAdd /> Ajouter des produits
              </Button>
            </div>
          ) : (
            <div className="panierProduitsList__table-wrapper">
              <table className="panierProduitsList__table">
                <thead>
                  <tr>
                    <th>Ordre</th>
                    <th>Produit</th>
                    <th>Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProduits.map((produit, index) => (
                    <tr key={produit.id_panier_produit ?? produit.id_produit}>
                      <td>
                        <div className="panierProduitsList__order">
                          <button
                            className="panierProduitsList__order-btn"
                            onClick={() => handleMoveUp(produit.id_panier_produit ?? 0, produit.ordre_affichage ?? 0)}
                            disabled={index === 0}
                          >
                            <IoArrowUp />
                          </button>
                          <span>{(produit.ordre_affichage ?? 0) + 1}</span>
                          <button
                            className="panierProduitsList__order-btn"
                            onClick={() => handleMoveDown(produit.id_panier_produit ?? 0, produit.ordre_affichage ?? 0)}
                            disabled={index === sortedProduits.length - 1}
                          >
                            <IoArrowDown />
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className="panierProduitsList__nom">
                          {produit.nom_produit}
                        </span>
                      </td>
                      <td>
                        <span className="panierProduitsList__code">
                          {produit.code_produit}
                        </span>
                      </td>
                      <td>
                        <div className="panierProduitsList__actions">
                          <button
                            className="panierProduitsList__btn-remove"
                            onClick={() => handleRemoveProduct(produit.id_panier_produit ?? 0, produit.nom_produit)}
                            title="Retirer du panier"
                          >
                            <IoTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Modal d'ajout de produits */}
          {showAddModal && (
            <div className="panierProduitsList__modal-backdrop" onClick={() => setShowAddModal(false)}>
              <div className="panierProduitsList__modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="panierProduitsList__modal-header">
                  <h3>Ajouter des produits au panier</h3>
                  <button onClick={() => setShowAddModal(false)}><IoClose /></button>
                </div>

                <div className="panierProduitsList__modal-content">
                  <p className="panierProduitsList__modal-help">
                    Sélectionnez les produits à ajouter à ce panier :
                  </p>

                  <Select
                    isMulti
                    options={availableProductOptions}
                    value={selectedProducts}
                    onChange={(newValue: MultiValue<SelectOption>) => setSelectedProducts([...newValue])}
                    placeholder="Rechercher par code, référence ou nom..."
                    noOptionsMessage={() => "Aucun produit disponible"}
                    classNamePrefix="reactSelect"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    menuShouldScrollIntoView={false}
                    hideSelectedOptions={false}
                    closeMenuOnSelect={false}
                    filterOption={(option, inputValue) => {
                      const normalized = inputValue.trim().toLowerCase();
                      if (!normalized) return true;
                      return option.label.toLowerCase().includes(normalized);
                    }}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 2000 }),
                      menu: (base) => ({ ...base, zIndex: 2000 }),
                    }}
                    isClearable
                  />

                  <div className="panierProduitsList__modal-count">
                    {selectedProducts.length} produit(s) sélectionné(s)
                  </div>
                </div>

                <div className="panierProduitsList__modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedProducts([]);
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleAddProducts}
                    disabled={selectedProducts.length === 0 || isAdding}
                    className="primary"
                  >
                    {isAdding ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const PanierProduitsListWithAuth = WithAuth(PanierProduitsList);
export default PanierProduitsListWithAuth;
