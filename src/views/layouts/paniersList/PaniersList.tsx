// styles
import './paniersList.scss';

// hooks | library
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPencil, IoTrash, IoAdd } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { usePaniers } from '../../../hooks/usePaniers';
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
            <div className="paniersList__table-wrapper">
              <table className="paniersList__table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Origine</th>
                    <th>Actif</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paniers.map(p => (
                    <tr key={p.id_panier}>
                      <td className="paniersList__label">{p.label}</td>
                      <td className="paniersList__origine">{p.origine}</td>
                      <td>
                        <span className={`paniersList__badge paniersList__badge--${p.actif ? 'actif' : 'inactif'}`}>
                          {p.actif ? 'Oui' : 'Non'}
                        </span>
                      </td>
                      <td>
                        <div className="paniersList__actions">
                          <button
                            className="paniersList__btn-edit"
                            title="Modifier"
                            onClick={() => handleEdit(p)}
                          >
                            <IoPencil />
                          </button>
                          <button
                            className="paniersList__btn-delete"
                            title="Supprimer"
                            onClick={() => deletePanier(p.id_panier, p.label)}
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
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const PaniersListWithAuth = WithAuth(PaniersList);
export default PaniersListWithAuth;
