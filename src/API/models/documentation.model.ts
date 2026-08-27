export interface DocumentationData {
  id_documentation: number;
  reference: string;
  titre: string;
  description: string | null;
  categorie: string;
  mots_cles: string[];
  public_cible: string;
  version: string;
  date_publication: string;
  nom_fichier: string;
  taille_octets: number;
  createur?: { prenom: string; nom: string } | null;
}

export class DocumentationModel implements DocumentationData {
  id_documentation!: number; reference!: string; titre!: string; description!: string | null;
  categorie!: string; mots_cles!: string[]; public_cible!: string; version!: string;
  date_publication!: string; nom_fichier!: string; taille_octets!: number;
  createur?: { prenom: string; nom: string } | null;
  constructor(data: DocumentationData) { Object.assign(this, data); }
  static listFromJSON(data: DocumentationData[]): DocumentationModel[] { return data.map((item) => new DocumentationModel(item)); }
}
