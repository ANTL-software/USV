import type { Employe } from '../types/index.ts';

export const ACCESS_MANAGEMENT_PERMISSION = 'access-management';
export const PARTNER_STATISTICS_PERMISSION = 'statistiques-partenaire';
export const PARTNER_DOCUMENTS_PERMISSION = 'documents-partenaire';
export const PARTNER_PROSPECTS_PERMISSION = 'extraction-prospects-partenaire';
export const PARTNER_RECORDINGS_PERMISSION = 'ecoutes-appels-partenaire';

export interface PartnerModuleAccess {
  description: string;
  id: 'documents' | 'ecoutes' | 'prospects' | 'statistiques';
  label: string;
  path: string;
  permission: string;
}

const PARTNER_MODULES: PartnerModuleAccess[] = [
  {
    description: 'Consulter les horaires de décroché, les répondeurs et la joignabilité des campagnes.',
    id: 'statistiques',
    label: 'Statistiques de prospection',
    path: '/partenaire/statistiques',
    permission: PARTNER_STATISTICS_PERMISSION,
  },
  {
    description: 'Retrouver les bons de commande et les fiches de rendez-vous des dossiers validés.',
    id: 'documents',
    label: 'Documents commerciaux',
    path: '/partenaire/documents',
    permission: PARTNER_DOCUMENTS_PERMISSION,
  },
  {
    description: 'Consulter les prospects injectés dans votre campagne et télécharger la base complète au format CSV.',
    id: 'prospects',
    label: 'Extraction des prospects',
    path: '/partenaire/prospects',
    permission: PARTNER_PROSPECTS_PERMISSION,
  },
  {
    description: 'Écouter les appels enregistrés qui concernent exclusivement votre campagne autorisée.',
    id: 'ecoutes',
    label: 'Écoute des appels',
    path: '/partenaire/ecoutes',
    permission: PARTNER_RECORDINGS_PERMISSION,
  },
];

export function getPartnerModules(user: Employe | null): PartnerModuleAccess[] {
  if (user?.account_type !== 'partenaire_externe') return [];
  return PARTNER_MODULES.filter(({ permission }) => user.permissions?.[permission] === true);
}

export interface SubsectionConfig {
  id: string;
  name: string;
  path: string;
}

export interface SectionConfig {
  id: string;
  name: string;
  path: string;
  aliases?: string[];
  subsections: SubsectionConfig[];
}

export const SECTIONS_CONFIG: SectionConfig[] = [
  {
    id: 'mail',
    name: 'Gestion des courriers',
    path: '/mail',
    subsections: [
      { id: 'mail_new', name: 'Ajouter un courrier', path: '/mail/new' },
      { id: 'mail_list', name: 'Liste des courriers', path: '/mail/list' },
      { id: 'mail_convert', name: 'Convertisseur', path: '/mail/convert' },
    ],
  },
  {
    id: 'booking',
    name: 'Agenda',
    path: '/booking',
    subsections: [],
  },
  {
    id: 'operations',
    name: 'Gestion opérationnelle',
    path: '/operations',
    aliases: ['/campagnes', '/prospects', '/produits', '/paniers'],
    subsections: [
      { id: 'supervision', name: 'Supervision', path: '/supervision' },
      { id: 'vigie', name: 'Vigie', path: '/operations/vigie' },
      { id: 'commandes', name: 'Commandes', path: '/operations/commandes' },
      { id: 'campagnes', name: 'Campagnes', path: '/campagnes' },
      { id: 'prospects', name: 'Prospects', path: '/operations/prospects' },
      { id: 'produits', name: 'Produits', path: '/produits' },
      { id: 'qualite', name: 'Qualité', path: '/operations/qualite' },
      { id: 'qualite-signalements', name: 'Qualité — Signalements', path: '/operations/qualite/signalements' },
      { id: 'qualite-ecoutes', name: 'Qualité — Écoutes', path: '/operations/qualite/ecoutes' },
      { id: 'qualite-statistiques', name: 'Qualité — Statistiques', path: '/operations/qualite/statistiques' },
      { id: 'demandes-absence', name: 'Demandes d’absence', path: '/operations/demandes-absence' },
      { id: 'employes', name: 'Employés', path: '/operations/employes' },
      { id: 'postes', name: 'Postes & planning', path: '/operations/postes' },
      { id: 'materiel', name: 'Matériel', path: '/operations/materiel' },
      { id: 'telephonie', name: 'Téléphonie', path: '/operations/materiel/telephonie' },
    ],
  },
  {
    id: 'commercial',
    name: 'Commercial',
    path: '/commercial',
    subsections: [
      { id: 'publications-reseaux-sociaux', name: 'Posts réseaux sociaux', path: '/commercial/publications-reseaux-sociaux' },
      { id: 'facturation', name: 'Facturation', path: '/commercial/facturation' },
      { id: 'devis', name: 'Devis', path: '/commercial/devis' },
      { id: 'configuration-antl', name: 'Configuration ANTL', path: '/commercial/configuration-antl' },
    ],
  },
  {
    id: 'incidents',
    name: 'Gestion des incidents',
    path: '/incidents',
    subsections: [
      { id: 'declarer', name: 'Déclarer un incident', path: '/incidents/declarer' },
      { id: 'qualifier', name: 'Qualifier un incident', path: '/incidents/qualification' },
      { id: 'traiter', name: 'Traiter un incident', path: '/incidents/traitement' },
      { id: 'liste', name: 'Liste des incidents', path: '/incidents/liste' },
    ],
  },
  {
    id: 'commerciaux',
    name: 'Gestion commerciaux',
    path: '/commerciaux',
    subsections: [
      { id: 'notes-direction', name: 'Notes de direction (lecture)', path: '/commerciaux/notes-direction' },
      { id: 'notes-direction-create', name: 'Notes de direction (création)', path: '/commerciaux/notes-direction' },
      { id: 'notes-direction-delete', name: 'Notes de direction (suppression)', path: '/commerciaux/notes-direction' },
      { id: 'mon_planning', name: 'Mon planning', path: '/commerciaux/mon_planning' },
    ],
  },
  {
    id: 'projets',
    name: 'Gestion de projets',
    path: '/projets',
    subsections: [],
  }
  , {
    id: 'documentation',
    name: 'Documentation',
    path: '/documentation',
    subsections: [
      { id: 'documentation-consultation', name: 'Consulter la documentation', path: '/documentation' },
      { id: 'documentation-publication', name: 'Publier une documentation', path: '/documentation' },
    ],
  }
];

export function hasAccessToSection(user: Employe | null, sectionId: string): boolean {
  if (!user) return false;
  const permissions = user.poste?.permissions;
  if (!permissions) return false;
  return permissions[sectionId]?.enabled === true;
}

export function hasAccessToSubsection(user: Employe | null, sectionId: string, subsectionId: string): boolean {
  if (!user || !hasAccessToSection(user, sectionId)) return false;
  const permissions = user.poste?.permissions;
  if (!permissions) return false;
  const section = permissions[sectionId];
  return section?.subsections?.includes(subsectionId) === true;
}

export function hasAccessToPath(user: Employe | null, path: string): boolean {
  if (!user) return false;
  
  const cleanPath = '/' + path.split('/').filter(Boolean).join('/');

  if (user.account_type === 'partenaire_externe') {
    if (cleanPath === '/partenaire') return true;
    return getPartnerModules(user).some(({ path: modulePath }) => cleanPath === modulePath);
  }
  
  if (cleanPath === '/home' || cleanPath === '/auth' || cleanPath === '/') {
    return true;
  }

  if (cleanPath.startsWith('/documentation')) {
    if (!hasAccessToSection(user, 'documentation')) return false;
    return hasAccessToSubsection(user, 'documentation', 'documentation-consultation');
  }

  if (cleanPath.startsWith('/operations/partenaires-externes')) {
    return hasAccessToSection(user, ACCESS_MANAGEMENT_PERMISSION);
  }
  
  if (cleanPath.startsWith('/mail')) {
    if (!hasAccessToSection(user, 'mail')) return false;
    if (cleanPath === '/mail') return true;
    if (cleanPath === '/mail/new') return hasAccessToSubsection(user, 'mail', 'mail_new');
    if (cleanPath === '/mail/list' || cleanPath.startsWith('/mail/update')) return hasAccessToSubsection(user, 'mail', 'mail_list');
    if (cleanPath === '/mail/convert') return hasAccessToSubsection(user, 'mail', 'mail_convert');
    return false;
  }
  
  if (cleanPath.startsWith('/booking')) {
    return hasAccessToSection(user, 'booking');
  }

  if (cleanPath.startsWith('/commercial')) {
    if (!hasAccessToSection(user, 'commercial')) return false;
    if (cleanPath === '/commercial') return true;
    if (cleanPath.startsWith('/commercial/publications-reseaux-sociaux')) {
      return hasAccessToSubsection(user, 'commercial', 'publications-reseaux-sociaux');
    }
    if (cleanPath.startsWith('/commercial/facturation')) {
      return hasAccessToSubsection(user, 'commercial', 'facturation');
    }
    if (cleanPath.startsWith('/commercial/devis')) {
      return hasAccessToSubsection(user, 'commercial', 'devis');
    }
    if (cleanPath.startsWith('/commercial/configuration-antl')) {
      return hasAccessToSubsection(user, 'commercial', 'configuration-antl');
    }
    return false;
  }
  
  if (cleanPath.startsWith('/commerciaux')) {
    if (!hasAccessToSection(user, 'commerciaux')) return false;
    if (cleanPath === '/commerciaux') return true;
    if (cleanPath === '/commerciaux/notes-direction') return hasAccessToSubsection(user, 'commerciaux', 'notes-direction');
    if (cleanPath === '/commerciaux/mon_planning') return hasAccessToSubsection(user, 'commerciaux', 'mon_planning');
    return false;
  }
  
  if (cleanPath.startsWith('/projets')) {
    return hasAccessToSection(user, 'projets');
  }

  if (cleanPath.startsWith('/incidents')) {
    if (!hasAccessToSection(user, 'incidents')) return false;
    if (cleanPath === '/incidents') return true;
    if (cleanPath.startsWith('/incidents/declarer')) return hasAccessToSubsection(user, 'incidents', 'declarer');
    if (cleanPath.startsWith('/incidents/qualification')) return hasAccessToSubsection(user, 'incidents', 'qualifier');
    if (cleanPath === '/incidents/traitement') return hasAccessToSubsection(user, 'incidents', 'traiter');
    if (cleanPath.startsWith('/incidents/traitement/')) return hasAccessToSubsection(user, 'incidents', 'traiter') || hasAccessToSubsection(user, 'incidents', 'liste');
    if (cleanPath.startsWith('/incidents/liste')) return hasAccessToSubsection(user, 'incidents', 'liste');
    return false;
  }
  
  if (
    cleanPath.startsWith('/operations') || 
    cleanPath.startsWith('/supervision') || 
    cleanPath.startsWith('/campagnes') || 
    cleanPath.startsWith('/prospects') || 
    cleanPath.startsWith('/produits') || 
    cleanPath.startsWith('/paniers')
  ) {
    if (!hasAccessToSection(user, 'operations')) return false;
    if (cleanPath === '/operations/employes/new' || /^\/operations\/employes\/\d+$/.test(cleanPath)) {
      return hasAccessToSection(user, ACCESS_MANAGEMENT_PERMISSION);
    }
    if (/^\/operations\/postes\/(?:new|\d+)$/.test(cleanPath)) {
      return hasAccessToSection(user, ACCESS_MANAGEMENT_PERMISSION);
    }
    if (cleanPath === '/operations') return true;
    if (cleanPath.startsWith('/operations/vigie')) return hasAccessToSubsection(user, 'operations', 'vigie');
    if (cleanPath.startsWith('/supervision')) return hasAccessToSubsection(user, 'operations', 'supervision');
    if (cleanPath.startsWith('/operations/commandes')) return hasAccessToSubsection(user, 'operations', 'commandes');
    if (cleanPath.startsWith('/campagnes')) return hasAccessToSubsection(user, 'operations', 'campagnes');
    if (cleanPath.startsWith('/operations/prospects') || cleanPath.startsWith('/prospects/import') || cleanPath.includes('/inject')) return hasAccessToSubsection(user, 'operations', 'prospects');
    if (cleanPath.startsWith('/produits') || cleanPath.startsWith('/paniers')) return hasAccessToSubsection(user, 'operations', 'produits');
    if (cleanPath === '/operations/qualite') return hasAccessToSubsection(user, 'operations', 'qualite');
    if (cleanPath.startsWith('/operations/qualite/signalements')) {
      return hasAccessToSubsection(user, 'operations', 'qualite')
        && hasAccessToSubsection(user, 'operations', 'qualite-signalements');
    }
    if (cleanPath.startsWith('/operations/qualite/ecoutes')) {
      return hasAccessToSubsection(user, 'operations', 'qualite')
        && hasAccessToSubsection(user, 'operations', 'qualite-ecoutes');
    }
    if (cleanPath.startsWith('/operations/qualite/statistiques')) {
      return hasAccessToSubsection(user, 'operations', 'qualite')
        && hasAccessToSubsection(user, 'operations', 'qualite-statistiques');
    }
    if (cleanPath.startsWith('/operations/demandes-absence')) return hasAccessToSubsection(user, 'operations', 'demandes-absence');
    if (cleanPath.startsWith('/operations/employes')) return hasAccessToSubsection(user, 'operations', 'employes');
    if (cleanPath.startsWith('/operations/postes')) return hasAccessToSubsection(user, 'operations', 'postes');
    if (cleanPath.startsWith('/operations/materiel/telephonie')) {
      return hasAccessToSubsection(user, 'operations', 'materiel')
        && hasAccessToSubsection(user, 'operations', 'telephonie');
    }
    if (cleanPath.startsWith('/operations/materiel')) return hasAccessToSubsection(user, 'operations', 'materiel');
    return false;
  }
  
  return false;
}

export function getAllowedSections(user: Employe | null): string[] {
  if (!user) return [];
  const sections = ['mail', 'booking', 'operations', 'commercial', 'incidents', 'commerciaux', 'projets', 'documentation'];
  return sections.filter(sec => hasAccessToSection(user, sec));
}

export function getFirstAllowedPath(user: Employe | null): string {
  if (!user) return '/auth';
  if (user.account_type === 'partenaire_externe') {
    const partnerModules = getPartnerModules(user);
    return partnerModules.length === 1 ? partnerModules[0].path : '/partenaire';
  }

  const allowedSectionIds = getAllowedSections(user);
  if (allowedSectionIds.length !== 1) return '/home';

  const section = SECTIONS_CONFIG.find(({ id }) => id === allowedSectionIds[0]);
  if (!section) return '/home';

  const allowedSubsectionPaths = [...new Set(
    section.subsections
      .map(({ path }) => path)
      .filter((path) => hasAccessToPath(user, path)),
  )];

  return allowedSubsectionPaths.length === 1
    ? allowedSubsectionPaths[0]
    : section.path;
}
