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
import type {
  Campagne,
  CreateCampagneData,
  UpdateCampagneData,
  ModePaiement,
  BonCommandeInvoiceRecipient,
} from '../utils/types/campagne.types';
import { CAMPAIGN_VARIANTS, normalizeCampaignVariant } from '../utils/scripts/campaignVariants';

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
  email_bon_commande: string;
  adresse: string;
  ville: string;
  telephone: string;
  pays: string;
  footer_text: string;
  modes_paiement: string;
  invoice_company_name: string;
  invoice_siret: string;
  invoice_tva: string;
  invoice_email: string;
  invoice_address: string;
  invoice_postal_code: string;
  invoice_city: string;
  invoice_country: string;
  invoice_phone: string;
}

const PAYMENT_OPTIONS: { value: ModePaiement; label: string }[] = [
  { value: 'Prelevement', label: 'Prélèvement automatique' },
  { value: 'Cheque', label: 'Chèque bancaire' },
  { value: 'Virement', label: 'Virement bancaire' },
  { value: 'CB', label: 'Carte bancaire (par téléphone)' },
];

const INITIAL_FORM: CampagneFormState = {
  nom_campagne: '',
  type_campagne: CAMPAIGN_VARIANTS.vente,
  date_debut: '',
  date_fin: '',
  objectifs: '',
  budget: '',
  code_postal_maison_mere: '',
  autoriser_mobile: false,
  siret: '',
  tva: '',
  email_contact: '',
  email_bon_commande: '',
  adresse: '',
  ville: '',
  telephone: '',
  pays: 'France',
  footer_text: '',
  modes_paiement: 'Prelevement,Cheque,Virement',
  invoice_company_name: '',
  invoice_siret: '',
  invoice_tva: '',
  invoice_email: '',
  invoice_address: '',
  invoice_postal_code: '',
  invoice_city: '',
  invoice_country: 'France',
  invoice_phone: '',
};

const buildInvoiceRecipientForm = (recipient?: BonCommandeInvoiceRecipient | null) => ({
  invoice_company_name: recipient?.company_name || '',
  invoice_siret: recipient?.siret || '',
  invoice_tva: recipient?.tva || '',
  invoice_email: recipient?.email || '',
  invoice_address: recipient?.address || '',
  invoice_postal_code: recipient?.postal_code || '',
  invoice_city: recipient?.city || '',
  invoice_country: recipient?.country || 'France',
  invoice_phone: recipient?.phone || '',
});

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
        const modesString = Array.isArray(campagne.modes_paiement)
          ? campagne.modes_paiement.join(',')
          : INITIAL_FORM.modes_paiement;

        setExisting(campagne);
        setForm({
          nom_campagne: campagne.nom_campagne,
          type_campagne: normalizeCampaignVariant(campagne.type_campagne),
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
          email_bon_commande: campagne.email_bon_commande || '',
          adresse: campagne.adresse || '',
          ville: campagne.ville || '',
          telephone: campagne.telephone || '',
          pays: campagne.pays || 'France',
          footer_text: campagne.footer_text || '',
          modes_paiement: modesString,
          ...buildInvoiceRecipientForm(campagne.bon_commande_config?.invoice_recipient),
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
  const handleModesPaiementChange = (
    selectedOptions: ReadonlyArray<{ value: ModePaiement; label: string }> | null,
  ) => {
    const modes = (selectedOptions ?? []).map((opt) => opt.value) as ModePaiement[];
    const modesString = modes.join(',');
    setForm(prev => ({ ...prev, modes_paiement: modesString }));
  };

  const buildInvoiceRecipientPayload = (): BonCommandeInvoiceRecipient | null => {
    const payload: BonCommandeInvoiceRecipient = {
      company_name: form.invoice_company_name || null,
      siret: form.invoice_siret || null,
      tva: form.invoice_tva || null,
      email: form.invoice_email || null,
      address: form.invoice_address || null,
      postal_code: form.invoice_postal_code || null,
      city: form.invoice_city || null,
      country: form.invoice_country || null,
      phone: form.invoice_phone || null,
    };

    const hasAnyValue = Object.values(payload).some((value) => typeof value === 'string' && value.trim().length > 0);
    return hasAnyValue ? payload : null;
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
      const invoiceRecipient = buildInvoiceRecipientPayload();

      if (isEdit) {
        const updateData: UpdateCampagneData = {
          nom_campagne: form.nom_campagne.trim(),
          type_campagne: normalizeCampaignVariant(form.type_campagne),
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
          email_bon_commande: form.email_bon_commande || undefined,
          adresse: form.adresse || undefined,
          ville: form.ville || undefined,
          telephone: form.telephone || undefined,
          pays: form.pays || undefined,
          footer_text: form.footer_text || undefined,
          modes_paiement: modesArray,
          bon_commande_config: { invoice_recipient: invoiceRecipient },
        };
        await updateCampagneService(Number(id), updateData);
        setSuccess('Campagne mise à jour avec succès');
        setTimeout(() => navigate('/campagnes'), 1500);
      } else {
        const createData: CreateCampagneData = {
          nom_campagne: form.nom_campagne.trim(),
          type_campagne: normalizeCampaignVariant(form.type_campagne),
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
          email_bon_commande: form.email_bon_commande || undefined,
          adresse: form.adresse || undefined,
          ville: form.ville || undefined,
          telephone: form.telephone || undefined,
          pays: form.pays || undefined,
          footer_text: form.footer_text || undefined,
          modes_paiement: modesArray,
          bon_commande_config: { invoice_recipient: invoiceRecipient },
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
    paymentOptions: PAYMENT_OPTIONS,
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
