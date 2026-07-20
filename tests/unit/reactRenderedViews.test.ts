import assert from 'node:assert/strict';
import path from 'node:path';
import test, { after, before } from 'node:test';

import { createElement, Fragment } from 'react';
import type { ComponentType, Context } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { createServer } from 'vite';
import type { ViteDevServer } from 'vite';

import type { UserContextType } from '../../src/context/user/UserContext.tsx';
import type {
  BookingCalendarViewModel,
  BookingFormViewModel,
  EmailComposerViewModel,
  HeaderViewModel,
  ProduitsImportModalViewModel,
  ProspectDetailViewModel,
  SignInFormViewModel,
} from '../../src/hooks/index.ts';
import {
  BOOKING_HOUR_OPTIONS,
  BOOKING_MINUTE_OPTIONS,
  BOOKING_WEEKDAYS,
  PROSPECT_DETAIL_STATUS_OPTIONS,
  PROSPECT_DETAIL_TYPE_OPTIONS,
  buildBookingMonthView,
  buildBookingWeekView,
  buildProspectDetailPresentation,
  createBookingFormState,
  getEmailComposerCopy,
} from '../../src/utils/scripts/index.ts';
import type { NavigationGroup } from '../../src/utils/scripts/index.ts';
import type { Employe, Prospect } from '../../src/utils/types/index.ts';
import type { LeadClient, QuoteFormState, QuoteLine, StatutRendezVous } from '../../src/utils/types/index.ts';

const ROOT = process.cwd();
let viteServer: ViteDevServer | null = null;

before(async () => {
  viteServer = await createServer({
    appType: 'custom',
    configFile: false,
    logLevel: 'silent',
    resolve: {
      alias: {
        'react-color': path.resolve(ROOT, 'tests/support/reactColorStub.ts'),
      },
    },
    server: { middlewareMode: true },
  });
});

after(async () => {
  await viteServer?.close();
});

function getViteServer(): ViteDevServer {
  assert.ok(viteServer);
  return viteServer;
}

async function loadComponent<Props extends object>(
  sourcePath: string,
  exportName = 'default',
): Promise<ComponentType<Props>> {
  const loadedModule = await getViteServer().ssrLoadModule(sourcePath);
  assert.equal(typeof loadedModule[exportName], 'function');
  return loadedModule[exportName] as ComponentType<Props>;
}

const noop = (): void => undefined;
const noopAsync = async (): Promise<void> => undefined;

function createUser(): Employe {
  return {
    actif: true,
    id_employe: 7,
    identifiant: 'nina',
    nom: 'Martin',
    poste: {
      id_poste: 3,
      libelle_poste: 'QA',
      permissions: {
        booking: { enabled: true },
        operations: { enabled: true, subsections: ['prospects', 'produits'] },
      },
    },
    prenom: 'Nina',
  };
}

function createProspect(): Prospect {
  return {
    activite: 'Conseil',
    adresse: '1 rue de Paris',
    civilite: 'Mme',
    code_naf: '7022Z',
    code_postal: '75001',
    created_at: '2026-07-15T10:00:00.000Z',
    doublon_date: null,
    doublon_signale_par: null,
    email: 'alice@example.com',
    est_doublon: false,
    id_agent_assigne: 4,
    id_prospect: 12,
    id_prospection: 42,
    nom: 'Dupont',
    optout: false,
    optout_date: null,
    optout_signale_par: null,
    pays: 'France',
    prenom: 'Alice',
    raison_sociale: 'Entreprise Démo',
    region: 'Île-de-France',
    secteur: 'Services',
    siret: '12345678901234',
    statut: 'interesse',
    statut_file: 'en_cours',
    statut_prospect_campagne: 'contacte',
    telephone: '0612345678',
    telephone_contact: '0198765432',
    type_prospect: 'Entreprise',
    type_telephone: 'mobile',
    updated_at: '2026-07-15T10:00:00.000Z',
    ville: 'Paris',
    agent_assigne: { id_employe: 4, nom: 'Martin', prenom: 'Léa' },
  };
}

test('Header et SubNav rendent les permissions et la route active via leurs hooks dédiés', async () => {
  const Header = await loadComponent<Record<string, never>>('/src/views/components/header/Header.tsx');
  const SubNav = await loadComponent<Record<string, never>>('/src/views/components/subNav/SubNav.tsx');
  const contextModule = await getViteServer().ssrLoadModule('/src/context/user/UserContext.tsx');
  const UserContext = contextModule.UserContext as Context<UserContextType | undefined>;
  const user = createUser();
  const contextValue: UserContextType = {
    clearError: noop,
    error: null,
    isAuthenticated: true,
    isLoading: false,
    login: noopAsync,
    logout: noopAsync,
    refreshUser: noopAsync,
    user,
  };

  const html = renderToStaticMarkup(createElement(
    UserContext.Provider,
    { value: contextValue },
    createElement(
      MemoryRouter,
      { initialEntries: ['/booking'] },
      createElement(Fragment, null, createElement(Header), createElement(SubNav)),
    ),
  ));

  assert.match(html, /Nina/);
  assert.match(html, /Accueil/);
  assert.match(html, /Booking/);
  assert.match(html, /Gestion opérationnelle/);
  assert.match(html, /subNavItem active/);
  assert.doesNotMatch(html, /Courriers/);
});

test('le menu mobile Header rend sa navigation sans connaître les permissions', async () => {
  interface HeaderContentProps {
    closeMobileMenu: () => void;
    isMobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    viewModel: HeaderViewModel;
  }
  const HeaderContent = await loadComponent<HeaderContentProps>(
    '/src/views/components/header/Header.tsx',
    'HeaderContent',
  );
  const mobileGroups: NavigationGroup[] = [{
    id: 'booking',
    title: 'Agenda',
    items: [{ active: true, icon: 'booking', id: 'booking', label: 'Agenda', path: '/booking' }],
  }];
  const viewModel: HeaderViewModel = {
    brandPath: '/home',
    greeting: 'Bonjour Nina',
    hasUser: true,
    isAuthRoute: false,
    logout: noopAsync,
    mobileGroups,
    navigateTo: noop,
    showTestBadge: true,
  };
  const html = renderToStaticMarkup(createElement(HeaderContent, {
    closeMobileMenu: noop,
    isMobileMenuOpen: true,
    toggleMobileMenu: noop,
    viewModel,
  }));

  assert.match(html, /Navigation/);
  assert.match(html, /mobileNavItem active/);
  assert.match(html, /Agenda/);
  assert.match(html, />TEST</);
  assert.match(html, /Déconnexion/);
});

test('Booking rend réellement le calendrier et son formulaire contrôlé', async () => {
  const BookingCalendar = await loadComponent<{ viewModel: BookingCalendarViewModel }>(
    '/src/views/components/bookingCalendar/BookingCalendar.tsx',
  );
  const BookingForm = await loadComponent<{ viewModel: BookingFormViewModel }>(
    '/src/views/components/bookingForm/BookingForm.tsx',
  );
  const referenceDate = new Date('2026-07-20T12:00:00');
  const formState = {
    ...createBookingFormState('2026-07-20 09:00', referenceDate),
    description: 'Présentation du projet',
    employe: { label: 'Léa MARTIN', value: 4 },
    error: 'Le créneau est indisponible.',
    personneExterne: 'Client Démo',
  };
  const form: BookingFormViewModel = {
    close: noop,
    employees: [{ label: 'Léa MARTIN', value: 4 }],
    hourOptions: BOOKING_HOUR_OPTIONS,
    isOpen: false,
    isSubmitting: false,
    loadingEmployees: false,
    minuteOptions: BOOKING_MINUTE_OPTIONS,
    state: formState,
    submit: noopAsync,
    today: '2026-07-16',
    updateField: noop,
  };
  const viewModel: BookingCalendarViewModel = {
    currentDateInput: '2026-07-20',
    currentView: 'week',
    detail: {
      booking: null,
      cancel: noopAsync,
      close: noop,
      dateLabel: '',
      employeeLabel: '',
      isCancelling: false,
      isConfirming: false,
      move: noop,
      rejectCancellation: noop,
      requestCancellation: noop,
      timeLabel: '',
    },
    form,
    isLoading: false,
    month: {
      navigate: noop,
      selectDay: noop,
      selectEvent: noop,
      view: buildBookingMonthView([], referenceDate),
      weekdays: BOOKING_WEEKDAYS,
    },
    move: {
      beneficiaryLabel: '',
      close: noop,
      hourOptions: BOOKING_HOUR_OPTIONS,
      isOpen: false,
      isSubmitting: false,
      minuteOptions: BOOKING_MINUTE_OPTIONS,
      state: null,
      submit: noopAsync,
      today: '2026-07-16',
      updateField: noop,
    },
    openNewBooking: noop,
    setCurrentDate: noop,
    setCurrentView: noop,
    week: {
      navigate: noop,
      selectEvent: noop,
      selectSlot: noop,
      startHour: 7,
      view: buildBookingWeekView([], referenceDate),
    },
  };

  const calendarHtml = renderToStaticMarkup(createElement(BookingCalendar, { viewModel }));
  const formHtml = renderToStaticMarkup(createElement(BookingForm, { viewModel: { ...form, isOpen: true } }));

  assert.match(calendarHtml, /Semaine/);
  assert.match(calendarHtml, /Nouveau rendez-vous/);
  assert.match(calendarHtml, /20 juil/);
  assert.match(formHtml, /Employé ANTL/);
  assert.match(formHtml, /Client Démo/);
  assert.match(formHtml, /Présentation du projet/);
  assert.match(formHtml, /Le créneau est indisponible/);
});

test('les formulaires Email connexion et import produits sont rendus avec leurs états', async () => {
  const EmailModal = await loadComponent<{ viewModel: EmailComposerViewModel }>(
    '/src/views/components/emailModal/EmailModal.tsx',
  );
  const SignInForm = await loadComponent<{ viewModel: SignInFormViewModel }>(
    '/src/views/components/signInForm/SignInForm.tsx',
  );
  const ProduitsImportModal = await loadComponent<{ viewModel: ProduitsImportModalViewModel }>(
    '/src/views/components/produitsImportModal/ProduitsImportModal.tsx',
    'ProduitsImportModal',
  );
  const emailViewModel: EmailComposerViewModel = {
    bulkMode: true,
    close: noop,
    copy: getEmailComposerCopy(true, 2),
    courrier: null,
    form: {
      error: 'Le destinataire est invalide.',
      message: 'Merci de vérifier les pièces jointes.',
      subject: 'Deux courriers à traiter',
      to: 'equipe@example.com',
    },
    isLoading: false,
    isVisible: true,
    selectedCount: 2,
    submit: noopAsync,
    updateField: noop,
  };
  const signInViewModel: SignInFormViewModel = {
    error: 'Identifiants incorrects',
    identifiant: 'nina',
    isLoading: false,
    password: 'secret',
    setIdentifiant: noop,
    setPassword: noop,
    submit: noopAsync,
  };
  const importViewModel: ProduitsImportModalViewModel = {
    closeImportModal: noop,
    fileInputVersion: 3,
    handleImportFileChange: noop,
    importState: {
      error: null,
      isLoading: false,
      result: {
        created: 2,
        errors: [{ ligne: 4, message: 'Prix invalide' }],
        skipped: 1,
      },
      selectedFile: null,
    },
    showImportModal: true,
  };

  const emailHtml = renderToStaticMarkup(createElement(EmailModal, { viewModel: emailViewModel }));
  const signInHtml = renderToStaticMarkup(createElement(SignInForm, { viewModel: signInViewModel }));
  const importHtml = renderToStaticMarkup(createElement(ProduitsImportModal, { viewModel: importViewModel }));

  assert.match(emailHtml, /Envoi groupé de 2 courriers/);
  assert.match(emailHtml, /equipe@example.com/);
  assert.match(emailHtml, /Le destinataire est invalide/);
  assert.match(signInHtml, /Identifiant/);
  assert.match(signInHtml, /Identifiants incorrects/);
  assert.match(importHtml, /Importer des produits/);
  assert.match(importHtml, /2 produits créés/);
  assert.match(importHtml, /Ligne 4: Prix invalide/);
});

test('le détail prospect est un rendu passif alimenté par son view-model', async () => {
  const ProspectDetailModal = await loadComponent<{ viewModel: ProspectDetailViewModel }>(
    '/src/views/components/prospectDetailModal/ProspectDetailModal.tsx',
  );
  const prospect = createProspect();
  const viewModel: ProspectDetailViewModel = {
    cancelEditing: noop,
    changeField: noop,
    close: noop,
    editedProspect: {},
    isEditing: false,
    isSubmitting: false,
    presentation: buildProspectDetailPresentation(prospect),
    prospect,
    save: noopAsync,
    startEditing: noop,
    statusOptions: PROSPECT_DETAIL_STATUS_OPTIONS,
    typeOptions: PROSPECT_DETAIL_TYPE_OPTIONS,
  };
  const html = renderToStaticMarkup(createElement(ProspectDetailModal, { viewModel }));

  assert.match(html, /Détail du prospect/);
  assert.match(html, /Entreprise Démo/);
  assert.match(html, /alice@example.com/);
  assert.match(html, /Statut global/);
  assert.match(html, /Statut campagne/);
  assert.match(html, /MARTIN Léa/);
});

test('Devis conserve ses étapes et ses actions après extraction en composants', async () => {
  const DevisWorkflowSummary = await loadComponent<Record<string, never>>(
    '/src/views/components/devisWorkflowSummary/DevisWorkflowSummary.tsx',
    'DevisWorkflowSummary',
  );
  interface DevisPreviewProps {
    form: QuoteFormState;
    monthlySubtotal: number;
    oneShotSubtotal: number;
    projectedTotal: number;
    selectedIncludedLines: QuoteLine[];
    selectedOptionLines: QuoteLine[];
    selectedTemplatePromise: string;
    selectedTemplateTitle: string;
  }
  const DevisPreview = await loadComponent<DevisPreviewProps>(
    '/src/views/components/devisPreview/DevisPreview.tsx',
    'DevisPreview',
  );
  const form: QuoteFormState = {
    billingRhythm: 'mensuel',
    budgetBand: '3k_8k',
    companyName: 'Entreprise Démo',
    contactName: 'Alice Dupont',
    contactRole: 'Direction',
    email: 'alice@example.com',
    engagement: '3_mois',
    needSummary: 'Structurer la prospection',
    objective: 'Générer des rendez-vous',
    phone: '0612345678',
    timeline: '30j',
  };
  const line: QuoteLine = {
    amount: 1200,
    description: 'Pilotage commercial',
    id: 'pilotage',
    label: 'Pilotage',
    mode: 'mensuel',
  };

  const summaryHtml = renderToStaticMarkup(createElement(DevisWorkflowSummary));
  const previewHtml = renderToStaticMarkup(createElement(DevisPreview, {
    form,
    monthlySubtotal: 1200,
    oneShotSubtotal: 300,
    projectedTotal: 3900,
    selectedIncludedLines: [line],
    selectedOptionLines: [],
    selectedTemplatePromise: 'Une prospection structurée',
    selectedTemplateTitle: 'Cycle client',
  }));

  assert.match(summaryHtml, /Étape 1/);
  assert.match(summaryHtml, /Choisir le modèle adapté/);
  assert.match(summaryHtml, /Valider le récap avant PDF/);
  assert.match(previewHtml, /Entreprise Démo/);
  assert.match(previewHtml, /Enregistrer le brouillon/);
  assert.match(previewHtml, /Préparer le futur document/);
});

test('le panneau lead conserve qualification impression et emplacement documentaire', async () => {
  interface LeadQualificationPanelProps {
    lead: LeadClient | null;
    printLeadDocument: () => void;
    statusUpdateLoading: StatutRendezVous | null;
    updateLeadStatus: (statut: StatutRendezVous) => Promise<void>;
  }
  const LeadQualificationPanel = await loadComponent<LeadQualificationPanelProps>(
    '/src/views/components/leadQualificationPanel/LeadQualificationPanel.tsx',
    'LeadQualificationPanel',
  );
  const lead: LeadClient = {
    created_at: '2026-07-15T10:00:00.000Z',
    date_rdv: '2026-07-20',
    heure_rdv: '09:00:00',
    id_agent: 4,
    id_campagne: 2,
    id_lead: 9,
    id_prospect: 12,
    motif: 'Rendez-vous client MMA',
    statut: 'planifie',
    updated_at: '2026-07-15T10:00:00.000Z',
  };
  const html = renderToStaticMarkup(createElement(LeadQualificationPanel, {
    lead,
    printLeadDocument: noop,
    statusUpdateLoading: null,
    updateLeadStatus: noopAsync,
  }));

  assert.match(html, /Qualification/);
  assert.match(html, /Réimprimer la fiche du rendez-vous/);
  assert.match(html, /Document du rendez-vous/);
  assert.match(html, /prochaine itération/);
});
