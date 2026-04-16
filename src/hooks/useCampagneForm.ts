import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getCampagneByIdService,
  createCampagneService,
  updateCampagneService,
} from '../API/services/campagne.service';
import type { Campagne, CreateCampagneData, UpdateCampagneData } from '../utils/types/campagne.types';

interface CampagneFormState {
  nom_campagne: string;
  type_campagne: string;
  date_debut: string;
  date_fin: string;
  objectifs: string;
  budget: string;
  code_postal_maison_mere: string;
}

const INITIAL_FORM: CampagneFormState = {
  nom_campagne: '',
  type_campagne: '',
  date_debut: '',
  date_fin: '',
  objectifs: '',
  budget: '',
  code_postal_maison_mere: '',
};

export function useCampagneForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<CampagneFormState>(INITIAL_FORM);
  const [existing, setExisting] = useState<Campagne | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const campagne = await getCampagneByIdService(Number(id));
        const data = campagne.toJSON();
        setExisting(data);
        setForm({
          nom_campagne: data.nom_campagne,
          type_campagne: data.type_campagne ?? '',
          date_debut: data.date_debut,
          date_fin: data.date_fin ?? '',
          objectifs: data.objectifs ?? '',
          budget: data.budget != null ? String(data.budget) : '',
          code_postal_maison_mere: data.code_postal_maison_mere ?? '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.nom_campagne.trim()) {
      setError('Le nom de la campagne est requis');
      return;
    }
    if (!form.date_debut) {
      setError('La date de début est requise');
      return;
    }

    setIsLoading(true);
    try {
      if (isEdit) {
        const updateData: UpdateCampagneData = {
          nom_campagne: form.nom_campagne.trim(),
          type_campagne: form.type_campagne || undefined,
          date_debut: form.date_debut,
          date_fin: form.date_fin || undefined,
          objectifs: form.objectifs || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
          code_postal_maison_mere: form.code_postal_maison_mere || undefined,
        };
        await updateCampagneService(Number(id), updateData);
        setSuccess('Campagne mise à jour avec succès');
        setTimeout(() => navigate('/campagnes'), 1500);
      } else {
        const createData: CreateCampagneData = {
          nom_campagne: form.nom_campagne.trim(),
          type_campagne: form.type_campagne || undefined,
          date_debut: form.date_debut,
          date_fin: form.date_fin || undefined,
          objectifs: form.objectifs || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
          code_postal_maison_mere: form.code_postal_maison_mere || undefined,
        };
        await createCampagneService(createData);
        setSuccess('Campagne créée avec succès');
        navigate('/campagnes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    existing,
    isEdit,
    isLoading,
    isFetching,
    error,
    success,
    handleChange,
    handleSubmit,
  };
}
