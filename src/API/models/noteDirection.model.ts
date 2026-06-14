export interface NoteDirectionData {
  id: number;
  name: string;
  filename: string;
  path: string;
  mime_type: string;
  size: number;
  date_created: string;
  date_updated: string | null;
  created_by: number;
  creator?: {
    id_employe: number;
    nom: string;
    prenom: string;
  };
}

/**
 * Modèle pour les notes de la direction
 */
export class NoteDirectionModel implements NoteDirectionData {
  id: number;
  name: string;
  filename: string;
  path: string;
  mime_type: string;
  size: number;
  date_created: string;
  date_updated: string | null;
  created_by: number;
  creator?: {
    id_employe: number;
    nom: string;
    prenom: string;
  };

  constructor(data: NoteDirectionData) {
    this.id = data.id;
    this.name = data.name;
    this.filename = data.filename;
    this.path = data.path;
    this.mime_type = data.mime_type;
    this.size = data.size;
    this.date_created = data.date_created;
    this.date_updated = data.date_updated;
    this.created_by = data.created_by;
    this.creator = data.creator;
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
   * Convertit en JSON
   */
  public toJSON(): NoteDirectionData {
    return {
      id: this.id,
      name: this.name,
      filename: this.filename,
      path: this.path,
      mime_type: this.mime_type,
      size: this.size,
      date_created: this.date_created,
      date_updated: this.date_updated,
      created_by: this.created_by,
      creator: this.creator,
    };
  }

  /**
   * Crée un NoteDirectionModel à partir des données API
   */
  public static fromJSON(data: NoteDirectionData): NoteDirectionModel {
    return new NoteDirectionModel(data);
  }

  /**
   * Crée une liste de NoteDirectionModel à partir des données API
   */
  public static listFromJSON(data: NoteDirectionData[]): NoteDirectionModel[] {
    return data.map((item) => NoteDirectionModel.fromJSON(item));
  }
}
