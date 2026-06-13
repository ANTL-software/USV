import type { Employe } from '../types/user.types';

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
      { id: 'mail_convert', name: 'Convertisseur', path: '/mail/convert' }
    ]
  },
  {
    id: 'booking',
    name: 'Agenda',
    path: '/booking',
    subsections: []
  },
  {
    id: 'operations',
    name: 'Gestion opérationnelle',
    path: '/operations',
    aliases: ['/campagnes', '/prospects', '/produits', '/paniers'],
    subsections: [
      { id: 'supervision', name: 'Supervision', path: '/supervision' },
      { id: 'commandes', name: 'Commandes', path: '/operations/commandes' },
      { id: 'campagnes', name: 'Campagnes', path: '/campagnes' },
      { id: 'prospects', name: 'Prospects', path: '/operations/prospects' },
      { id: 'produits', name: 'Produits', path: '/produits' },
      { id: 'qualite', name: 'Qualité', path: '/operations/qualite' },
      { id: 'demandes-absence', name: 'Demandes d\'absence', path: '/operations/demandes-absence' },
      { id: 'employes', name: 'Employés', path: '/operations/employes' },
      { id: 'postes', name: 'Postes & planning', path: '/operations/postes' },
      { id: 'materiel', name: 'Matériel', path: '/operations/materiel' }
    ]
  },
  {
    id: 'commerciaux',
    name: 'Gestion commerciaux',
    path: '/commerciaux',
    subsections: [
      { id: 'notes-direction', name: 'Notes de direction', path: '/commerciaux/notes-direction' },
      { id: 'mon_planning', name: 'Mon planning', path: '/commerciaux/mon_planning' }
    ]
  },
  {
    id: 'projets',
    name: 'Gestion de projets',
    path: '/projets',
    subsections: []
  }
];

export function hasAccessToSection(user: Employe | null, sectionId: string): boolean {
  if (!user) return false;
  
  if (user.poste && user.poste.permissions) {
    const perms = user.poste.permissions as Record<string, { enabled: boolean; subsections?: string[] }>;
    return !!perms[sectionId]?.enabled;
  }
  
  // Fallback aux rôles par défaut
  const title = user.poste?.libelle_poste;
  if (!title) return false;
  
  const fullAccessRoles = [
    'CEO', 'Business Developer', 'Sales Development', 
    'Sales Manager', 'Sales manager', 'Office Manager', 'QA Manager', 'CTO'
  ];
  if (fullAccessRoles.some(role => title.toLowerCase() === role.toLowerCase())) {
    return true;
  }
  
  const commercialRoles = ['Sales Expert', 'Sales Junior', 'Sales Senior'];
  if (commercialRoles.some(role => title.toLowerCase() === role.toLowerCase())) {
    return sectionId === 'commerciaux';
  }
  
  return false;
}

export function hasAccessToSubsection(user: Employe | null, sectionId: string, subsectionId: string): boolean {
  if (!user) return false;
  
  if (user.poste && user.poste.permissions) {
    const perms = user.poste.permissions as Record<string, { enabled: boolean; subsections?: string[] }>;
    const sec = perms[sectionId];
    if (!sec || !sec.enabled) return false;
    if (!sec.subsections) return false;
    return sec.subsections.includes(subsectionId);
  }
  
  // Fallback aux rôles par défaut
  const title = user.poste?.libelle_poste;
  if (!title) return false;
  
  const fullAccessRoles = [
    'CEO', 'Business Developer', 'Sales Development', 
    'Sales Manager', 'Sales manager', 'Office Manager', 'QA Manager', 'CTO'
  ];
  if (fullAccessRoles.some(role => title.toLowerCase() === role.toLowerCase())) {
    return true;
  }
  
  const commercialRoles = ['Sales Expert', 'Sales Junior', 'Sales Senior'];
  if (commercialRoles.some(role => title.toLowerCase() === role.toLowerCase())) {
    return sectionId === 'commerciaux';
  }
  
  return false;
}

export function hasAccessToPath(user: Employe | null, path: string): boolean {
  if (!user) return false;
  
  const cleanPath = '/' + path.split('/').filter(Boolean).join('/');
  
  if (cleanPath === '/home' || cleanPath === '/auth' || cleanPath === '/') {
    return true;
  }
  
  if (cleanPath.startsWith('/mail')) {
    if (!hasAccessToSection(user, 'mail')) return false;
    if (cleanPath === '/mail/new') return hasAccessToSubsection(user, 'mail', 'mail_new');
    if (cleanPath === '/mail/list' || cleanPath.startsWith('/mail/update')) return hasAccessToSubsection(user, 'mail', 'mail_list');
    if (cleanPath === '/mail/convert') return hasAccessToSubsection(user, 'mail', 'mail_convert');
    return true;
  }
  
  if (cleanPath.startsWith('/booking')) {
    return hasAccessToSection(user, 'booking');
  }
  
  if (cleanPath.startsWith('/commerciaux')) {
    if (!hasAccessToSection(user, 'commerciaux')) return false;
    if (cleanPath === '/commerciaux/notes-direction') return hasAccessToSubsection(user, 'commerciaux', 'notes-direction');
    if (cleanPath === '/commerciaux/mon_planning') return hasAccessToSubsection(user, 'commerciaux', 'mon_planning');
    return true;
  }
  
  if (cleanPath.startsWith('/projets')) {
    return hasAccessToSection(user, 'projets');
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
    
    if (cleanPath.startsWith('/supervision')) return hasAccessToSubsection(user, 'operations', 'supervision');
    if (cleanPath.startsWith('/operations/commandes')) return hasAccessToSubsection(user, 'operations', 'commandes');
    if (cleanPath.startsWith('/campagnes')) return hasAccessToSubsection(user, 'operations', 'campagnes');
    if (cleanPath.startsWith('/operations/prospects') || cleanPath.startsWith('/prospects/import') || cleanPath.includes('/inject')) return hasAccessToSubsection(user, 'operations', 'prospects');
    if (cleanPath.startsWith('/produits') || cleanPath.startsWith('/paniers')) return hasAccessToSubsection(user, 'operations', 'produits');
    if (cleanPath.startsWith('/operations/qualite')) return hasAccessToSubsection(user, 'operations', 'qualite');
    if (cleanPath.startsWith('/operations/demandes-absence')) return hasAccessToSubsection(user, 'operations', 'demandes-absence');
    if (cleanPath.startsWith('/operations/employes')) return hasAccessToSubsection(user, 'operations', 'employes');
    if (cleanPath.startsWith('/operations/postes')) return hasAccessToSubsection(user, 'operations', 'postes');
    if (cleanPath.startsWith('/operations/materiel')) return hasAccessToSubsection(user, 'operations', 'materiel');
    
    return true;
  }
  
  return false;
}

export function getAllowedSections(user: Employe | null): string[] {
  if (!user) return [];
  const sections = ['mail', 'booking', 'operations', 'commerciaux', 'projets'];
  return sections.filter(sec => hasAccessToSection(user, sec));
}

export function getFirstAllowedPath(user: Employe | null): string {
  if (!user) return '/auth';
  
  if (hasAccessToSection(user, 'commerciaux')) return '/commerciaux';
  if (hasAccessToSection(user, 'operations')) return '/operations';
  if (hasAccessToSection(user, 'mail')) return '/mail';
  if (hasAccessToSection(user, 'booking')) return '/booking';
  if (hasAccessToSection(user, 'projets')) return '/projets';
  
  return '/home';
}
