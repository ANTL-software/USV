import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocumentationService, getDocumentationViewUrlService, uploadDocumentationService } from '../API/services/index.ts';
import type { DocumentationFilters } from '../API/services/index.ts';
import type { DocumentationModel } from '../API/models/index.ts';
import { hasAccessToSubsection } from '../utils/scripts/index.ts';
import { useUserContext } from './useUserContext.ts';

const initialFilters: DocumentationFilters = { recherche: '', categorie: '', public_cible: '', date_debut: '', date_fin: '' };
const initialForm = { reference: '', titre: '', description: '', categorie: 'Procédure', mots_cles: '', public_cible: 'Tous les collaborateurs', version: '1.0', date_publication: new Date().toISOString().slice(0, 10) };

export function useDocumentationPage() {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [documents, setDocuments] = useState<DocumentationModel[]>([]);
  const [filters, setFilters] = useState<DocumentationFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isUploading, setIsUploading] = useState(false);
  const [viewer, setViewer] = useState<{ fileName: string; url: string } | null>(null);
  const canPublish = hasAccessToSubsection(user, 'documentation', 'documentation-publication');

  const load = useCallback(async (activeFilters: DocumentationFilters) => {
    setIsLoading(true); setError(null);
    try { setDocuments(await getDocumentationService(activeFilters)); }
    catch { setError('Impossible de charger la documentation.'); }
    finally { setIsLoading(false); }
  }, []);
  useEffect(() => { void load(filters); }, [filters, load]);
  const categories = useMemo(() => [...new Set(documents.map(({ categorie }) => categorie))].sort(), [documents]);
  const audiences = useMemo(() => [...new Set(documents.map(({ public_cible }) => public_cible))].sort(), [documents]);
  const openDocument = useCallback(async (document: DocumentationModel) => {
    try { setViewer({ fileName: document.titre, url: await getDocumentationViewUrlService(document.id_documentation) }); }
    catch { setError('Impossible d’ouvrir ce document.'); }
  }, []);
  const submitUpload = useCallback(async () => {
    if (!file || !form.reference.trim() || !form.titre.trim()) { setError('Le PDF, la référence et le titre sont requis.'); return; }
    setIsUploading(true); setError(null);
    try { await uploadDocumentationService(file, form); setIsUploadOpen(false); setFile(null); setForm(initialForm); await load(filters); }
    catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : 'La publication a échoué.'); }
    finally { setIsUploading(false); }
  }, [file, filters, form, load]);
  return { documents, filters, setFilters, isLoading, error, categories, audiences, canPublish, isUploadOpen, setIsUploadOpen, file, setFile, form, setForm, isUploading, submitUpload, viewer, setViewer, openDocument, navigateBack: () => void navigate('/home') };
}
export type DocumentationPageViewModel = ReturnType<typeof useDocumentationPage>;
