import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPosteByIdService, createPosteService, updatePosteService } from '../API/services/index.ts';
import type { PermissionRecord, Poste, TypePoste } from '../utils/types/index.ts';

interface PosteFormState {
  libelle_poste: string;
  description: string;
  salaire_base: string;
  type_poste: TypePoste | '';
  couleur: string;
  permissions: PermissionRecord;
}

const INITIAL_PERMISSIONS: PermissionRecord = {
  mail: { enabled: false },
  booking: { enabled: false },
  operations: { enabled: false },
  commercial: { enabled: false },
  incidents: { enabled: false },
  commerciaux: { enabled: false },
  projets: { enabled: false },
  'access-management': { enabled: false },
};

const INITIAL_FORM: PosteFormState = {
  libelle_poste: '',
  description: '',
  salaire_base: '',
  type_poste: '',
  couleur: '',
  permissions: INITIAL_PERMISSIONS,
};

export function usePosteForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<PosteFormState>(INITIAL_FORM);
  const [isLoading, setIsLoading]   = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    getPosteByIdService(Number(id))
      .then((p: Poste) => setForm({
        libelle_poste: p.libelle_poste || '',
        description:   p.description || '',
        salaire_base:  p.salaire_base != null ? String(p.salaire_base) : '',
        type_poste:    (p.type_poste as TypePoste) || '',
        couleur:       p.couleur || '',
        permissions:   { ...INITIAL_PERMISSIONS, ...(p.permissions as PermissionRecord || {}) },
      }))
      .catch(err => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
      .finally(() => setIsFetching(false));
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSelectChange = (field: keyof Omit<PosteFormState, 'permissions'>, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const togglePermissionSection = (sectionId: string) => {
    setForm(prev => {
      const perms = { ...prev.permissions };
      const current = perms[sectionId] || { enabled: false };
      const nextEnabled = !current.enabled;
      
      perms[sectionId] = {
        ...current,
        enabled: nextEnabled,
      };
      
      return { ...prev, permissions: perms };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.libelle_poste.trim()) { setError('Le libellé est requis'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        libelle_poste: form.libelle_poste.trim(),
        description:   form.description.trim() || undefined,
        salaire_base:  form.salaire_base ? Number(form.salaire_base) : null,
        type_poste:    (form.type_poste as TypePoste) || null,
        couleur:       form.couleur || null,
        permissions:   form.permissions,
      };
      if (isEdit) {
        await updatePosteService(Number(id), payload);
        setSuccess('Poste mis à jour avec succès.');
      } else {
        await createPosteService(payload);
        setSuccess('Poste créé avec succès.');
      }
      setTimeout(() => navigate('/operations/postes'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return { form, setForm, isEdit, isLoading, isFetching, error, success, handleChange, handleSelectChange, togglePermissionSection, handleSubmit, navigateBack: () => void navigate('/operations/postes') };
}

export type PosteFormViewModel = ReturnType<typeof usePosteForm>;
