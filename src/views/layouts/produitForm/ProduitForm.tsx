// styles
import './produitForm.scss';

// hooks | library
import { ReactElement, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import Creatable from 'react-select/creatable';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { useProduitForm } from '../../../hooks';
import { useCategories } from '../../../hooks';
import { useCampagnes } from '../../../hooks';

// utils
import { toSelectOptions } from '../../../utils/scripts/utils';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

function ProduitForm(): ReactElement {
  const navigate = useNavigate();
  const {
    form, isEdit, isLoading, isFetching, error, success,
    campagneId, campagneNom, setCampagneId, setCampagneNom,
    handleChange, handleSelectChange, handleSubmit,
  } = useProduitForm();

  const { categories, handleCategorieChange } = useCategories();
  const { campagnes } = useCampagnes();

  const categorieOptions = useMemo(() =>
    toSelectOptions(categories, c => c.id_categorie, c => c.nom_categorie),
    [categories]
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

  const backState = campagneId ? { campagneId, campagneNom } : undefined;

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
