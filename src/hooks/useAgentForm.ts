import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getEmployeByIdService,
  createEmployeService,
  updateEmployeService,
  provisionSipService,
  getPostesService,
  getRangsCommerciauxService,
} from '../API/services/user.service';
import type { Employe, Poste, RangCommercial } from '../utils/types/user.types';

interface AgentFormState {
  nom:                 string;
  prenom:              string;
  email:               string;
  telephone:           string;
  date_embauche:       string;
  id_poste:            string;
  id_rang_commercial:  string;
  password:            string;
  password_confirm:    string;
}

const INITIAL_FORM: AgentFormState = {
  nom:                '',
  prenom:             '',
  email:              '',
  telephone:          '',
  date_embauche:      '',
  id_poste:           '',
  id_rang_commercial: '',
  password:           '',
  password_confirm:   '',
};

export function useAgentForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm]                       = useState<AgentFormState>(INITIAL_FORM);
  const [existing, setExisting]               = useState<Employe | null>(null);
  const [sipUri, setSipUri]                   = useState('');
  const [postes, setPostes]                   = useState<Poste[]>([]);
  const [rangs, setRangs]                     = useState<RangCommercial[]>([]);
  const [isLoading, setIsLoading]             = useState(false);
  const [isFetching, setIsFetching]           = useState(isEdit);
  const [isProvisioningSip, setIsProvisioningSip] = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [success, setSuccess]                 = useState<string | null>(null);
  const [sipWarning, setSipWarning]           = useState<string | null>(null);

  useEffect(() => {
    getPostesService().then(setPostes).catch(() => {});
    getRangsCommerciauxService().then(setRangs).catch(() => {});
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
          id_rang_commercial: data.id_rang_commercial ? String(data.id_rang_commercial) : '',
          password:           '',
          password_confirm:   '',
        });
        setSipUri(data.sip_uri || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleProvisionSip = async () => {
    if (!id) return;
    setIsProvisioningSip(true);
    setError(null);
    setSipWarning(null);
    try {
      const { message, sip_uri } = await provisionSipService(Number(id));
      setSuccess(message);
      setExisting(prev => prev ? { ...prev, sip_uri } : prev);
      setSipUri(sip_uri);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec du provisionnement SIP');
    } finally {
      setIsProvisioningSip(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isEdit && form.password !== form.password_confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (!isEdit && form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      let agentId: number;

      if (isEdit) {
        const updateData: Record<string, string | number | null> = {};
        if (form.nom)       updateData.nom       = form.nom;
        if (form.prenom)    updateData.prenom    = form.prenom;
        if (form.email)     updateData.email     = form.email;
        if (form.telephone !== undefined) updateData.telephone = form.telephone;
        if (form.date_embauche) updateData.date_embauche = form.date_embauche;
        if (form.id_poste)  updateData.id_poste  = Number(form.id_poste);
        updateData.id_rang_commercial = form.id_rang_commercial ? Number(form.id_rang_commercial) : null;
        if (form.password)  updateData.password  = form.password;
        await updateEmployeService(Number(id), updateData);
        agentId = Number(id);
        setSuccess('Agent mis à jour avec succès.');
        setTimeout(() => navigate('/operations/employes'), 2000);
      } else {
        const result = await createEmployeService({
          nom:                form.nom,
          prenom:             form.prenom,
          password:           form.password,
          email:              form.email || undefined,
          telephone:          form.telephone || undefined,
          date_embauche:      form.date_embauche || undefined,
          id_poste:           form.id_poste ? Number(form.id_poste) : undefined,
          id_rang_commercial: form.id_rang_commercial ? Number(form.id_rang_commercial) : undefined,
        });
        agentId = (result.employe.toJSON ? result.employe.toJSON() : result.employe as unknown as Employe).id_employe;

        if (result.sip_provisioned) {
          setSuccess('Agent créé avec succès. SIP provisionné automatiquement.');
          setTimeout(() => navigate('/operations/employes'), 2000);
        } else {
          setSipWarning(`Le provisionnement SIP a échoué : ${result.sip_error ?? 'erreur inconnue'}. Cliquez sur "Provisionner le SIP" pour réessayer.`);
          setSuccess(`Agent créé avec succès. Identifiant : ${(result.employe.toJSON ? result.employe.toJSON() : result.employe as unknown as Employe).identifiant}`);
          navigate(`/operations/employes/${agentId}`, { replace: true });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form, setForm, existing, sipUri, postes, rangs,
    isEdit, isLoading, isFetching, isProvisioningSip,
    error, success, sipWarning,
    handleChange, handleProvisionSip, handleSubmit,
  };
}
