import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getEmployeByIdService,
  getEmployeStatsService,
  createEmployeService,
  updateEmployeService,
  getPostesService,
  getPaliersPrimeService,
} from '../API/services/index.ts';
import type { Employe, EmployeStats, NiveauPrime, Poste } from '../utils/types/index.ts';
import { sanitizePhoneNumber } from '../utils/scripts/index.ts';

interface AgentFormState {
  nom:                 string;
  prenom:              string;
  email:               string;
  telephone:           string;
  date_embauche:       string;
  id_poste:            string;
  id_niveau_prime:     string;
  objectif_prime:      string;
  password:            string;
  password_confirm:    string;
  couleur:             string | null;
}

const INITIAL_FORM: AgentFormState = {
  nom:                '',
  prenom:             '',
  email:              '',
  telephone:          '',
  date_embauche:      '',
  id_poste:           '',
  id_niveau_prime:    '',
  objectif_prime:     '',
  password:           '',
  password_confirm:   '',
  couleur:            null,
};

export function useAgentForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm]                       = useState<AgentFormState>(INITIAL_FORM);
  const [existing, setExisting]               = useState<Employe | null>(null);
  const [postes, setPostes]                   = useState<Poste[]>([]);
  const [niveauxPrime, setNiveauxPrime]       = useState<NiveauPrime[]>([]);
  const [primeStats, setPrimeStats]             = useState<EmployeStats | null>(null);
  const [isLoading, setIsLoading]             = useState(false);
  const [isFetching, setIsFetching]           = useState(isEdit);
  const [isPrimeStatsLoading, setIsPrimeStatsLoading] = useState(isEdit);
  const [primeStatsError, setPrimeStatsError]   = useState<string | null>(null);
  const [error, setError]                     = useState<string | null>(null);
  const [success, setSuccess]                 = useState<string | null>(null);

  useEffect(() => {
    getPostesService().then(setPostes).catch(() => {});
    getPaliersPrimeService().then(setNiveauxPrime).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const agent = await getEmployeByIdService(Number(id));
        const data = agent.toJSON ? agent.toJSON() : agent as unknown as Employe;
        setExisting(data);
        setForm({
          nom:                data.nom || '',
          prenom:             data.prenom || '',
          email:              data.email || '',
          telephone:          data.telephone || '',
          date_embauche:      data.date_embauche || '',
          id_poste:           data.id_poste ? String(data.id_poste) : '',
          id_niveau_prime:    data.id_niveau_prime ? String(data.id_niveau_prime) : '',
          objectif_prime:     data.campagnesAssignees?.[0]?.objectif_prime
            ? String(data.campagnesAssignees[0].objectif_prime)
            : '',
          password:           '',
          password_confirm:   '',
          couleur:            data.couleur || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setIsFetching(false);
      }

      try {
        setPrimeStats(await getEmployeStatsService(Number(id)));
      } catch (err) {
        setPrimeStatsError(err instanceof Error ? err.message : 'Erreur de chargement de la jauge');
      } finally {
        setIsPrimeStatsLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!isEdit && !form.password) {
      setError('Le mot de passe est requis');
      return;
    }

    if (form.password) {
      if (!passwordRegex.test(form.password)) {
        setError('Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre');
        return;
      }
      if (form.password !== form.password_confirm) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isEdit) {
        const updateData: Record<string, string | number | null> = {};
        if (form.nom)       updateData.nom       = form.nom;
        if (form.prenom)    updateData.prenom    = form.prenom;
        if (form.email)     updateData.email     = form.email;
        if (form.telephone !== undefined) updateData.telephone = form.telephone ? sanitizePhoneNumber(form.telephone) : '';
        if (form.date_embauche) updateData.date_embauche = form.date_embauche;
        if (form.id_poste)  updateData.id_poste  = Number(form.id_poste);
        updateData.id_niveau_prime = form.id_niveau_prime ? Number(form.id_niveau_prime) : null;
        if (form.objectif_prime) updateData.objectif_prime = Number(form.objectif_prime);
        if (form.password)  updateData.password  = form.password;
        if (form.couleur)   updateData.couleur   = form.couleur;
        else updateData.couleur = null;
        await updateEmployeService(Number(id), updateData);
        setSuccess('Agent mis à jour avec succès.');
        setTimeout(() => navigate('/operations/employes'), 2000);
      } else {
        const result = await createEmployeService({
          nom:                form.nom,
          prenom:             form.prenom,
          password:           form.password,
          email:              form.email || undefined,
          telephone:          form.telephone ? sanitizePhoneNumber(form.telephone) : undefined,
          date_embauche:      form.date_embauche || undefined,
          id_poste:           form.id_poste ? Number(form.id_poste) : undefined,
          id_niveau_prime:    form.id_niveau_prime ? Number(form.id_niveau_prime) : undefined,
          couleur:            form.couleur || undefined,
        });

        setSuccess(`Agent créé avec succès. Identifiant : ${(result.employe.toJSON ? result.employe.toJSON() : result.employe as unknown as Employe).identifiant}`);
        setTimeout(() => navigate('/operations/employes'), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const activePrimeAssignment = existing?.campagnesAssignees?.[0] ?? null;
  const isCommercial = postes.find((poste) => String(poste.id_poste) === form.id_poste)?.type_poste === 'commercial';
  const primeObjectiveUnit = activePrimeAssignment?.campagne?.type_campagne === 'lead_b2b' ? 'leads' : '€';

  return {
    form, setForm, existing, postes, niveauxPrime,
    activePrimeAssignment, isCommercial, primeObjectiveUnit, primeStats,
    isEdit, isLoading, isFetching, isPrimeStatsLoading,
    error, success, primeStatsError,
    handleChange, handleSubmit,
    navigateBack: () => void navigate('/operations/employes'),
  };
}

export type AgentFormViewModel = ReturnType<typeof useAgentForm>;
