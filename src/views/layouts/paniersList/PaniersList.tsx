// styles
import './paniersList.scss';

// hooks | library
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPencil, IoTrash, IoAdd, IoChevronDown, IoList } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { usePaniers } from '../../../hooks/usePaniers';
import { usePanierProduits } from '../../../hooks/usePanierProduits';
import type { Panier } from '../../../utils/types/panier.types';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

type SelectOption = { value: string; label: string };

const origineOptions: SelectOption[] = [
  { value: 'Campagne', label: 'Campagne' },
  { value: 'ANTL', label: 'ANTL' },
];

interface PanierFormState {
  label: string;
  origine: string;
  actif: boolean;
}

const INITIAL_FORM: PanierFormState = {
  label: '',
  origine: 'Campagne',
  actif: true,
};

function PaniersList(): ReactElement {
  const navigate = useNavigate();
  const { paniers, isLoading, error, createPanier, updatePanier, deletePanier } = usePaniers();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PanierFormState>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [expandedPanierId, setExpandedPanierId] = useState<number | null>(null);

  const {
    produits: expandedPanierProduits,
    isLoading: produitsLoading,
    error: produitsError,
  } = usePanierProduits({ panierId: expandedPanierId });

  const handleCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setFormError(null);
    setShowForm(true);
  };

  const handleEdit = (panier: Panier) => {
    setEditingId(panier.id_panier);
    setForm({
      label: panier.label,
      origine: panier.origine,
      actif: panier.actif,
    });
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      setFormError('Le label est requis');
      return;
    }

    if (editingId) {
      await updatePanier(editingId, form);
    } else {
      await createPanier(form);
    }
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm(prev => ({ ...prev, [name]: checked !== undefined ? checked : value }));
    setFormError(null);
  };

  const handleOrigineChange = (opt: SelectOption | null) => {
    setForm(prev => ({ ...prev, origine: opt?.value || 'Campagne' }));
    setFormError(null);
  };

  const handleTogglePanier = (panierId: number) => {
    if (expandedPanierId === panierId) {
      setExpandedPanierId(null);
    } else {
      setExpandedPanierId(panierId);
    }
  };

  const selectedOrigine = origineOptions.find(o => o.value === form.origine) || null;

  return (
    <div id="paniersList">
      <Header />
      <SubNav />
      <main>
        <div className="paniersList__container">
          <div className="paniersList__back">
            <Button style="back" onClick={() => navigate('/produits')}>
              <MdArrowBack />
              <span>Retour aux produits</span>
            </Button>
          </div>

          <div className="paniersList__header">
            <div>
              <h1>Paniers</h1>
              <p className="paniersList__subtitle">Gérez les paniers de produits</p>
            </div>
            <div className="paniersList__actions">
              <Button
                style="gradient"
                onClick={handleCreate}
              >
                <IoAdd /> Nouveau panier
              </Button>
            </div>
          </div>

          {showForm && (
            <div className="paniersList__form-wrapper">
              <div className="paniersList__form-card">
                <h2>{editingId ? 'Modifier le panier' : 'Nouveau panier'}</h2>
                <form onSubmit={handleSubmit} className="paniersList__form">
                  {formError && <div className="paniersList__error">{formError}</div>}

                  <label>
                    Label *
                    <input
                      name="label"
                      value={form.label}
                      onChange={handleChange}
                      required
                      placeholder="Ex : Panier Standard"
                    />
                  </label>

                  <label>
                    Origine
                    <Select
                      value={selectedOrigine}
                      onChange={handleOrigineChange}
                      options={origineOptions}
                      placeholder="— Sélectionner une origine —"
                      classNamePrefix="reactSelect"
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </label>

                  <div className="paniersList__form-actions">
                    <button type="button" onClick={() => setShowForm(false)}>
                      Annuler
                    </button>
                    <button type="submit" className="paniersList__btn-submit">
                      {editingId ? 'Mettre à jour' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {error ? (
            <div className="paniersList__error">{error}</div>
          ) : isLoading ? (
            <div className="paniersList__loading">Chargement...</div>
          ) : paniers.length === 0 ? (
            <div className="paniersList__empty">Aucun panier.</div>
          ) : (
            <div className="paniersList__dropdowns">
              {paniers.map(p => (
                <div key={p.id_panier} className="paniersList__dropdown">
                  <button
                    className="paniersList__dropdown-header"
                    onClick={() => handleTogglePanier(p.id_panier)}
                  >
                    <div className="paniersList__dropdown-info">
                      <span className="paniersList__dropdown-label">{p.label}</span>
                      <span className="paniersList__dropdown-origine">{p.origine}</span>
                      <span className={`paniersList__badge paniersList__badge--${p.actif ? 'actif' : 'inactif'}`}>
                        {p.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <div className="paniersList__dropdown-actions">
                      <IoChevronDown className={`paniersList__chevron ${expandedPanierId === p.id_panier ? 'paniersList__chevron--open' : ''}`} />
                      <button
                        className="paniersList__btn-products"
                        title="Gérer les produits"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/paniers/${p.id_panier}/produits`);
                        }}
                      >
                        <IoList />
                      </button>
                      <button
                        className="paniersList__btn-edit"
                        title="Modifier"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(p);
                        }}
                      >
                        <IoPencil />
                      </button>
                      <button
                        className="paniersList__btn-delete"
                        title="Supprimer"
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePanier(p.id_panier, p.label);
                        }}
                      >
                        <IoTrash />
                      </button>
                    </div>
                  </button>

                  {expandedPanierId === p.id_panier && (
                    <div className="paniersList__dropdown-content">
                      {produitsLoading ? (
                        <div className="paniersList__produits-loading">Chargement des produits...</div>
                      ) : produitsError ? (
                        <div className="paniersList__error">{produitsError}</div>
                      ) : expandedPanierProduits.length === 0 ? (
                        <div className="paniersList__produits-empty">Aucun produit associé à ce panier.</div>
                      ) : (
                        <div className="paniersList__produits-list">
                          {expandedPanierProduits.map(prod => (
                            <div key={prod.id_produit} className="paniersList__produit-item">
                              <div className="paniersList__produit-info">
                                <span className="paniersList__produit-nom">{prod.nom_produit}</span>
                                <span className="paniersList__produit-code">{prod.code_produit}</span>
                              </div>
                              <div className="paniersList__produit-details">
                                {prod.type_produit && <span className="paniersList__produit-type">{prod.type_produit}</span>}
                                {prod.conditionnement && <span className="paniersList__produit-conditionnement">{prod.conditionnement}</span>}
                                {prod.prix_unitaire != null && (
                                  <span className="paniersList__produit-prix">
                                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prod.prix_unitaire)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const PaniersListWithAuth = WithAuth(PaniersList);
export default PaniersListWithAuth;
