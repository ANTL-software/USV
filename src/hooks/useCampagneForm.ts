import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getCampagneByIdService,
  createCampagneService,
  updateCampagneService,
} from '../API/services/campagne.service';
import {
  uploadCampagneLogoService,
  deleteCampagneLogoService,
} from '../API/services/campagneLogo.service';
import type { Campagne, CreateCampagneData, UpdateCampagneData, ModePaiement } from '../utils/types/campagne.types';

interface CampagneFormState {
  nom_campagne: string;
  type_campagne: string;
  date_debut: string;
  date_fin: string;
  objectifs: string;
  budget: string;
  code_postal_maison_mere: string;
  autoriser_mobile: boolean;
  siret: string;
  tva: string;
  email_contact: string;
  adresse: string;
  footer_text: string;
  modes_paiement: string;
}

const INITIAL_FORM: CampagneFormState = {
  nom_campagne: '',
  type_campagne: '',
  date_debut: '',
  date_fin: '',
  objectifs: '',
  budget: '',
  code_postal_maison_mere: '',
  autoriser_mobile: false,
  siret: '',
  tva: '',
  email_contact: '',
  adresse: '',
  footer_text: '',
  modes_paiement: 'Prelevement,Cheque,Virement',
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

  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [logoFileName, setLogoFileName] = useState('');
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [isLogoDragging, setIsLogoDragging] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoUploadSuccess, setLogoUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const campagneId = existing?.id_campagne ?? null;

  // Charger la campagne existante si édition
  useEffect(() => {
    if (!isEdit) return;

    const load = async () => {
      try {
        const campagne = await getCampagneByIdService(Number(id));

        // Conversion des modes_paiement de JSON vers chaîne pour le form
        const modesString = campagne.modes_paiement?.join(',') || INITIAL_FORM.modes_paiement;

        setExisting(campagne);
        setForm({
          nom_campagne: campagne.nom_campagne,
          type_campagne: campagne.type_campagne || '',
          date_debut: campagne.date_debut,
          date_fin: campagne.date_fin || '',
          objectifs: campagne.objectifs || '',
          budget: campagne.budget != null ? String(campagne.budget) : '',
          code_postal_maison_mere: campagne.code_postal_maison_mere || '',
          autoriser_mobile: campagne.autoriser_mobile,
          // Champs de documentation
          siret: campagne.siret || '',
          tva: campagne.tva || '',
          email_contact: campagne.email_contact || '',
          adresse: campagne.adresse || '',
          footer_text: campagne.footer_text || '',
          modes_paiement: modesString,
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
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Gestion du select multiple pour modes_paiement
  const handleModesPaiementChange = (selectedOptions: any[]) => {
    const modes = selectedOptions.map((opt: any) => opt.value) as ModePaiement[];
    const modesString = modes.join(',');
    setForm(prev => ({ ...prev, modes_paiement: modesString }));
  };

  // Ouverture de la modale d'upload de logo
  const handleOpenLogoModal = () => {
    setIsLogoModalOpen(true);
    setLogoFileName(existing?.logo_file_name || '');
    setSelectedLogoFile(null);
    setLogoUploadError(null);
    setLogoUploadSuccess(null);
  };

  const handleCloseLogoModal = () => {
    setIsLogoModalOpen(false);
    setIsLogoDragging(false);
    setSelectedLogoFile(null);
    setLogoUploadError(null);
    setLogoUploadSuccess(null);
  };

  // Gestion de la sélection de fichier pour le logo
  const handleLogoFileSelect = (file: File) => {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (file.size > MAX_SIZE) {
      setLogoUploadError('Le fichier dépasse 2 Mo');
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLogoUploadError('Format non autorisé. PNG, JPG, WEBP uniquement.');
      return;
    }

    setSelectedLogoFile(file);
    setLogoFileName(file.name);
    setLogoUploadError(null);
  };

  const handleLogoDragOver = () => setIsLogoDragging(true);
  const handleLogoDragLeave = () => setIsLogoDragging(false);
  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsLogoDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleLogoFileSelect(file);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleLogoFileSelect(e.target.files[0]);
    }
  };

  // Upload du logo
  const handleLogoUpload = async () => {
    if (!selectedLogoFile || !logoFileName.trim() || !campagneId) return;

    setIsLogoUploading(true);
    setLogoUploadError(null);
    setLogoUploadSuccess(null);

    try {
      await uploadCampagneLogoService(campagneId, selectedLogoFile, logoFileName.trim());

      setLogoUploadSuccess('Logo uploadé avec succès !');

      setTimeout(async () => {
        handleCloseLogoModal();
        try {
          const campagne = await getCampagneByIdService(campagneId);
          if (campagne) {
            setExisting(campagne);
            setLogoFileName(campagne.logo_file_name || '');
          }
        } catch (err) {
          console.error('Erreur lors du rechargement:', err);
        }
      }, 1500);
    } catch (error) {
      setLogoUploadError(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'upload');
    } finally {
      setIsLogoUploading(false);
    }
  };

  // Suppression du logo
  const handleDeleteLogo = async () => {
    if (!campagneId || !existing?.logo_path) return;

    const confirmed = window.confirm('Êtes-vous sûr de vouloir supprimer le logo de cette campagne ?');
    if (!confirmed) return;

    try {
      await deleteCampagneLogoService(campagneId);
      setExisting(prev => prev ? { ...prev, logo_path: null, logo_file_name: null } : null);
    } catch (error) {
      alert('Impossible de supprimer le logo');
    }
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
      // Conversion de la chaîne modes_paiement vers tableau
      const modesArray = form.modes_paiement
        .split(',')
        .filter(m => m.trim())
        .map(m => m.trim() as ModePaiement);

      if (isEdit) {
        const updateData: UpdateCampagneData = {
          nom_campagne: form.nom_campagne.trim(),
          type_campagne: form.type_campagne || undefined,
          date_debut: form.date_debut,
          date_fin: form.date_fin || undefined,
          objectifs: form.objectifs || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
          code_postal_maison_mere: form.code_postal_maison_mere || undefined,
          autoriser_mobile: form.autoriser_mobile,
          // Champs de documentation
          siret: form.siret || undefined,
          tva: form.tva || undefined,
          email_contact: form.email_contact || undefined,
          adresse: form.adresse || undefined,
          footer_text: form.footer_text || undefined,
          modes_paiement: modesArray.length > 0 ? modesArray : undefined,
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
          autoriser_mobile: form.autoriser_mobile,
          // Champs de documentation
          siret: form.siret || undefined,
          tva: form.tva || undefined,
          email_contact: form.email_contact || undefined,
          adresse: form.adresse || undefined,
          footer_text: form.footer_text || undefined,
          modes_paiement: modesArray.length > 0 ? modesArray : undefined,
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
    handleModesPaiementChange,
    handleSubmit,
    // Logo management
    isLogoModalOpen,
    logoFileName,
    setLogoFileName,
    selectedLogoFile,
    setSelectedLogoFile,
    isLogoDragging,
    isLogoUploading,
    logoUploadError,
    logoUploadSuccess,
    fileInputRef,
    handleOpenLogoModal,
    handleCloseLogoModal,
    handleLogoDragOver,
    handleLogoDragLeave,
    handleLogoDrop,
    handleLogoFileChange,
    handleLogoUpload,
    handleDeleteLogo,
  };
}
