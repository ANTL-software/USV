import type { Employe } from '../types/index.ts';
import { getAllowedSections, getPartnerModules, hasAccessToSection, hasAccessToSubsection } from './permissions.ts';

export type NavigationIconKey = 'add' | 'booking' | 'commercial' | 'commerciaux' | 'documents' | 'home' | 'incidents' | 'list' | 'mail' | 'operations' | 'projects' | 'statistics';

export interface NavigationItem {
  active: boolean;
  icon: NavigationIconKey;
  id: string;
  label: string;
  path: string;
}

export interface NavigationGroup {
  id: string;
  items: NavigationItem[];
  title?: string;
}

interface NavigationDefinition {
  aliases?: string[];
  icon: NavigationIconKey;
  id: string;
  label: string;
  path: string;
  sectionId?: string;
}

const SECTION_DEFINITIONS: NavigationDefinition[] = [
  { id: 'home', label: 'Accueil', path: '/home', icon: 'home' },
  { id: 'mail', label: 'Courriers', path: '/mail', icon: 'mail', sectionId: 'mail' },
  { id: 'booking', label: 'Booking', path: '/booking', icon: 'booking', sectionId: 'booking' },
  { id: 'operations', label: 'Gestion opérationnelle', path: '/operations', aliases: ['/campagnes', '/prospects', '/produits'], icon: 'operations', sectionId: 'operations' },
  { id: 'commercial', label: 'Commercial', path: '/commercial', icon: 'commercial', sectionId: 'commercial' },
  { id: 'incidents', label: 'Gestion des incidents', path: '/incidents', icon: 'incidents', sectionId: 'incidents' },
  { id: 'commerciaux', label: 'Gestion commerciaux', path: '/commerciaux', icon: 'commerciaux', sectionId: 'commerciaux' },
  { id: 'projets', label: 'Gestion de projets', path: '/projets', icon: 'projects', sectionId: 'projets' },
  { id: 'documentation', label: 'Documentation', path: '/documentation', icon: 'documents', sectionId: 'documentation' },
];

function isPathActive(definition: NavigationDefinition, pathname: string): boolean {
  return pathname.startsWith(definition.path) || Boolean(definition.aliases?.some((alias) => pathname.startsWith(alias)));
}

export function buildSubNavigation(user: Employe | null, pathname: string): NavigationItem[] {
  const showHome = getAllowedSections(user).length > 1;
  return SECTION_DEFINITIONS
    .filter(({ id, sectionId }) => id === 'home' ? showHome : Boolean(sectionId && hasAccessToSection(user, sectionId)))
    .map((definition) => ({
      active: isPathActive(definition, pathname),
      icon: definition.icon,
      id: definition.id,
      label: definition.label,
      path: definition.path,
    }));
}

export function buildHeaderMobileNavigation(user: Employe | null, pathname: string): NavigationGroup[] {
  if (user?.account_type === 'partenaire_externe') {
    const moduleItems: NavigationItem[] = getPartnerModules(user).map((module) => ({
      active: pathname.startsWith(module.path),
      icon: module.id === 'documents' ? 'documents' : 'statistics',
      id: `partner-${module.id}`,
      label: module.label,
      path: module.path,
    }));
    return [{
      id: 'partner',
      title: 'Espace partenaire',
      items: [
        {
          active: pathname === '/partenaire',
          icon: 'home',
          id: 'partner-home',
          label: 'Accueil partenaire',
          path: '/partenaire',
        },
        ...moduleItems,
      ],
    }];
  }
  const groups: NavigationGroup[] = [];
  if (getAllowedSections(user).length > 1) {
    groups.push({ id: 'home', items: [{ active: pathname === '/home', icon: 'home', id: 'home', label: 'Accueil', path: '/home' }] });
  }
  if (hasAccessToSection(user, 'mail')) {
    const items: NavigationItem[] = [];
    if (hasAccessToSubsection(user, 'mail', 'mail_new')) items.push({ active: pathname === '/mail/new', icon: 'add', id: 'mail-new', label: 'Ajouter un courrier', path: '/mail/new' });
    if (hasAccessToSubsection(user, 'mail', 'mail_list')) items.push({ active: pathname === '/mail/list', icon: 'list', id: 'mail-list', label: 'Liste des courriers', path: '/mail/list' });
    if (items.length) groups.push({ id: 'mail', title: 'Gestion des courriers', items });
  }
  SECTION_DEFINITIONS.filter(({ id }) => !['home', 'mail'].includes(id)).forEach((definition) => {
    if (!definition.sectionId || !hasAccessToSection(user, definition.sectionId)) return;
    groups.push({
      id: definition.id,
      title: definition.label === 'Booking' ? 'Agenda' : definition.label,
      items: [{
        active: isPathActive(definition, pathname),
        icon: definition.icon,
        id: definition.id,
        label: definition.label === 'Booking' ? 'Agenda' : definition.label,
        path: definition.path,
      }],
    });
  });
  return groups;
}

export function shouldRenderSubNavigation(items: NavigationItem[]): boolean {
  return items.length > 1 || items.some(({ id }) => id === 'home');
}
