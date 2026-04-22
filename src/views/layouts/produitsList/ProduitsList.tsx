// styles
import './produitsList.scss';

// hooks | library
import { ReactElement, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoPencil, IoTrash, IoAdd } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { useCampagnes, useCampagneProduits } from '../../../hooks/useCampagnes';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

type SelectOption = { value: string; label: string };

interface LocationState {
  campagneId?: number;
  campagneNom?: string;
}

function ProduitsList(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const { campagnes, isLoading: campagnesLoading } = useCampagnes();
  const [selectedCampagne, setSelectedCampagne] = useState<SelectOption | null>(null);

  // Restaurer la campagne sélectionnée si on revient du formulaire
  useEffect(() => {
    if (state?.campagneId && campagnes.length > 0) {
      const c = campagnes.find(c => c.id_campagne === state.campagneId);
      if (c) queueMicrotask(() => setSelectedCampagne({ value: String(c.id_campagne), label: c.nom_campagne }));
    }
  }, [state?.campagneId, campagnes]);

  const campagneId = selectedCampagne ? Number(selectedCampagne.value) : null;

  const {
    produits: campagneProduits,
    isLoading: produitsLoading,
    error: produitsError,
    removeProduit,
  } = useCampagneProduits(campagneId);

  const campagneOptions: SelectOption[] = campagnes.map(c => ({
    value: String(c.id_campagne),
    label: `${c.nom_campagne}${c.statut === 'terminee' ? ' (terminée)' : ''}`,
  }));

  const navState = selectedCampagne
    ? { campagneId: Number(selectedCampagne.value), campagneNom: selectedCampagne.label }
    : undefined;

  return (
    <div id="produitsList">
      <Header />
      <SubNav />
      <main>
        <div className="produitsList__container">
          <div className="produitsList__back">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
          </div>

          <div className="produitsList__header">
            <div>
              <h1>Produits</h1>
              <p className="produitsList__subtitle">Gérez les produits par campagne client</p>
            </div>
            <Button
              style="gradient"
              onClick={() => navigate('/produits/new', { state: navState })}
              disabled={!selectedCampagne}
            >
              <IoAdd /> Nouveau produit
            </Button>
          </div>

          <div className="produitsList__campagne-select">
            <label className="produitsList__label">Campagne</label>
            <Select
              value={selectedCampagne}
              onChange={opt => setSelectedCampagne(opt)}
              options={campagneOptions}
              isLoading={campagnesLoading}
              isClearable
              placeholder="— Sélectionner une campagne —"
              noOptionsMessage={() => 'Aucune campagne'}
              classNamePrefix="reactSelect"
            />
          </div>

          {!selectedCampagne ? (
            <div className="produitsList__empty">Sélectionnez une campagne pour voir ses produits.</div>
          ) : produitsError ? (
            <div className="produitsList__error">{produitsError}</div>
          ) : produitsLoading ? (
            <div className="produitsList__loading">Chargement...</div>
          ) : campagneProduits.length === 0 ? (
            <div className="produitsList__empty">Aucun produit pour cette campagne.</div>
          ) : (
            <div className="produitsList__table-wrapper">
              <table className="produitsList__table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Disponible</th>
                    <th>Argumentaire</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campagneProduits.map(cp => {
                    const nomProduit = cp.produit?.nom_produit ?? `Produit #${cp.id_produit}`;
                    const prix = cp.produit?.prix_unitaire;

                    return (
                      <tr key={cp.id_campagne_produit}>
                        <td>
                          <span className="produitsList__nom">{nomProduit}</span>
                          {cp.produit?.code_produit && (
                            <span className="produitsList__code">{cp.produit.code_produit}</span>
                          )}
                        </td>
                        <td>{cp.produit?.categorie?.nom_categorie || '—'}</td>
                        <td>
                          {prix != null
                            ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(prix)
                            : '—'}
                        </td>
                        <td>
                          <span className={`produitsList__badge produitsList__badge--${cp.disponible ? 'actif' : 'inactif'}`}>
                            {cp.disponible ? 'Oui' : 'Non'}
                          </span>
                        </td>
                        <td className="produitsList__argumentaire-cell">
                          {cp.argumentaire
                            ? <span className="produitsList__argumentaire-preview">{cp.argumentaire}</span>
                            : <em className="produitsList__argumentaire-empty">—</em>}
                        </td>
                        <td>
                          <div className="produitsList__actions">
                            <button
                              className="produitsList__btn-edit"
                              title="Modifier"
                              onClick={() => navigate(`/produits/${cp.id_produit}`, { state: navState })}
                            >
                              <IoPencil />
                            </button>
                            <button
                              className="produitsList__btn-delete"
                              title="Retirer de la campagne"
                              onClick={() => removeProduit(cp.id_produit, nomProduit)}
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
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const ProduitsListWithAuth = WithAuth(ProduitsList);
export default ProduitsListWithAuth;
