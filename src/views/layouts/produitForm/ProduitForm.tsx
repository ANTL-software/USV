// styles
import './produitForm.scss';
import './panierSelectComponents.scss';

// hooks | library
import { ReactElement, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import Creatable from 'react-select/creatable';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { useProduitForm } from '../../../hooks';
import { useCategories } from '../../../hooks';
import { useCampagnes } from '../../../hooks';
import { useProduitPaniers } from '../../../hooks';

// utils
import { toSelectOptions } from '../../../utils/scripts/utils';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

// composants select personnalisé
import { PanierMultiValue, PanierOption } from './PanierSelectComponents';
import type { PanierOption as PanierOptionType } from './PanierSelectComponents';

// services
import { addProduitToPanierService, removeProduitFromPanierService } from '../../../API/services/panierProduit.service';

function ProduitForm(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const {
    form, isEdit, isLoading, isFetching, error, success,
    campagneId, campagneNom, setCampagneId, setCampagneNom,
    paniers,
    handleChange, handleSelectChange, handleSubmit,
  } = useProduitForm();

  const { categories, handleCategorieChange } = useCategories();
  const { campagnes } = useCampagnes();

  // Hook pour récupérer les paniers du produit (multi-paniers)
  const { paniersDuProduit, refresh: refreshPaniers } = useProduitPaniers({
    produitId: id ? Number(id) : null
  });

  const categorieOptions = useMemo(() =>
    toSelectOptions(categories, c => c.id_categorie, c => c.nom_categorie),
    [categories]
  );

  // Options enrichies pour le select multi-paniers
  const panierOptions = useMemo(() =>
    paniers
      .filter(p => p.actif)  // Uniquement les paniers actifs
      .sort((a, b) => a.label.localeCompare(b.label))  // Ordre alphabétique
      .map(p => ({
        value: String(p.id_panier),
        label: p.label,
        isSelected: paniersDuProduit.some(pp => pp.id_panier === p.id_panier),
        panier: p
      } as PanierOptionType)),
    [paniers, paniersDuProduit]
  );

  // Valeur affichée dans le select (paniers sélectionnés)
  const selectedPaniers = useMemo(() =>
    panierOptions.filter(o => o.isSelected),
    [panierOptions]
  );

  const campagneOptions = useMemo(() =>
    toSelectOptions(
      campagnes, c => c.id_campagne, c => c.nom_campagne,
      c => c.statut !== 'terminee'
    ),
    [campagnes]
  );

  const selectedCampagneOpt = campagneId
    ? (campagneOptions.find(o => o.value === String(campagneId)) ?? (campagneNom ? { value: String(campagneId), label: campagneNom } : null))
    : null;

  // ─── Handlers pour la gestion multi-paniers ───────────────────────

  // Gérer l'ajout/retrait de produits dans les paniers
  const handlePaniersChange = useCallback(async (newValue: readonly PanierOptionType[]) => {
    if (!id) return;

    const selectedIds = new Set(newValue.map(o => Number(o.value)));
    const currentIds = new Set(paniersDuProduit.map(p => p.id_panier));

    // À ajouter
    const toAdd = panierOptions
      .filter(o => selectedIds.has(Number(o.value)) && !currentIds.has(Number(o.value)))
      .map(o => o.panier);

    // À retirer
    const toRemove = paniersDuProduit.filter(p => !selectedIds.has(p.id_panier));

    try {
      // Ajouter les nouveaux
      for (const panier of toAdd) {
        await addProduitToPanierService(panier.id_panier, Number(id), {
          ordre_affichage: 0
        });
      }

      // Retirer les anciens
      for (const panier of toRemove) {
        await removeProduitFromPanierService(panier.id_panier, Number(id));
      }

      // Rafraîchir la liste
      await refreshPaniers();
    } catch (err) {
      console.error('Erreur lors de la mise à jour des paniers:', err);
    }
  }, [id, panierOptions, paniersDuProduit, refreshPaniers]);

  // Gérer l'événement custom de la corbeille (retrait)
  useEffect(() => {
    const handleRemoveEvent = async (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      const panierId = customEvent.detail;

      if (!id) return;

      try {
        await removeProduitFromPanierService(panierId, Number(id));
        await refreshPaniers();
      } catch (err) {
        console.error('Erreur lors du retrait du panier:', err);
      }
    };

    window.addEventListener('remove-panier', handleRemoveEvent);
    return () => window.removeEventListener('remove-panier', handleRemoveEvent);
  }, [id, refreshPaniers]);

  // ────────────────────────────────────────────────────────────────

  // Préserver les informations de retour depuis location.state
  const backState = campagneId ? {
    campagneId,
    campagneNom,
    highlightProductId: isEdit && id ? Number(id) : undefined,
    returnPage: (location.state as any)?.returnPage,
    returnScrollPosition: (location.state as any)?.returnScrollPosition,
  } : undefined;

  if (isFetching) {
    return (
      <div id="produitForm">
        <Header /><SubNav />
        <main><div className="produitForm__loading">Chargement...</div></main>
      </div>
    );
  }

  return (
    <div id="produitForm">
      <Header />
      <SubNav />
      <main>
        <div className="produitForm__container">
          <div className="produitForm__back">
            <Button style="back" onClick={() => navigate('/produits', { state: backState })}>
              <MdArrowBack /><span>Retour aux produits</span>
            </Button>
          </div>

          <h1>{isEdit ? 'Modifier le produit' : 'Nouveau produit'}</h1>

          {error   && <div className="produitForm__error">{error}</div>}
          {success && <div className="produitForm__success">{success}</div>}

          <form onSubmit={handleSubmit} className="produitForm__form">
            <fieldset>
              <legend>Campagne</legend>

              {isEdit ? (
                <p className="produitForm__campagne-info">
                  {campagneNom || `Campagne #${campagneId}`}
                </p>
              ) : (
                <label>
                  Campagne *
                  <Select
                    value={selectedCampagneOpt}
                    onChange={opt => {
                      setCampagneId(opt ? Number(opt.value) : null);
                      setCampagneNom(opt?.label ?? '');
                    }}
                    options={campagneOptions}
                    isClearable
                    placeholder="— Sélectionner une campagne —"
                    noOptionsMessage={() => 'Aucune campagne active'}
                    classNamePrefix="reactSelect"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </label>
              )}
            </fieldset>

            <fieldset>
              <legend>Identification</legend>

              <div className="produitForm__row">
                <label>
                  Code produit *
                  <input
                    name="code_produit"
                    value={form.code_produit}
                    onChange={handleChange}
                    required
                    placeholder="Ex : BV-FEN-001"
                  />
                </label>

                <label>
                  Nom du produit *
                  <input
                    name="nom_produit"
                    value={form.nom_produit}
                    onChange={handleChange}
                    required
                    placeholder="Ex : Fenêtre PVC double vitrage"
                  />
                </label>
              </div>

              <div className="produitForm__row">
                <label>
                  Code fournisseur
                  <input
                    name="code_produit_origine"
                    value={form.code_produit_origine}
                    onChange={handleChange}
                    placeholder="Ex : REF-001"
                  />
                </label>

                <label>
                  Nom fournisseur
                  <input
                    name="nom_produit_origine"
                    value={form.nom_produit_origine}
                    onChange={handleChange}
                    placeholder="Ex : Stylo Bic Réf"
                  />
                </label>
              </div>

              <div className="produitForm__row">
                <label>
                  Catégorie
                  <Creatable
                    value={categorieOptions.find(o => o.value === form.id_categorie) ?? null}
                    onChange={(newValue) => handleCategorieChange(newValue, (id) => handleSelectChange('id_categorie', id))}
                    options={categorieOptions}
                    isClearable
                    placeholder="— Sélectionner ou taper une nouvelle catégorie —"
                    noOptionsMessage={() => 'Aucune catégorie'}
                    classNamePrefix="reactSelect"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </label>

                <label>
                  Type de produit
                  <input
                    name="type_produit"
                    value={form.type_produit}
                    onChange={handleChange}
                    placeholder="Ex : Menuiserie, Énergie..."
                  />
                </label>

                <label>
                  Prix unitaire (€)
                  <input
                    type="number"
                    name="prix_unitaire"
                    value={form.prix_unitaire}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </label>
              </div>

              <div className="produitForm__row">
                <label>
                  Paniers
                  <Select<PanierOptionType, true>
                    isMulti
                    value={selectedPaniers}
                    options={panierOptions}
                    onChange={handlePaniersChange}
                    isSearchable
                    placeholder="— Sélectionner des paniers —"
                    noOptionsMessage={() => 'Aucun panier'}
                    classNamePrefix="reactSelect"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    closeMenuOnSelect={false}
                    components={{
                      MultiValue: PanierMultiValue,
                      Option: PanierOption,
                    }}
                    styles={{
                      multiValue: (base) => ({ ...base, background: 'transparent', padding: 0 }),
                      multiValueLabel: (base) => ({ ...base, padding: 0 }),
                    }}
                  />
                </label>
              </div>

              <div className="produitForm__label-full">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Description du produit..."
                />
              </div>
            </fieldset>

            <fieldset>
              <legend>Caractéristiques</legend>

              <div className="produitForm__row">
                <label>
                  Format
                  <input name="format" value={form.format} onChange={handleChange} placeholder="Ex : 120x90 cm" />
                </label>
                <label>
                  Grammage
                  <input name="grammage" value={form.grammage} onChange={handleChange} placeholder="Ex : 80g/m²" />
                </label>
                <label>
                  Couleur
                  <input name="couleur" value={form.couleur} onChange={handleChange} placeholder="Ex : Blanc RAL 9016" />
                </label>
              </div>

              <div className="produitForm__row">
                <label>
                  Conditionnement
                  <input name="conditionnement" value={form.conditionnement} onChange={handleChange} placeholder="Ex : Boîte de 10" />
                </label>
                <label>
                  Quantité par lot
                  <input
                    type="number"
                    name="quantite_lot"
                    value={form.quantite_lot}
                    onChange={handleChange}
                    min="1"
                    step="1"
                    placeholder="1"
                  />
                </label>
              </div>

              <div className="produitForm__actif-row">
                <input
                  type="checkbox"
                  id="actif"
                  name="actif"
                  checked={form.actif}
                  onChange={handleChange}
                />
                <label htmlFor="actif" style={{ flexDirection: 'row', gap: '0.35em', color: 'inherit' }}>
                  Produit actif
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>Paramètres campagne</legend>

              <div className="produitForm__label-full">
                Argumentaire de vente
                <textarea
                  name="argumentaire"
                  value={form.argumentaire}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Script et arguments de vente pour ce produit dans cette campagne..."
                />
              </div>

              <div className="produitForm__row">
                <label>
                  Stock alloué
                  <input
                    type="number"
                    name="stock_alloue"
                    value={form.stock_alloue}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    placeholder="Illimité si vide"
                  />
                </label>
              </div>

              <div className="produitForm__actif-row">
                <input
                  type="checkbox"
                  id="disponible"
                  name="disponible"
                  checked={form.disponible}
                  onChange={handleChange}
                />
                <label htmlFor="disponible" style={{ flexDirection: 'row', gap: '0.35em', color: 'inherit' }}>
                  Disponible à la vente dans cette campagne
                </label>
              </div>
            </fieldset>

            <div className="produitForm__actions">
              <Button style="grey" type="button" onClick={() => navigate('/produits', { state: backState })}>Annuler</Button>
              <Button style="gradient" type="submit" disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le produit'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const ProduitFormWithAuth = WithAuth(ProduitForm);
export default ProduitFormWithAuth;
