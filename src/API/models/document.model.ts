import type { EmployeeDocument } from '../../utils/types/index.ts';

/**
 * Modèle pour les documents employés
 * Transformations et méthodes utilitaires
 */
export class DocumentModel implements EmployeeDocument {
  id: number;
  id_employe: number;
  name: string;
  filename: string;
  path: string;
  mime_type: string;
  size: number;
  date_created: string;
  date_updated: string | null;
  created_by: number;

  constructor(data: EmployeeDocument) {
    this.id = data.id;
    this.id_employe = data.id_employe;
    this.name = data.name;
    this.filename = data.filename;
    this.path = data.path;
    this.mime_type = data.mime_type;
    this.size = data.size;
    this.date_created = data.date_created;
    this.date_updated = data.date_updated;
    this.created_by = data.created_by;
  }

  /**
   * Formate la taille en Ko/Mo
   */
  public get formattedSize(): string {
    if (this.size < 1024) {
      return `${this.size} o`;
    } else if (this.size < 1024 * 1024) {
      return `${(this.size / 1024).toFixed(2)} Ko`;
    }
    return `${(this.size / (1024 * 1024)).toFixed(2)} Mo`;
  }

  /**
   * Retourne l'extension du fichier
   */
  public get extension(): string {
    return this.filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Vérifie si le document est une image
   */
  public get isImage(): boolean {
    return ['image/jpeg', 'image/jpg', 'image/webp'].includes(this.mime_type);
  }

  /**
   * Vérifie si le document est un PDF
   */
  public get isPdf(): boolean {
    return this.mime_type === 'application/pdf';
  }

  /**
   * Convertit vers un format compatible tableau
   */
  public toTableRow(): {
    id: number;
    name: string;
    filename: string;
    size: string;
    mimeType: string;
    dateCreated: string;
    createdBy: number;
  } {
    return {
      id: this.id,
      name: this.name,
      filename: this.filename,
      size: this.formattedSize,
      mimeType: this.mime_type,
      dateCreated: this.date_created,
      createdBy: this.created_by,
    };
  }

  /**
   * Convertit en JSON
   */
  public toJSON(): EmployeeDocument {
    return {
      id: this.id,
      id_employe: this.id_employe,
      name: this.name,
      filename: this.filename,
      path: this.path,
      mime_type: this.mime_type,
      size: this.size,
      date_created: this.date_created,
      date_updated: this.date_updated,
      created_by: this.created_by,
    };
  }

  /**
   * Crée un DocumentModel à partir des données API
   */
  public static fromJSON(data: EmployeeDocument): DocumentModel {
    return new DocumentModel(data);
  }

  /**
   * Crée une liste de DocumentModel à partir des données API
   */
  public static listFromJSON(data: EmployeeDocument[]): DocumentModel[] {
    return data.map((item) => DocumentModel.fromJSON(item));
  }
}
