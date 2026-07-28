import type { Employe } from '../types/index.ts';

export const ACCESS_MANAGEMENT_PERMISSION = 'access-management';

export interface SectionConfig {
  id: string;
  name: string;
  path: string;
  aliases?: string[];
}

export const SECTIONS_CONFIG: SectionConfig[] = [
  {
    id: 'mail',
    name: 'Gestion des courriers',
    path: '/mail',
  },
  {
    id: 'booking',
    name: 'Agenda',
    path: '/booking',
  },
  {
    id: 'operations',
    name: 'Gestion opérationnelle',
    path: '/operations',
    aliases: ['/campagnes', '/prospects', '/produits', '/paniers'],
  },
  {
    id: 'commercial',
    name: 'Commercial',
    path: '/commercial',
  },
  {
    id: 'incidents',
    name: 'Gestion des incidents',
    path: '/incidents',
  },
  {
    id: 'commerciaux',
    name: 'Gestion commerciaux',
    path: '/commerciaux',
  },
  {
    id: 'projets',
    name: 'Gestion de projets',
    path: '/projets',
  }
];

export function hasAccessToSection(user: Employe | null, sectionId: string): boolean {
  if (!user) return false;
  
  if (user.poste && user.poste.permissions) {
    const perms = user.poste.permissions as Record<string, { enabled: boolean }>;
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
  void subsectionId;
  return hasAccessToSection(user, sectionId);
}

export function hasAccessToPath(user: Employe | null, path: string): boolean {
  if (!user) return false;
  
  const cleanPath = '/' + path.split('/').filter(Boolean).join('/');
  
  if (cleanPath === '/home' || cleanPath === '/auth' || cleanPath === '/') {
    return true;
  }
  
  if (cleanPath.startsWith('/mail')) {
    if (!hasAccessToSection(user, 'mail')) return false;
    return true;
  }
  
  if (cleanPath.startsWith('/booking')) {
    return hasAccessToSection(user, 'booking');
  }

  if (cleanPath.startsWith('/commercial')) {
    return hasAccessToSection(user, 'commercial');
  }
  
  if (cleanPath.startsWith('/commerciaux')) {
    if (!hasAccessToSection(user, 'commerciaux')) return false;
    return true;
  }
  
  if (cleanPath.startsWith('/projets')) {
    return hasAccessToSection(user, 'projets');
  }

  if (cleanPath.startsWith('/incidents')) {
    if (!hasAccessToSection(user, 'incidents')) return false;
    return true;
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
    
    return true;
  }
  
  return false;
}

export function getAllowedSections(user: Employe | null): string[] {
  if (!user) return [];
  const sections = ['mail', 'booking', 'operations', 'commercial', 'incidents', 'commerciaux', 'projets'];
  return sections.filter(sec => hasAccessToSection(user, sec));
}

export function getFirstAllowedPath(user: Employe | null): string {
  if (!user) return '/auth';
  
  if (hasAccessToSection(user, 'commerciaux')) return '/commerciaux';
  if (hasAccessToSection(user, 'operations')) return '/operations';
  if (hasAccessToSection(user, 'commercial')) return '/commercial';
  if (hasAccessToSection(user, 'incidents')) return '/incidents';
  if (hasAccessToSection(user, 'mail')) return '/mail';
  if (hasAccessToSection(user, 'booking')) return '/booking';
  if (hasAccessToSection(user, 'projets')) return '/projets';
  
  return '/home';
}
