import { useState, useCallback } from 'react';
import { importProspectsService } from '../API/services/prospect.service.ts';
import type { ImportProspectRow, ImportResult } from '../utils/types/prospect.types.ts';

// Colonnes CSV reconnues → champ ImportProspectRow
const CSV_COLUMN_MAP: Record<string, keyof ImportProspectRow> = {
  nom: 'nom', name: 'nom', last_name: 'nom', lastname: 'nom',
  prenom: 'prenom', prénom: 'prenom', first_name: 'prenom', firstname: 'prenom',
  telephone: 'telephone', téléphone: 'telephone', phone: 'telephone', tel: 'telephone',
  email: 'email', mail: 'email', courriel: 'email',
  type_prospect: 'type_prospect', type: 'type_prospect',
  raison_sociale: 'raison_sociale', raison: 'raison_sociale', société: 'raison_sociale', societe: 'raison_sociale', company: 'raison_sociale',
  adresse: 'adresse', address: 'adresse',
  code_postal: 'code_postal', cp: 'code_postal', zip: 'code_postal', postal: 'code_postal',
  ville: 'ville', city: 'ville',
  pays: 'pays', country: 'pays',
  notes: 'notes', note: 'notes', commentaire: 'notes', commentaires: 'notes',
  siret: 'siret',
  secteur: 'secteur', sector: 'secteur',
  region: 'region', région: 'region',
  civilite: 'civilite', civilité: 'civilite', titre: 'civilite', title: 'civilite',
};

function parseCSV(text: string): ImportProspectRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const fieldMap = headers.map(h => CSV_COLUMN_MAP[h] ?? null);

  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const cells = line.split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
      const row: Partial<ImportProspectRow> = {};
      headers.forEach((_, i) => {
        const field = fieldMap[i];
        if (field && cells[i]) {
          (row as Record<string, string>)[field] = cells[i];
        }
      });
      return row as ImportProspectRow;
    })
    .filter(r => r.nom || r.telephone);
}

export function useProspectImport() {
  const [rows, setRows] = useState<ImportProspectRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setParseError(null);
    setResult(null);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setParseError('Aucune ligne valide trouvée. Vérifiez le format du fichier (colonnes requises: nom, telephone).');
          setRows([]);
        } else {
          setRows(parsed);
        }
      } catch {
        setParseError('Erreur de lecture du fichier CSV.');
        setRows([]);
      }
    };
    reader.readAsText(file, 'UTF-8');
  }, []);

  const handleImport = useCallback(async () => {
    if (rows.length === 0) return;
    setIsImporting(true);
    setImportError(null);
    setResult(null);
    try {
      const res = await importProspectsService(rows);
      setResult(res);
      setRows([]);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setIsImporting(false);
    }
  }, [rows]);

  const reset = useCallback(() => {
    setRows([]);
    setParseError(null);
    setResult(null);
    setImportError(null);
  }, []);

  return {
    rows,
    parseError,
    isImporting,
    result,
    importError,
    handleFile,
    handleImport,
    reset,
  };
}
