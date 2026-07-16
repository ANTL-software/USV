import type {
  AppelsParHeure,
  TauxAbouti,
  DureeMoyenneParJour,
  RaisonEchec
} from '../types/graphiques.types';
import type { SupervisionExportData } from '../types/graphiques.types.ts';

class CsvService {
  private static instance: CsvService;

  private constructor() {}

  public static getInstance(): CsvService {
    if (!CsvService.instance) {
      CsvService.instance = new CsvService();
    }
    return CsvService.instance;
  }

  /**
   * Convertit un tableau d'objets en CSV
   */
  private arrayToCsv<T extends Record<string, unknown>>(data: T[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * Génère le CSV des appels par heure
   */
  private generateAppelsParHeureCsv(data: AppelsParHeure[]): string {
    const csvData = data.map((item) => ({
      Heure: `${item.heure}h`,
      'Nombre d\'appels': item.nb_appels
    }));
    return this.arrayToCsv(csvData);
  }

  /**
   * Génère le CSV du taux d'abouti
   */
  private generateTauxAboutiCsv(data: TauxAbouti): string {
    const csvData = [
      {
        Type: 'Appels aboutis',
        Nombre: data.aboutis
      },
      {
        Type: 'Appels non aboutis',
        Nombre: data.non_aboutis
      },
      {
        Type: 'Taux d\'abouti (%)',
        Valeur: data.taux_abouti.toFixed(1).replace('.', ',')
      }
    ];
    return this.arrayToCsv(csvData);
  }

  /**
   * Génère le CSV de la durée moyenne par jour
   */
  private generateDureeMoyenneCsv(data: DureeMoyenneParJour[]): string {
    const csvData = data.map((item) => ({
      Date: new Date(item.date).toLocaleDateString('fr-FR'),
      'Durée moyenne (secondes)': item.duree_moyenne.toFixed(1).replace('.', ','),
      'Durée moyenne (HH:MM:SS)': this.formatDuration(item.duree_moyenne)
    }));
    return this.arrayToCsv(csvData);
  }

  /**
   * Génère le CSV des top raisons d'échec
   */
  private generateTopRaisonsCsv(data: RaisonEchec[]): string {
    const csvData = data.map((item, index) => ({
      Rang: index + 1,
      Raison: item.raison,
      Nombre: item.nombre
    }));
    return this.arrayToCsv(csvData);
  }

  /**
   * Formate une durée en secondes au format HH:MM:SS
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /**
   * Génère le nom de fichier avec timestamp
   */
  private generateFileName(prefix: string): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `${prefix}_${dateStr}_${timeStr}.csv`;
  }

  /**
   * Télécharge un fichier CSV
   */
  private downloadCsv(csvContent: string, filename: string): void {
    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Exporte toutes les données de supervision en CSV
   */
  public exportSupervisionData(data: SupervisionExportData): void {
    const sections: string[] = [];

    sections.push('=== RAPPORT DE SUPERVISION ===');
    sections.push(`Généré le: ${new Date().toLocaleString('fr-FR')}`);
    sections.push('');

    if (data.campagne) {
      sections.push(`Campagne: ${data.campagne}`);
    }
    if (data.dateDebut) {
      sections.push(`Date début: ${new Date(data.dateDebut).toLocaleDateString('fr-FR')}`);
    }
    if (data.dateFin) {
      sections.push(`Date fin: ${new Date(data.dateFin).toLocaleDateString('fr-FR')}`);
    }
    sections.push('');
    sections.push('');

    sections.push('=== APPELS PAR HEURE ===');
    sections.push(this.generateAppelsParHeureCsv(data.stats.appelsParHeure));
    sections.push('');

    sections.push('=== TAUX D\'ABOUTI ===');
    sections.push(this.generateTauxAboutiCsv(data.stats.tauxAbouti));
    sections.push('');

    sections.push('=== DURÉE MOYENNE PAR JOUR ===');
    sections.push(this.generateDureeMoyenneCsv(data.stats.dureeMoyenne7j));
    sections.push('');

    sections.push('=== TOP 5 RAISONS D\'ÉCHEC ===');
    sections.push(this.generateTopRaisonsCsv(data.stats.topRaisons));

    const csvContent = sections.join('\n');
    const filename = this.generateFileName('supervision');
    this.downloadCsv(csvContent, filename);
  }

  /**
   * Exporte uniquement les appels par heure
   */
  public exportAppelsParHeure(data: AppelsParHeure[]): void {
    const csvContent = this.generateAppelsParHeureCsv(data);
    const filename = this.generateFileName('appels_par_heure');
    this.downloadCsv(csvContent, filename);
  }

  /**
   * Exporte uniquement le taux d'abouti
   */
  public exportTauxAbouti(data: TauxAbouti): void {
    const csvContent = this.generateTauxAboutiCsv(data);
    const filename = this.generateFileName('taux_abouti');
    this.downloadCsv(csvContent, filename);
  }

  /**
   * Exporte uniquement la durée moyenne
   */
  public exportDureeMoyenne(data: DureeMoyenneParJour[]): void {
    const csvContent = this.generateDureeMoyenneCsv(data);
    const filename = this.generateFileName('duree_moyenne');
    this.downloadCsv(csvContent, filename);
  }

  /**
   * Exporte uniquement les top raisons
   */
  public exportTopRaisons(data: RaisonEchec[]): void {
    const csvContent = this.generateTopRaisonsCsv(data);
    const filename = this.generateFileName('top_raisons');
    this.downloadCsv(csvContent, filename);
  }
}

export const csvService = CsvService.getInstance();
