import type { ImportProduitRow } from '../types/index.ts';

function stripCsvQuotes(value: string): string {
  return value.trim().replace(/^["']|["']$/g, '');
}

export function parseProduitImportCsv(content: string): ImportProduitRow[] {
  const lines = content.trim().split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error('Le fichier CSV ne contient aucune ligne de produit');
  }

  const separator = lines[0].includes(';') ? ';' : ',';
  const rows = lines
    .slice(1)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const cells = line.split(separator).map(stripCsvQuotes);
      const parsedPrice = cells[3]
        ? Number.parseFloat(cells[3].replace(',', '.'))
        : undefined;

      return {
        code_produit_origine: cells[0] || '',
        nom_produit_origine: cells[1] || '',
        description: cells[2] || undefined,
        prix_unitaire: parsedPrice !== undefined && !Number.isNaN(parsedPrice)
          ? parsedPrice
          : undefined,
        conditionnement: cells[4] || undefined,
      };
    })
    .filter((row) => row.code_produit_origine || row.nom_produit_origine);

  if (rows.length === 0) {
    throw new Error('Aucun produit valide trouvé dans le fichier CSV');
  }

  if (rows.length > 500) {
    throw new Error("L'import est limité à 500 produits par fichier");
  }

  return rows;
}
