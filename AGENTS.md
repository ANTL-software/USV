# AGENTS.md — USV Frontend Administration

> **Règles de design system et conventions pour le développement USV**
> Basé sur le design system global ANTL adapté aux besoins d'administration.

---

## Règles de refactor et d'architecture — obligatoires

Ces règles priment sur les exemples historiques de ce document lorsqu'ils divergent.

### Qualité du code

- Le type TypeScript `any` est strictement interdit, sans exception. Utiliser un type métier précis ou `unknown` avec un type guard.
- Respecter SOLID : responsabilités courtes, interfaces ciblées, composition et dépendances vers des abstractions stables.
- Appliquer DRY : rechercher une implémentation existante avant d'ajouter une fonction, un composant ou une règle métier.
- Éviter les points uniques de défaillance : pas de god component, god hook ou god context; isoler les domaines et prévoir des erreurs/fallbacks locaux.

### Couches frontend

Le chemin d'organisation obligatoire est :

```
services → types → models → context → hooks → components → layouts
```

`views` n'est pas une couche : `src/views/` est uniquement le dossier conteneur de `components/` et `layouts/`.

- Les services portent les accès externes; les types décrivent les contrats; les models normalisent le domaine.
- Les contexts portent uniquement l'état global partagé.
- Les hooks encapsulent la logique et exposent des actions typées aux composants.
- Les composants et layouts restent des couches de présentation pure : aucune logique métier, aucun calcul ou validation métier, aucune orchestration de workflow et aucun appel direct aux services.
- Les handlers des vues délèguent aux actions typées des hooks; seul l'état strictement visuel peut rester local.
- Toutes les fonctions génériques réellement transverses vivent dans `src/utils/scripts/utils.ts`. Les helpers métier restent dans un fichier de domaine sous `src/utils/scripts/` afin d'éviter un fichier fourre-tout.

### Imports et exports centralisés

- Chaque couche expose son API publique depuis son `index.ts` : services, types, models, context, hooks, components et layouts.
- Tout import provenant d'un autre dossier passe par cet `index.ts`; les imports profonds vers les fichiers d'implémentation sont interdits.
- Chaque module public est réexporté une seule fois par le barrel de sa couche; les réexports dispersés sont interdits.
- Les composants et layouts possèdent un `index.ts` local, puis sont agrégés dans `src/views/components/index.ts` ou `src/views/layouts/index.ts`.
- Aucun fichier sous `src/views/` ne doit importer un service. Une vue dépend des hooks et des contrats publics, jamais des implémentations d'accès aux données.

### Emplacements uniques

- Tous les composants React vivent dans `src/views/components/`.
- Tous les layouts et pages vivent dans `src/views/layouts/`.
- `src/components/` et `src/layouts/` sont interdits.
- Pour tout doublon hérité, vérifier les imports réels et l'historique Git, conserver la version active la plus récemment modifiée, la ranger sous `src/views/`, supprimer le reliquat et mettre à jour tous les imports.

### SCSS

- L'imbrication est limitée à trois niveaux maximum.
- L'esperluette `&` est interdite pour les classes SCSS, y compris pour BEM, les modificateurs et les pseudo-classes; écrire les sélecteurs explicitement.

---

## 🎯 Contexte Métier Global — ANTL Call Center

### Rôles et Responsabilités

**USV (Supervision/Administration)** — Interface réservée aux superviseurs :
- Création et gestion des campagnes de vente
- Ajout de fiches prospects à une campagne depuis la BDD
- Création des agents (employés)
- Gestion des accès agents
- Supervision en temps réel des campagnes actives
- Alertes et monitoring (Trunk OVH, consommation)

**Script (Vendeurs)** — Interface réservée aux agents télévendeurs :
- Connexion de l'agent et initialisation de son Device Twilio
- Passage en disponible → numérotation automatique du prospect assigné
- Affichage de la fiche prospect SEULEMENT si Twilio Device est connecté
- Tentative de vente avec les outils disponibles (catalogue, panier, objections, plan d'appel)
- Envoi de **bons de commande** (pas de paiement CB intégré)
- Prise de RDV pendant l'appel ou en closing
- Après appel : retour dashboard, passage dispo MANUEL
- RDV approche : passage manuel en "appel sortant" + numéro manuel
- Appels à la demande (RDV, prospects spécifiques)

---

## 🔑 Flux de Travail Agent

### 1. Connexion et Initialisation
```
Agent se connecte au Script
  → Login via /api/auth/login
  → Récupération Access Token Twilio (GET /api/twilio/token)
  → Initialisation du Twilio Device (WebRTC)
  → Device enregistré avec succès
  → Dashboard affiché
```

### 2. Disponibilité et Appel Automatique
```
Agent clique "Disponible"
  → Guard : Twilio Device doit être connecté/enregistré (sinon erreur)
  → PATCH /api/agents/me/statut = 'disponible'
  → GET /api/agents/me/next-prospect
  → Prospect assigné (origine: 'auto')
  → Navigation auto vers /prospect/:id
  → Appel Twilio (WebRTC) lancé automatiquement
  → Affichage fiche prospect + outils de vente
```

### 3. Appel en Cours
```
Conversation avec le prospect
  → Timer durée d'appel en cours
  → Stats WebRTC monitorées (perte paquets, RTT)
  → Outils disponibles :
     - Catalogue produits
     - Panier multi-produits
     - Objections et plan d'appel
     - Prise de RDV (pendant appel)
```

### 4. Closing (Fin d'Appel)
```
Agent raccroche ou clic "Terminer"
  → Modal closing OBLIGATOIRE
  → Enregistrement : statut_appel, notes, abouti
  → Si vente → création bon de commande (envoyé par email)
  → Si RDV → création rendez-vous (date/heure)
  → PATCH /api/appels/:id/terminer
  → Prospect remis en file selon résultat
  → Agent → statut 'pause_apres_appel'
  → Retour dashboard
```

### 5. RDV Approche — Appel Manuel
```
Agent a un RDV dans 10 min
  → Ne PAS passer en disponible (recevrait autre prospect)
  → Clic "Appel sortant" + saisie numéro manuel
  → PATCH /api/agents/me/statut = 'appel_sortant'
  → Recherche prospect par numéro (si fichié)
  → Ou création prospect à la volée
  → Appel Twilio manuel vers le numéro
```

### 6. Appels à la Demande
```
Agent veut appeler un prospect spécifique
  → Saisie numéro dans dashboard
  → Recherche prospect existant
  → Clic "Appeler" → openProspectManual(origin: 'manuel')
  → Appel Twilio sortant manuel
```

---

## 💰 Processus de Vente

### Pas de Paiement CB Intégré

Le système n'intègre PAS de paiement par carte bancaire :

1. **Vente conclue** → Création commande avec produits
2. **Génération bon de commande** → PDF envoyé par email au prospect
3. **Validation** → Le client doit nous retourner le bon signé
4. **Pas de transaction en ligne** → Uniquement envoi de document

### Outils de Vente Disponibles

| Outil | Description |
|-------|-------------|
| **Catalogue produits** | Produits de la campagne avec tarifs |
| **Panier multi-produits** | Ajout de plusieurs produits à la commande |
| **Objections** | Réponses préparées par campagne |
| **Plan d'appel** | Étapes de vente par campagne |
| **Historique appels** | Appels précédents avec ce prospect |
| **Historique ventes** | Commandes précédentes du prospect |

---

## 🎨 Design System USV

### Couleurs Thématiques

Le projet USV utilise la palette **Utils/Admin** (violette) comme couleur primaire.

| Couleur | Variable SCSS | Valeur Hex | Usage |
|---------|----------------|------------|-------|
| Primary | `$utilsPrimary` | `#7c3aed` | Boutons principaux, liens actifs |
| Secondary | `$utilsSecondary` | `#a78bfa` | Survol, états secondaires |
| Dark | `$utilsDark` | `#5b21b6` | Textes sur fond primaire |
| Gradient | `$utilsGradient` | `135deg, #7c3aed → #a78bfa` | Arrière-plans dégradés |

**Autres couleurs globales** :
```scss
$fontColorPrimary:   #2c3e50    // Textes principaux
$fontColorSecondary: #5a6c7d    // Textes secondaires
$greyBackground:      #f8f9fa    // Arrière-plans neutres
$whiteBackground:     #ffffff    // Fond blanc
$borderColor:         rgba(0,0,0,0.1)  // Bordures subtiles
$errorColor:          #e74c3c    // Erreurs
$successColor:        #27ae60    // Succès
$warningColor:        #f39c12    // Avertissements
```

### Breakpoints Responsive

| Nom | Variable | Valeur | Usage |
|-----|----------|--------|-------|
| Mobile | `$mobileWidth` | 768px | Styles de base (mobile-first) |
| Tablette | `$tabletWidth` | 1024px | Tablettes et petits écrans |
| Laptop | `$laptopWidth` | 1280px | Écran moyen |
| Desktop | `$desktopWidth` | 1440px | Grand écran |

**Pattern recommandé** :
```scss
@mixin responsive-feature {
  // Mobile first (par défaut)
  property: mobile-value;
  
  @media (min-width: $tabletWidth) {
    property: tablet-value;
  }
  
  @media (min-width: $desktopWidth) {
    property: desktop-value;
  }
}
```

---

## BtoB vs BtoC — Important

ANTL est une activité de **prospection commerciale BtoB (Business-to-Business)**. Cette distinction est cruciale pour comprendre les règles applicables dans l'interface d'administration USV.

### Type d'activité

| Aspect | ANTL (BtoB) | BtoC (Particuliers) |
|--------|---------------|---------------------|
| **Cible** | Entreprises, professionnels | Particuliers |
| **Numéros appelés** | Fixes uniquement (06/07 interdits) | Fixes + mobiles |
| **Restrictions horaires légales** | **AUCUNE** (appels possibles 24/7) | Lun-ven 10h-20h, sam 10h-17h, dimanche interdit |
| **Jours fériés** | Autorisé (évité par courtoisie) | Interdit |
| **Régulation** | Code de conduite professionnel | Loi禁 quincaea (2014) + ARCEP |
| **Bloctel** | Liste d'opposition BtoB (différente) | Liste d'opposition BtoC |

### Impact sur l'interface USV

**Ce qui n'est PAS applicable à ANTL** :
- ❌ Restrictions d'horaire de démarchage dans les vues de gestion de campagne
- ❌ Bloquage des appels le dimanche ou jours fériés
- ❌ Bloctel BtoC (liste opposants particuliers)

**Ce qui EST applicable** :
- ✅ Filtrage des numéros mobiles (06/07) — visible dans les stats d'appels
- ✅ Vérification Bloctel BtoB (à intégrer dans la gestion des prospects)
- ✅ Courtoisie professionnelle — affichage d'infos sans bloquer les actions

### Note pour le développement

L'USV étant une interface d'administration, elle ne gère pas directement les appels téléphoniques. Cependant, toute vue de supervision ou de statistiques doit refléter que :
- Les agents peuvent passer "disponible" à tout moment (pas de restriction horaire)
- Les appels vers les mobiles sont filtrés automatiquement
- Les jours fériés ne bloquent pas les appels (mais peuvent être indiqués dans les stats)

---

## 📐 Mixins Disponibles

### Layout

```scss
// Conteneur principal avec viewport complet
@mixin pageContainer { ... }

// Vue principale avec gradient de fond
@mixin mainView { ... }
// → Utilise le gradient utils par défaut : $utilsGradient

// Conteneur centré avec max-width
@mixin centeredContainer($max-width: 75em) { ... }

// Carte avec ombre et border-radius
@mixin card($radius: 0.75em, $shadow: light) { ... }
// Options $shadow: light (defaut), medium, heavy
```

### Formulaires

```scss
// Réinitialisation bouton
@mixin resetButton { ... }

// Input de base
@mixin formInput { ... }

// Conteneur d'actions de formulaire
@mixin formActions { ... }

// Bouton d'action stylisé
@mixin actionButton($bg-color, $hover-color) { ... }
```

### Flexbox

```scss
// Conteneur flex simple
@mixin flexContainer($direction: column, $gap: 1em) { ... }

// Conteneur flex responsive
@mixin flexContainerResponsive($mobile-direction, $tablet-direction, $gap) { ... }
```

### React-Select

```scss
@mixin reactSelect { ... }
// → Style complet pour le composant react-select
```

---

## 🎯 Composants Réutilisables — Styles

### Tableaux

**Structure de base** :
```scss
.component__table-wrapper {
  @include mixins.card(12px, light);
  overflow-x: auto;
}

.component__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th {
    text-align: left;
    padding: 0.85em 1em;
    font-weight: 600;
    color: vars.$fontColorSecondary;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid vars.$borderColor;
    white-space: nowrap;
  }

  td {
    padding: 0.85em 1em;
    border-bottom: 1px solid vars.$borderColor;
    vertical-align: middle;
    white-space: nowrap;

    code {
      font-family: monospace;
      font-size: 0.88em;
      background: vars.$greyBackground;
      padding: 0.15em 0.4em;
      border-radius: 4px;
    }
  }

  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: vars.$greyBackground; }
}
```

**Exemple** : Voir `agentsList.scss` → `.agentsList__table`

### Badges

**Styles standardisés** :
```scss
.component__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0.25em 0.6em;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
  white-space: nowrap;

  // Variantes par statut
  &--ok { background: #dcfce7; color: #16a34a; }
  &--missing { background: #fef9c3; color: #a16207; }
  &--inactive { background: vars.$greyBackground; color: vars.$fontColorSecondary; }

  // Variantes par type de poste
  &--direction  { background: #ede9fe; color: #6d28d9; }
  &--commercial { background: #dcfce7; color: #15803d; }
  &--support    { background: #dbeafe; color: #1d4ed8; }
  &--rh         { background: #fce7f3; color: #be185d; }
  &--technique  { background: #ffedd5; color: #c2410c; }
  &--adv        { background: #fef9c3; color: #a16207; }
  &--autre      { background: vars.$greyBackground; color: vars.$fontColorSecondary; }
}
```

**Couleurs sémantiques** :
- ✅ Vert : statut OK, actif
- ⚠️ Orange/Jaune : avertissement, manquant
- ❌ Gris : inactif, désactivé
- 💜 Violette : section Utils/Admin

### Boutons d'Action Inline (Tableau)

**Pattern pour les icônes dans les tableaux** :
```scss
.component__btn-edit,
.component__btn-deactivate,
.component__btn-view {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background vars.$transitionSmooth;
}

.component__btn-view {
  background: #e0e7ff;
  color: #4f46e5;
  &:hover { background: #c7d2fe; }
}

.component__btn-edit {
  background: #e0f2fe;
  color: #0284c7;
  &:hover { background: #bae6fd; }
}

.component__btn-deactivate {
  background: #fee2e2;
  color: #dc2626;
  &:hover { background: #fecaca; }
}
```

---

## 📜 Structure des Vues

### Pattern Standard (Toutes les vues)

```tsx
// imports
import './component.scss';
import { ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from 'react-icons/io5';
import WithAuth from '../../utils/middleware/WithAuth';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

function ComponentName(): ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div id="componentName">  // ⭐ ID unique = nom du fichier
      <Header />
      <SubNav />
      <main>
        <div className="componentName__container">
          {/* Header avec bouton retour */}
          <div className="componentName__header">
            <Button style="back" onClick={() => navigate('/parent-route')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1>Titre de la page</h1>
            {id && (
              <span className="componentName__identifiant">
                ID : <code>{id}</code>
              </span>
            )}
          </div>

          {/* Contenu principal */}
          <div className="componentName__content">
            {/* Contenu ici */}
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const ComponentNameWithAuth = WithAuth(ComponentName);
export default ComponentNameWithAuth;
```

### Règles de Structure

1. **Div root avec ID unique** : `<div id="componentName">`
2. **Ordre** : Header → SubNav → main → Container → Content
3. **BackToTop** : Toujours en dernier, en dehors du main
4. **WithAuth** : HOC appliqué avant export

---

## 🎨 Exemples Complets

### Exemple : Tableau avec Badges (AgentsList)

```scss
// agentsList.scss
#agentsList {
  @include mixins.mainView;

  main { padding: 1.5em 1em; }

  .agentsList__container { @include mixins.centeredContainer(1200px); }

  .agentsList__table-wrapper {
    @include mixins.card(12px, light);
    overflow-x: auto;
  }

  .agentsList__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;

    th { /* ... voir Design System → Tableaux */ }
    td { /* ... voir Design System → Tableaux */ }
  }

  .agentsList__badge {
    /* ... voir Design System → Badges */
  }

  .agentsList__btn-edit,
  .agentsList__btn-deactivate {
    /* ... voir Design System → Boutons d'Action Inline */
  }
}
```

### Exemple : Vue avec Aside (AgentDetails)

```scss
// agentDetails.scss
#agentDetails {
  @include mixins.pageContainer;

  .agentDetails__container {
    @include mixins.mainView;
    padding: 1em;
    padding-top: 8dvh;
    max-width: 1400px;
  }

  .agentDetails__content {
    display: flex;
    gap: 2em;
    flex-wrap: wrap;
  }

  // Tableau des documents (2/3 de la largeur)
  .agentDetails__documents {
    flex: 1;
    min-width: 500px;
  }
  
  .agentDetails__documents-table-wrapper {
    @include mixins.card(12px, light);
    overflow-x: auto;
  }
  
  .agentDetails__documents-table {
    // Mêmes styles que agentsList__table
  }

  // Aside des actions (1/3 de la largeur)
  .agentDetails__aside {
    flex: 0 0 350px;
    min-width: 300px;
  }
  
  .agentDetails__action-btn {
    display: flex;
    align-items: center;
    gap: 0.5em;
    width: 100%;
    justify-content: flex-start;
    padding: 0.75em 1em;
    border-radius: 8px;
    background: vars.$greyBackground;
    border: 1px solid vars.$borderColor;
    color: vars.$fontColorPrimary;
    font-weight: 500;
    cursor: pointer;
    transition: all vars.$transitionSmooth;

    &:hover {
      background: #e8ecf0;
      border-color: rgba(0, 0, 0, 0.15);
    }
  }
}
```

---

## ✅ Checklist Conformité Design System

- [ ] **ID unique** sur la div root (`id="componentName"`)
- [ ] Utilisation de `@use` pour les variables/mixins (pas `@import`)
- [ ] **Mobile First** : Styles de base pour mobile, media queries pour desktop
- [ ] **Couleurs** : Toujours utiliser les variables (`$utilsPrimary`, `$fontColorPrimary`, etc.)
- [ ] **Unités** : `em` pour les espacements, `dvh/dvw` pour le viewport
- [ ] **Tables** : Utiliser `mixins.card` pour le wrapper
- [ ] **Badges** : Utiliser les classes standardisées (`__badge--ok`, `__badge--missing`, etc.)
- [ ] **Boutons tableau** : 2rem × 2rem, icône centrée
- [ ] **Navigation** : Toujours utiliser le composant `<Button style="back">` avec icon
- [ ] **SubNav** : Toujours présentant sur les vues avec sous-navigation
- [ ] **BackToTop** : Toujours présent en bas de page
- [ ] **WithAuth** : Toujours appliqué sur les vues protégées

---

## ⚠️ Conventions SCSS Critiques

### 🔥 **Sélecteurs BEM avec des Classes (Jamais des IDs occultes)**

**❌ ERREUR COURANTE** : Ne pas utiliser `&__element` sous un sélecteur d'ID car cela crée des IDs concaténés (`#componentName__element`) au lieu de classes.

```scss
// ❌ PROBLÈME : Génère #agentDetails__container (ID selector)
#agentDetails {
  &__container {
    padding: 1em;
  }
}
```

```scss
// ✅ CORRECT : Génère #agentDetails .agentDetails__container (ID + descendant class)
#agentDetails {
  .agentDetails__container {
    padding: 1em;
  }
}
```

**Explication** : Le JSX utilise `className="agentDetails__container"` (classe), pas `id="agentDetails__container"`. 
- `&__container` → `#agentDetails__container` (recherche un élément avec cet ID)
- `.agentDetails__container` → `#agentDetails .agentDetails__container` (recherche un descendant avec cette classe)

**Règle** : Toujours utiliser des **sélecteurs de classe explicites** (`.componentName__element`). Toute esperluette `&` est interdite dans les classes SCSS, y compris pour les éléments BEM, les modificateurs et les pseudo-classes. L'imbrication est limitée à trois niveaux maximum.

---

## 📁 Structure Complète du Projet USV

### Architecture des Dossiers

```
USV/
├── public/                      # Assets statiques
├── src/
│   ├── API/                     # Services API
│   │   ├── APICalls.ts          # Configuration Axios + interceptors
│   │   ├── models/              # Modèles TypeScript (105+ types)
│   │   └── services/            # Services métier (15+ services)
│   │       ├── auth.service.ts
│   │       ├── campagne.service.ts
│   │       ├── courrier.service.ts
│   │       ├── employe.service.ts
│   │       ├── supervision.service.ts
│   │       ├── vente.service.ts
│   │       └── ...
│   │
│   ├── context/                 # Context Providers (6 contexts)
│   │   ├── UserContext.tsx      # Authentification utilisateur
│   │   ├── CourrierContext.tsx  # Gestion des courriers
│   │   ├── VenteContext.tsx     # Gestion des ventes
│   │   ├── BookingContext.tsx   # Gestion des réservations
│   │   ├── LoaderContext.tsx    # Gestion des loaders
│   │   └── AlertContext.tsx     # Notifications/alertes
│   │
│   ├── hooks/                   # Hooks personnalisés (22 hooks)
│   │   ├── useAuth.ts
│   │   ├── useCourrier.ts
│   │   ├── useSupervision.ts    # Polling supervision 7s
│   │   ├── useDashboardData.ts
│   │   ├── useToast.ts
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── middleware/          # HOC (WithAuth, BodyClassManager)
│   │   ├── scripts/             # Helpers (formatters, validators)
│   │   ├── styles/              # SCSS variables + mixins
│   │   │   ├── variables.scss   # Couleurs, breakpoints, transitions
│   │   │   └── mixins.scss      # Layout, flex, react-select
│   │   ├── types/               # Types TypeScript (105 interfaces)
│   │   └── constants/           # Constantes globales
│   │
│   ├── views/                   # Présentation React
│   │   ├── components/          # Tous les composants UI réutilisables
│   │   │   ├── header/Header.tsx
│   │   │   ├── subNav/SubNav.tsx
│   │   │   ├── footer/Footer.tsx
│   │   │   └── ...
│   │   └── layouts/             # Tous les layouts et pages
│   │       ├── home/Home.tsx
│   │       ├── authPage/AuthPage.tsx
│   │       ├── courriers/       # Module courriers avec stats
│   │       ├── listeCourriers/
│   │       ├── nouveauCourrier/
│   │       ├── updateCourrier/
│   │       ├── agentsList/      # Gestion agents
│   │       ├── agentDetails/
│   │       ├── agentForm/
│   │       ├── postesList/
│   │       ├── campagneForm/
│   │       ├── prospectImport/
│   │       ├── produitsList/
│   │       ├── materielList/
│   │       ├── commandesList/   # Avec stats dashboard
│   │       ├── centreAppels/
│   │       ├── prospectsSignales/
│   │       └── supervision/     # Supervision existante
│   │
│   ├── App.tsx                  # Routes configuration
│   └── main.tsx                 # Entry point
│
├── .env                         # Variables d'environnement
├── package.json                 # Dépendances
├── tsconfig.json                # Config TypeScript
├── vite.config.ts               # Config Vite
└── tailwind.config.js           # Config Tailwind (si utilisé)
```

### Nombre de Types/Interfaces

**105+ types/interfaces** définis dans `src/utils/types/` :
- QueueState, GlobalStats, ICourrierStats
- QueueCount, AgentState, CallInProgress
- CampaignAgentStats, AgentPerformance
- Et 90+ autres types métier

---

## 🗺️ Routes et Navigation

### Structure des Routes

```typescript
// Routes publiques
/auth               → AuthPage
/booking            → BookingPage (Agenda ANTL - RDV clients/prestataires)

// Routes authentifiées (WithAuth)
/home               → Home
/mail               → Courriers (hub avec stats)
/mail/list          → ListeCourriers
/mail/new           → NouveauCourrier
/mail/update/:id    → UpdateCourrier
/mail/convert       → ConvertisseurImage

/operations         → CentreAppels
/operations/employes → AgentsList
/operations/employes/new → AgentForm
/operations/employes/details/:id → AgentDetails
/operations/postes → PostesList
/operations/postes/new → PosteForm
/operations/postes/:id → PosteForm
/operations/materiel → MaterielList
/operations/commandes → CommandesList
/operations/signalements → ProspectsSignales

/campagnes          → CampagnesList
/campagnes/new      → CampagneForm
/campagnes/:id      → CampagneForm
/campagnes/:id/inject → ProspectImport
/campagnes/:id/prospects → ProspectsList

/supervision        → SupervisionView

/prospects/import   → ProspectImport
/produits           → ProduitsList
/produits/new       → ProduitForm
/produits/:id       → ProduitForm
```

### Pattern de Navigation

- **HOC `WithAuth`** sur toutes les vues sensibles
- **BodyClassManager** pour gestion des classes CSS selon la route
- **Header fixe (6dvh)** + **SubNav (4dvh)** + **Main adaptable (dvh)**
- **Footer invisible par défaut**, apparaît au scroll

### Polling Patterns

**`useSupervision(idCampagne)` hook** (`src/hooks/useSupervision.ts`):
- Polling toutes les 7 secondes
- Gestion d'erreurs consécutives (max 3)
- Retourne: `queueState`, `isLoading`, `error`, `refresh`

---

## 🔌 Services API Existants

### Endpoints de Supervision

| Endpoint | Description | Retour |
|----------|-------------|--------|
| `GET /supervision/queue/{id_campagne}` | État de la file pour une campagne | QueueState (queueCounts, agents, callsInProgress) |
| `GET /supervision/stats` | Statistiques globales | GlobalStats (campaignStats, agentStats) |
| `GET /supervision/productivite` | Temps par statut par agent | Periode + liste agents avec temps/statut |

### Endpoints Courriers

| Endpoint | Description | Retour |
|----------|-------------|--------|
| `GET /courriers/stats` | Statistiques courriers | ICourrierStats (total, entrants, sortants, internes, thisMonth, thisYear) |
| `GET /courriers` | Liste avec pagination et tri | Paginated list |
| `POST /courriers/upload` | Upload courrier (POST avec FormData) | Created courrier |
| `PATCH /courriers/:id` | Modifier courrier | Updated courrier |
| `DELETE /courriers/:id` | Supprimer courrier | Success |

### Endpoints Campagnes

| Endpoint | Description | Retour |
|----------|-------------|--------|
| `GET /campagnes` | Liste toutes les campagnes | Campaign[] |
| `PATCH /campagnes/{id}/statut` | Modifier statut campagne | Updated campaign |
| `GET /campagnes/{id}/agents` | Récupérer agents affectés | CampaignAgent[] |
| `POST /campagnes/{id}/agents/affecter` | Affecter agent | Success |
| `POST /campagnes/{id}/inject` | Injecter des prospects | Injected count |

### Endpoints Employés/Agents

| Endpoint | Description | Retour |
|----------|-------------|--------|
| `GET /employes` | Liste tous les employés | Employe[] |
| `GET /employes/{id}` | Détails employé | Employe |
| `PATCH /employes/{id}/actif` | Activer/désactiver | Updated employe |
| `POST /employes` | Créer employé | Created employe |
| `GET /employes/historique` | Historique employé | History[] |

---

## 🎨 Composants de Dashboard Existant

### Dashboard Courriers (`/mail`)

**Statistiques affichées** :
- Total courriers
- Entrants
- Sortants
- Ce mois

**Actions rapides** : Grille de boutons pour les actions courantes

### Dashboard Commandes (`/operations/commandes`)

**Cartes récapitulatives** (5) :
- Total commandes
- Montant total
- Validées
- En attente
- Annulées

**Tableau** avec filtres : campagne, statut, dates

### Dashboard Supervision (`/supervision`)

**Composants existants** :
- `QueueCards` - Compteurs de statut de file avec alertes
- `AgentList` - Liste agents avec statuts dialer
- `CallsTable` - Tableau appels en cours
- `SummaryCards` - Cartes récapitulatives (prospects restants, agents disponibles, appels en cours, agents affectés)

**Alertes visuelles** :
- Stock critique < 500 (rouge)
- Stock bas < 1000 (orange)
- Indicateurs de danger/warning/info/call

**Graphiques de performance (Sprint E - US 10.3)** :
- `AppelsParHeureChart` - BarChart : Appels par heure sur 24h (recharts)
- `TauxAboutiChart` - PieChart : Taux d'abouti vs non aboutis (recharts)
- `DureeMoyenneChart` - LineChart : Durée moyenne des appels sur 7 jours (recharts)
- `TopRaisonsChart` - BarChart horizontal : Top 5 raisons d'échec (recharts)

**Endpoints Backend pour graphiques** :
- `GET /supervision/graphiques/all` - Toutes les stats en une requête
- `GET /supervision/graphiques/appels-par-heure?id_campagne=X` - Appels par heure
- `GET /supervision/graphiques/taux-abouti?id_campagne=X&date_debut=Y&date_fin=Z` - Taux d'abouti
- `GET /supervision/graphiques/duree-moyenne?id_campagne=X` - Durée moyenne 7j
- `GET /supervision/graphiques/top-raisons?id_campagne=X&date_debut=Y&date_fin=Z` - Top 5 raisons

**Hook personnalisé** :
- `useGraphiques(idCampagne?, refreshInterval?)` - Hook avec polling 60 secondes
- Retourne : `{ stats, isLoading, error, refresh }`
- Rafraîchissement automatique toutes les 60s par défaut

---

## 📋 Patterns de Code Réutilisables

### Pattern Tableau avec Badges

```scss
.component__table-wrapper {
  @include mixins.card(12px, light);
  overflow-x: auto;
}

.component__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th {
    text-align: left;
    padding: 0.85em 1em;
    font-weight: 600;
    color: vars.$fontColorSecondary;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid vars.$borderColor;
    white-space: nowrap;
  }

  td {
    padding: 0.85em 1em;
    border-bottom: 1px solid vars.$borderColor;
    vertical-align: middle;
    white-space: nowrap;
  }

  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover { background: vars.$greyBackground; }
}
```

### Pattern Badges Standardisés

```scss
.component__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0.25em 0.6em;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
  white-space: nowrap;

  &--ok { background: #dcfce7; color: #16a34a; }
  &--missing { background: #fef9c3; color: #a16207; }
  &--inactive { background: vars.$greyBackground; color: vars.$fontColorSecondary; }

  &--direction  { background: #ede9fe; color: #6d28d9; }
  &--commercial { background: #dcfce7; color: #15803d; }
  &--support    { background: #dbeafe; color: #1d4ed8; }
  &--rh         { background: #fce7f3; color: #be185d; }
  &--technique  { background: #ffedd5; color: #c2410c; }
  &--adv        { background: #fef9c3; color: #a16207; }
  &--autre      { background: vars.$greyBackground; color: vars.$fontColorSecondary; }
}
```

### Pattern Boutons d'Action Inline

```scss
.component__btn-edit,
.component__btn-deactivate,
.component__btn-view {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background vars.$transitionSmooth;
}

.component__btn-view {
  background: #e0e7ff;
  color: #4f46e5;
  &:hover { background: #c7d2fe; }
}

.component__btn-edit {
  background: #e0f2fe;
  color: #0284c7;
  &:hover { background: #bae6fd; }
}

.component__btn-deactivate {
  background: #fee2e2;
  color: #dc2626;
  &:hover { background: #fecaca; }
}
```

---

## 🔐 Sécurité Frontend

### CSRF Service

**Fichier** : `src/utils/services/csrfService.ts`

```typescript
class CSRFService {
  private token: string | null = null;
  private tokenPromise: Promise<string> | null = null;

  async getToken(): Promise<string> {
    if (this.token) return this.token;
    if (this.tokenPromise) return this.tokenPromise;

    this.tokenPromise = this.fetchToken();
    return this.tokenPromise;
  }

  private async fetchToken(): Promise<string> {
    const response = await axios.get('/api/csrf-token');
    this.token = response.data.data.token;
    this.tokenPromise = null;
    return this.token!;
  }

  clearToken(): void {
    this.token = null;
    this.tokenPromise = null;
  }
}
```

### Pattern Requête Sécurisée

```typescript
export const postFormDataRequest = async <R>(
  url: string,
  formData: FormData,
): Promise<AxiosResponse<R>> => {
  try {
    const csrfToken = await csrfService.getToken();
    
    const token = localStorage.getItem('authToken');
    const config: Record<string, unknown> = {
      headers: {
        'X-CSRF-TOKEN': csrfToken,
      }
    };
    
    if (token) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
    
    return await axios.post<R>(url, formData, config);
  } catch (error) {
    console.error("Erreur in postFormDataRequest:", error);
    throw error;
  }
};
```

---

## ⚠️ Conventions et Règles Critiques

### TypeScript Strict

- **Aucun `any` dans le code** — Toujours typer explicitement
- Chaque fichier TSX doit avoir un ID unique basé sur le nom du fichier
- Exemple: `DashboardPage.tsx` → `<main id="dashboardPage">`

### SCSS Mobile First

- **Développement principal** : Smartphone (375px base)
- **Responsive** : Tablette (`@media (min-width: $tabletWidth)`) et Desktop (`@media (min-width: $desktopWidth)`)
- **Layout** : Flexbox uniquement, pas de Grid
- **Espacements** : `gap` sur containers, éviter margins directionnelles
- **Imbrication** : Trois niveaux de sélecteurs maximum
- **Sélecteurs** : Aucune esperluette `&`; écrire les classes, états et pseudo-classes explicitement

### Dimensions

- **Blocks/layouts** : Privilégier `em` au lieu de `px`
- **Bordures et radius** : Toujours utiliser `px` (border, border-radius, etc.)
- **Viewport** : Utiliser `dvh/dvw` au lieu de `vh/vw`

### Sélecteurs BEM

**Règle critique** : Toujours utiliser des sélecteurs de classe explicites sous un ID racine

```scss
// ✅ CORRECT
#agentDetails {
  .agentDetails__container { /* ... */ }
}

// ❌ INCORRECT
#agentDetails {
  &__container { /* ... */ }  // Génère #agentDetails__container
}
```

---

## 📦 Dépendances Clés

| Package | Usage |
|---------|-------|
| React | Framework frontend |
| TypeScript | Typage strict |
| Vite | Build tool |
| React Router | Navigation |
| Axios | HTTP client |
| React Select | Sélecteurs avancés |
| React Big Calendar | Calendrier (Agenda ANTL) |
| React Color | Picker couleur hex (SketchPicker pour employés) |
| React PDF | Visualisation PDF |
| AOS | Animations au scroll |
| React Icons | Iconographie |
| SASS | Styles préprocesseur |

---

## 📝 Clause de Mise à Jour

### Quand mettre à jour ce fichier

Ce fichier AGENTS.md doit être mis à jour dans les cas suivants :

1. **Nouvelle vue/composant créé** :
   - Ajouter le chemin dans la structure des dossiers
   - Décrire le pattern utilisé si réutilisable
   - Noter les dépendances spécifiques

2. **Nouveau service API ajouté** :
   - Documenter l'endpoint et sa méthode HTTP
   - Décrire le format de requête/réponse
   - Noter les permissions requises

3. **Nouveau hook/context créé** :
   - Expliquer son usage et paramètres
   - Donner un exemple d'utilisation
   - Noter les dépendances internes

4. **Changement de design system** :
   - Mettre à jour les variables SCSS documentées
   - Ajouter les nouveaux mixins
   - Mettre à jour les exemples de code

5. **Changement de structure de route** :
   - Mettre à jour la liste des routes
   - Noter les changements de navigation
   - Documenter les nouveaux patterns de routing

6. **Mise à jour de dépendances** :
   - Noter les nouvelles versions majeures
   - Documenter les breaking changes
   - Mettre à jour les exemples de code si nécessaire

### Tests de non-régression

- `npm run test:unit` couvre les helpers, hooks et contrats isolés.
- `npm run test:e2e` couvre les orchestrations et workflows sans navigateur.
- `npm run test:browser` exécute les parcours React réels avec Playwright.
- Toute modification d'un parcours critique (navigation, réservation, courrier/email, import produit, détail prospect, lead ou facturation) doit conserver ou étendre le scénario Playwright correspondant.
- Les appels réseau des tests navigateur sont interceptés avec des contrats réalistes et les mutations métier sont vérifiées sur leur payload exact.
- Après une mutation réussie, l'état React doit refléter immédiatement la réponse API ; l'affichage d'une notification ne doit pas retarder la mise à jour de la vue.
- `playwright-report/` et `test-results/` sont des artefacts locaux et ne doivent jamais être commités.

### Comment mettre à jour

1. Ajouter une entrée dans le tableau d'historique en bas du fichier
2. Modifier les sections concernées
3. Maintenir la cohérence avec les autres fichiers AGENTS.md (script, olympe)
4. Vérifier que les exemples de code sont toujours valides

---

## 📝 Historique

| Date | Modification | Auteur |
|------|--------------|--------|
| 2026-07-18 | Ajout des tests navigateur Playwright sur les parcours critiques et synchronisation immédiate du détail prospect après modification | AI Agent |
| 2026-05-20 | **Refactor "Booking salle de production" → "Agenda ANTL"** : Couleur par employé (SketchPicker), chevauchement RDV autorisé, champs personne_externe/description, renommage view `/home` | AI Agent |
| 2026-04-25 | Contexte métier global : rôles USV/Script, flux agent complet, vente sans CB | AI Agent |
| 2026-04-24 | Sprint E : Graphiques supervision USV (Recharts) + Endpoints backend stats | AI Agent |
| 2026-04-23 | Ajout Sprint C terminé (backend+script uniquement, USV non impacté) | AI Agent |
| 2026-04-23 | Ajout structure complète, services API, patterns réutilisables | AI Agent |
| 2026-04-22 | Création AGENTS.md avec design system USV | AI Agent |
