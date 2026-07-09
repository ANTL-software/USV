import { useEffect, useRef, useState } from 'react';
import {
  getAntlConfigurationService,
  updateAntlConfigurationService,
  uploadAntlConfigurationLogoService,
  deleteAntlConfigurationLogoService,
  uploadAntlConfigurationRibService,
  deleteAntlConfigurationRibService,
} from '../API/services/antlConfiguration.service';
import type { AntlConfiguration, UpdateAntlConfigurationData } from '../utils/types/antlConfiguration.types';

interface AntlConfigurationFormState {
  company_name: string;
  forme_juridique: string;
  capital_social: string;
  rcs_ville: string;
  siret: string;
  tva_intracom: string;
  email_contact: string;
  telephone: string;
  website: string;
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;
  footer_text: string;
  conditions_paiement: string;
  delai_paiement_jours: string;
  penalite_retard: string;
  option_tva_debits: boolean;
  bank_account_holder: string;
  bank_name: string;
  iban: string;
  bic: string;
}

const INITIAL_FORM: AntlConfigurationFormState = {
  company_name: 'antl',
  forme_juridique: '',
  capital_social: '',
  rcs_ville: '',
  siret: '',
  tva_intracom: '',
  email_contact: '',
  telephone: '',
  website: 'https://antl.fr',
  adresse: '',
  code_postal: '',
  ville: '',
  pays: 'France',
  footer_text: '',
  conditions_paiement: '',
  delai_paiement_jours: '',
  penalite_retard: '',
  option_tva_debits: false,
  bank_account_holder: '',
  bank_name: '',
  iban: '',
  bic: '',
};

export function useAntlConfigurationForm() {
  const [form, setForm] = useState<AntlConfigurationFormState>(INITIAL_FORM);
  const [existing, setExisting] = useState<AntlConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
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

  const [isRibModalOpen, setIsRibModalOpen] = useState(false);
  const [ribFileName, setRibFileName] = useState('');
  const [selectedRibFile, setSelectedRibFile] = useState<File | null>(null);
  const [isRibDragging, setIsRibDragging] = useState(false);
  const [isRibUploading, setIsRibUploading] = useState(false);
  const [ribUploadError, setRibUploadError] = useState<string | null>(null);
  const [ribUploadSuccess, setRibUploadSuccess] = useState<string | null>(null);
  const ribFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const configuration = await getAntlConfigurationService();
        setExisting(configuration);
        setForm({
          company_name: configuration.company_name || 'antl',
          forme_juridique: configuration.forme_juridique || '',
          capital_social: configuration.capital_social || '',
          rcs_ville: configuration.rcs_ville || '',
          siret: configuration.siret || '',
          tva_intracom: configuration.tva_intracom || '',
          email_contact: configuration.email_contact || '',
          telephone: configuration.telephone || '',
          website: configuration.website || 'https://antl.fr',
          adresse: configuration.adresse || '',
          code_postal: configuration.code_postal || '',
          ville: configuration.ville || '',
          pays: configuration.pays || 'France',
          footer_text: configuration.footer_text || '',
          conditions_paiement: configuration.conditions_paiement || '',
          delai_paiement_jours: configuration.delai_paiement_jours != null
            ? String(configuration.delai_paiement_jours)
            : '',
          penalite_retard: configuration.penalite_retard || '',
          option_tva_debits: configuration.option_tva_debits,
          bank_account_holder: configuration.bank_account_holder || '',
          bank_name: configuration.bank_name || '',
          iban: configuration.iban || '',
          bic: configuration.bic || '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      } finally {
        setIsFetching(false);
      }
    };

    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const buildPayload = (): UpdateAntlConfigurationData => ({
    company_name: form.company_name.trim() || 'antl',
    forme_juridique: form.forme_juridique.trim() || null,
    capital_social: form.capital_social.trim() || null,
    rcs_ville: form.rcs_ville.trim() || null,
    siret: form.siret.trim() || null,
    tva_intracom: form.tva_intracom.trim() || null,
    email_contact: form.email_contact.trim() || null,
    telephone: form.telephone.trim() || null,
    website: form.website.trim() || null,
    adresse: form.adresse.trim() || null,
    code_postal: form.code_postal.trim() || null,
    ville: form.ville.trim() || null,
    pays: form.pays.trim() || 'France',
    footer_text: form.footer_text.trim() || null,
    conditions_paiement: form.conditions_paiement.trim() || null,
    delai_paiement_jours: form.delai_paiement_jours.trim()
      ? Number.parseInt(form.delai_paiement_jours, 10)
      : null,
    penalite_retard: form.penalite_retard.trim() || null,
    option_tva_debits: form.option_tva_debits,
    bank_account_holder: form.bank_account_holder.trim() || null,
    bank_name: form.bank_name.trim() || null,
    iban: form.iban.trim() || null,
    bic: form.bic.trim() || null,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateAntlConfigurationService(buildPayload());
      setExisting(updated);
      setSuccess('Configuration antl mise à jour avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleLogoFileSelect = (file: File) => {
    const maxSize = 2 * 1024 * 1024;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (file.size > maxSize) {
      setLogoUploadError('Le fichier dépasse 2 Mo');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
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

  const handleLogoUpload = async () => {
    if (!selectedLogoFile || !logoFileName.trim()) {
      return;
    }

    setIsLogoUploading(true);
    setLogoUploadError(null);
    setLogoUploadSuccess(null);

    try {
      const result = await uploadAntlConfigurationLogoService(selectedLogoFile, logoFileName.trim());
      setExisting((prev) => prev ? {
        ...prev,
        logo_path: result.data.logo_path,
        logo_file_name: result.data.logo_file_name,
      } : prev);
      setLogoUploadSuccess('Logo antl uploadé avec succès !');
      setSelectedLogoFile(null);
    } catch (err) {
      setLogoUploadError(err instanceof Error ? err.message : 'Erreur lors de l\'upload du logo');
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      await deleteAntlConfigurationLogoService();
      setExisting((prev) => prev ? { ...prev, logo_path: null, logo_file_name: null } : prev);
      setSuccess('Logo antl supprimé avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du logo');
    }
  };

  const handleOpenRibModal = () => {
    setIsRibModalOpen(true);
    setRibFileName(existing?.rib_file_name || '');
    setSelectedRibFile(null);
    setRibUploadError(null);
    setRibUploadSuccess(null);
  };

  const handleCloseRibModal = () => {
    setIsRibModalOpen(false);
    setIsRibDragging(false);
    setSelectedRibFile(null);
    setRibUploadError(null);
    setRibUploadSuccess(null);
  };

  const handleRibFileSelect = (file: File) => {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];

    if (file.size > maxSize) {
      setRibUploadError('Le fichier dépasse 10 Mo');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setRibUploadError('Format non autorisé. PDF, PNG, JPG, JPEG, WEBP uniquement.');
      return;
    }

    setSelectedRibFile(file);
    setRibFileName(file.name);
    setRibUploadError(null);
  };

  const handleRibDragOver = () => setIsRibDragging(true);
  const handleRibDragLeave = () => setIsRibDragging(false);

  const handleRibDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsRibDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleRibFileSelect(file);
    }
  };

  const handleRibFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleRibFileSelect(e.target.files[0]);
    }
  };

  const handleRibUpload = async () => {
    if (!selectedRibFile || !ribFileName.trim()) {
      return;
    }

    setIsRibUploading(true);
    setRibUploadError(null);
    setRibUploadSuccess(null);

    try {
      const result = await uploadAntlConfigurationRibService(selectedRibFile, ribFileName.trim());
      setExisting((prev) => prev ? {
        ...prev,
        rib_path: result.data.rib_path,
        rib_file_name: result.data.rib_file_name,
      } : prev);
      setRibUploadSuccess('RIB numérique uploadé avec succès !');
      setSelectedRibFile(null);
    } catch (err) {
      setRibUploadError(err instanceof Error ? err.message : 'Erreur lors de l\'upload du RIB');
    } finally {
      setIsRibUploading(false);
    }
  };

  const handleDeleteRib = async () => {
    try {
      await deleteAntlConfigurationRibService();
      setExisting((prev) => prev ? { ...prev, rib_path: null, rib_file_name: null } : prev);
      setSuccess('RIB numérique supprimé avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du RIB');
    }
  };

  return {
    form,
    existing,
    isLoading,
    isFetching,
    error,
    success,
    handleChange,
    handleSubmit,
    isLogoModalOpen,
    logoFileName,
    setLogoFileName,
    selectedLogoFile,
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
    isRibModalOpen,
    ribFileName,
    setRibFileName,
    selectedRibFile,
    isRibDragging,
    isRibUploading,
    ribUploadError,
    ribUploadSuccess,
    ribFileInputRef,
    handleOpenRibModal,
    handleCloseRibModal,
    handleRibDragOver,
    handleRibDragLeave,
    handleRibDrop,
    handleRibFileChange,
    handleRibUpload,
    handleDeleteRib,
  };
}
