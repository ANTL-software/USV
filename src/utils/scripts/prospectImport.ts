import type { ImportProspectRow } from '../types/index.ts';

const CSV_COLUMN_MAP: Record<string, keyof ImportProspectRow> = {
  nom: 'nom', name: 'nom', last_name: 'nom', lastname: 'nom',
  prenom: 'prenom', prénom: 'prenom', first_name: 'prenom', firstname: 'prenom',
  telephone: 'telephone', téléphone: 'telephone', phone: 'telephone', tel: 'telephone',
  email: 'email', mail: 'email', courriel: 'email',
  type_prospect: 'type_prospect', type: 'type_prospect',
  raison_sociale: 'raison_sociale', raison: 'raison_sociale', société: 'raison_sociale', societe: 'raison_sociale', company: 'raison_sociale',
  adresse: 'adresse', address: 'adresse', code_postal: 'code_postal', cp: 'code_postal', zip: 'code_postal', postal: 'code_postal',
  ville: 'ville', city: 'ville', pays: 'pays', country: 'pays', notes: 'notes', note: 'notes', commentaire: 'notes', commentaires: 'notes',
  siret: 'siret', secteur: 'secteur', sector: 'secteur', region: 'region', région: 'region', civilite: 'civilite', civilité: 'civilite', titre: 'civilite', title: 'civilite',
};

export const PROSPECT_IMPORT_PREVIEW_LIMIT = 5;

export function parseProspectCsv(text: string): ImportProspectRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map((header) => header.trim().toLocaleLowerCase('fr-FR').replace(/['"]/g, ''));
  const fieldMap = headers.map((header) => CSV_COLUMN_MAP[header] ?? null);
  return lines.slice(1).filter((line) => line.trim()).map((line) => {
    const cells = line.split(separator).map((cell) => cell.trim().replace(/^["']|["']$/g, ''));
    const row: Partial<ImportProspectRow> = {};
    fieldMap.forEach((field, index) => {
      if (field && cells[index]) Object.assign(row, { [field]: cells[index] });
    });
    return row as ImportProspectRow;
  }).filter((row) => Boolean(row.nom || row.telephone));
}
