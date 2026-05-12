import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  getProduitByIdService,
  createProduitService,
  updateProduitService,
  getCampagneProduitsService,
  addProduitCampagneService,
  updateProduitCampagneService,
} from '../API/services/produit.service';
import { getAllPaniersService } from '../API/services/panier.service';
import type { CampagneProduit } from '../utils/types/produit.types';
import type { Panier } from '../utils/types/panier.types';

interface LocationState {
  campagneId?: number;
  campagneNom?: string;
}

interface ProduitFormState {
  code_produit: string;
  nom_produit: string;
  code_produit_origine: string;
  nom_produit_origine: string;
  description: string;
  id_categorie: string;
  id_panier: string;
  type_produit: string;
  format: string;
  grammage: string;
  couleur: string;
  conditionnement: string;
  quantite_lot: string;
  prix_unitaire: string;
  actif: boolean;
  argumentaire: string;
  disponible: boolean;
  stock_alloue: string;
}

const INITIAL_FORM: ProduitFormState = {
  code_produit: '',
  nom_produit: '',
  code_produit_origine: '',
  nom_produit_origine: '',
  description: '',
  id_categorie: '',
  id_panier: '',
  type_produit: '',
  format: '',
  grammage: '',
  couleur: '',
  conditionnement: '',
  quantite_lot: '',
  prix_unitaire: '',
  actif: true,
  argumentaire: '',
  disponible: true,
  stock_alloue: '',
};

export function useProduitForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const isEdit = !!id;

  const [form, setForm] = useState<ProduitFormState>(INITIAL_FORM);
  const [paniers, setPaniers] = useState<Panier[]>([]);
  const [campagneAssoc, setCampagneAssoc] = useState<CampagneProduit | null>(null);
  const [campagneId, setCampagneId] = useState<number | null>(state?.campagneId ?? null);
  const [campagneNom, setCampagneNom] = useState<string>(state?.campagneNom ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Charger les paniers
    getAllPaniersService({ actif: true })
      .then(data => setPaniers(data))
      .catch(err => console.error('Erreur chargement paniers:', err));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const produitId = Number(id);

    Promise.all([
      getProduitByIdService(produitId),
      // Si on a le campagneId en state, on charge les CampagneProduit de cette campagne
      state?.campagneId ? getCampagneProduitsService(state.campagneId) : Promise.resolve(null),
    ])
      .then(([p, campagneProduits]) => {
        setForm({
          code_produit: p.code_produit || '',
          nom_produit: p.nom_produit || '',
          code_produit_origine: p.code_produit_origine || '',
          nom_produit_origine: p.nom_produit_origine || '',
          description: p.description || '',
          id_categorie: p.id_categorie != null ? String(p.id_categorie) : '',
          id_panier: p.id_panier != null ? String(p.id_panier) : '',
          type_produit: p.type_produit || '',
          format: p.format || '',
          grammage: p.grammage || '',
          couleur: p.couleur || '',
          conditionnement: p.conditionnement || '',
          quantite_lot: p.quantite_lot != null ? String(p.quantite_lot) : '',
          prix_unitaire: p.prix_unitaire != null ? String(p.prix_unitaire) : '',
          actif: p.actif,
          argumentaire: '',
          disponible: true,
          stock_alloue: '',
        });

        if (campagneProduits) {
          const assoc = campagneProduits.find(cp => cp.id_produit === produitId) ?? null;
          setCampagneAssoc(assoc);
          if (assoc) {
            setForm(prev => ({
              ...prev,
              argumentaire: assoc.argumentaire ?? '',
              disponible: assoc.disponible,
              stock_alloue: assoc.stock_alloue != null ? String(assoc.stock_alloue) : '',
            }));
          }
        }
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
      .finally(() => setIsFetching(false));
  }, [id, isEdit, state?.campagneId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm(prev => ({ ...prev, [name]: checked !== undefined ? checked : value }));
    setError(null);
  };

  const handleSelectChange = (field: keyof ProduitFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code_produit.trim()) { setError('Le code produit est requis'); return; }
    if (!form.nom_produit.trim()) { setError('Le nom produit est requis'); return; }
    if (!isEdit && !campagneId) { setError('La campagne est requise'); return; }

    setIsLoading(true);
    setError(null);

    try {
      const produitPayload = {
        code_produit: form.code_produit.trim(),
        nom_produit: form.nom_produit.trim(),
        code_produit_origine: form.code_produit_origine.trim() || undefined,
        nom_produit_origine: form.nom_produit_origine.trim() || undefined,
        description: form.description.trim() || undefined,
        id_categorie: form.id_categorie ? Number(form.id_categorie) : null,
        id_panier: form.id_panier ? Number(form.id_panier) : null,
        type_produit: form.type_produit || undefined,
        format: form.format || undefined,
        grammage: form.grammage || undefined,
        couleur: form.couleur || undefined,
        conditionnement: form.conditionnement || undefined,
        quantite_lot: form.quantite_lot ? Number(form.quantite_lot) : null,
        prix_unitaire: form.prix_unitaire ? Number(form.prix_unitaire) : null,
        actif: form.actif,
      };

      const campagnePayload = {
        argumentaire: form.argumentaire.trim() || undefined,
        disponible: form.disponible,
        stock_alloue: form.stock_alloue ? Number(form.stock_alloue) : null,
      };

      if (isEdit) {
        await updateProduitService(Number(id), produitPayload);
        if (campagneId && campagneAssoc) {
          await updateProduitCampagneService(campagneId, Number(id), campagnePayload);
        }
        setSuccess('Produit mis à jour avec succès.');
      } else {
        const nouveau = await createProduitService(produitPayload);
        await addProduitCampagneService(campagneId!, {
          id_produit: nouveau.id_produit,
          ...campagnePayload,
        });
        setSuccess('Produit créé et associé à la campagne.');
      }

      setTimeout(() => navigate('/produits', { state: { campagneId, campagneNom, ...(isEdit && id && { highlightProductId: Number(id) }) } }), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form, isEdit, isLoading, isFetching, error, success,
    campagneId, campagneNom, setCampagneId, setCampagneNom,
    paniers,
    handleChange, handleSelectChange, handleSubmit,
  };
}
