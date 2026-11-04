import { DEFAULT_FORM, PROJECT_QUOTE_SECTIONS, PROJECT_THIRD_PARTY_SERVICES } from '../../../src/utils/scripts/index.ts';
import type { QuoteDraft, QuoteDraftSnapshot } from '../../../src/utils/types/index.ts';

export function completeQuoteSnapshot(): QuoteDraftSnapshot {
  return {
    version: 1, draftName: 'Offre complète — vérification de reprise', selectedTemplateIds: ['conquete', 'conception'],
    campaignType: 'client_account', conquestSectionTitle: 'Acquisition de comptes professionnels',
    flexibleSectionTitle: 'Fidélisation et primes au résultat', conquestLineLabel: 'Compte professionnel validé',
    commercialCommissionDescription: 'Commission calculée sur le CA HT encaissé.\nAprès déduction des avoirs.',
    commercialCommissionRate: 7.5, appointmentRate: 185.5,
    appointmentDescription: 'Décideur identifié et besoin qualifié.\nValidation du compte par le client.',
    formState: { ...DEFAULT_FORM, companyName: 'Entreprise exemple', contactName: 'Camille Martin', contactRole: 'Direction commerciale',
      email: 'camille@entreprise.example', phone: '0546000000', needSummary: 'Coordonner la prospection et la plateforme.\nConserver le suivi des résultats.',
      objective: 'Livrer une plateforme et acquérir de nouveaux comptes.', budgetBand: '15k+', timeline: 'Après validation écrite du cadrage',
      engagement: '6_mois', billingRhythm: 'commande', commercialConditions: 'Forfait à la commande.\nPrimes après encaissement effectif.' },
    customClauses: [
      { id: 'clause-payante', label: 'Étude complémentaire', description: 'Analyse du besoin.\nCompte rendu détaillé.', amount: 65.25, included: false },
      { id: 'clause-incluse', label: 'Qualification du fichier', description: 'Contrôle initial des coordonnées.', included: true, amount: undefined },
    ],
    projectSections: [
      ...PROJECT_QUOTE_SECTIONS.map((section, index) => ({ ...section, title: `Phase ${index + 1} — ${section.titlePlaceholder}`,
        lines: section.lines.map((line, position) => ({ ...line, label: line.labelPlaceholder || 'Prestation',
          description: `Description de la phase ${index + 1}.\nLivrable ${position + 1}.`, amount: 1200.5 + index * 100 + position * 20, included: index === 3 })) })),
      { id: 'phase-ajoutee', title: 'Accompagnement du lancement', lines: [
        { id: 'prestation-ajoutee', label: 'Formation des équipes', description: 'Atelier de prise en main.\nSupport transmis au client.', amount: 850.75, included: false, isCustom: true },
      ] },
    ],
    thirdPartyServices: [...PROJECT_THIRD_PARTY_SERVICES.map(service => ({ ...service })),
      { id: 'tiers-ajoute', label: 'Service complémentaire', description: 'Abonnement réglé directement par le client.', isCustom: true }],
    flexibleServices: [
      { id: 'forfait', label: 'Campagne pilote', description: 'Préparation et réalisation.\nRestitution des résultats.', pricing: 'fixed', amountKind: 'currency', amount: 1250.75, condition: '' },
      { id: 'prime-euros', label: 'Prime par client', description: 'Prime forfaitaire conditionnelle.', pricing: 'variable', amountKind: 'currency', amount: 250.25, condition: 'Par nouveau client signé et après encaissement.' },
      { id: 'prime-pourcentage', label: 'Prime sur CA', description: 'Commission conditionnelle.', pricing: 'variable', amountKind: 'percentage', amount: 5.25, condition: 'Sur le CA HT encaissé de la première commande.' },
    ],
  };
}

export function quoteDraftFixture(snapshot: QuoteDraftSnapshot): QuoteDraft {
  return { id: 'e69d0db7-0efb-46dc-b415-cb28fa678ff1', title: snapshot.draftName || snapshot.formState.companyName,
    revision: 1, created_at: '2026-11-04T12:00:00.000Z', updated_at: '2026-11-04T12:00:00.000Z', snapshot };
}
