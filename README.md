# 🔐 ANTL - Gestion Documentaire Sécurisée

Une application React PWA moderne pour la gestion complète de documents avec authentification sécurisée par cookies httpOnly.

## 🎯 Description

**ANTL** est une application de gestion documentaire complète spécialisée dans le suivi et la gestion des courriers. L'application offre une interface moderne, responsive et sécurisée avec des fonctionnalités PWA pour une utilisation optimale sur tous les appareils.

## ✨ Fonctionnalités

### 🔐 Authentification Sécurisée
- **JWT dans cookies httpOnly** - Protection XSS maximale avec SameSite=Strict
- **Protection CSRF automatique** - Tokens sécurisés sur toutes les requêtes critiques
- **Formulaires d'authentification** complets avec validation temps réel
- **Gestion de session** robuste avec contexte React et interceptors Axios
- **Protection des routes** avec HOC WithAuth
- **Déconnexion sécurisée** avec nettoyage des cookies côté serveur

### 📄 Gestion Complète des Documents
- **Upload sécurisé** : PDF, DOC, DOCX, JPEG, PNG jusqu'à 50MB
- **Métadonnées complètes** : Direction, émetteur, destinataire, département, type, priorité, dates
- **CRUD complet** : Création, lecture, modification, suppression
- **Recherche avancée** : Globale et par colonnes avec filtres
- **Téléchargements** : Individuels et téléchargements groupés en ZIP
- **Partage par email** : Envoi individuel et en lot avec notifications
- **Statistiques en temps réel** : Compteurs par direction, statut et tendances

### 📱 Progressive Web App (PWA)
- **Installation native** sur tous les appareils (mobile, tablette, desktop)
- **Mode hors ligne** avec service worker pour consultation des données
- **Notifications push** pour les mises à jour importantes
- **Interface adaptative** qui s'adapte au mode d'affichage (navigateur/app installée)
- **Détection de compatibilité** navigateur avec fallbacks gracieux

### 🎨 Interface Moderne et Responsive
- **Design Mobile-First** optimisé pour smartphones puis adapté tablettes/desktop
- **Navigation intuitive** : Header fixe, SubNav contextuelle, footer au scroll
- **Animations fluides** avec AOS (Animate On Scroll)
- **Indicateurs visuels** : Loader, modals, tooltips, feedbacks utilisateur
- **Accessibilité** : Contrôles clavier, contrastes élevés, lecteurs d'écran

## 🚀 Technologies

### Core Technologies
- **React 18** avec TypeScript strict (pas de `any`)
- **Vite** pour build ultra-rapide avec HMR
- **React Router v7** pour la navigation SPA
- **Sass/SCSS** avec architecture modulaire
- **PWA** avec Service Worker et Manifest

### Bibliothèques Spécialisées
- **Axios** pour les appels API avec interceptors sécurisés
- **React Select** pour sélecteurs avancés avec création d'options
- **AOS** pour animations au scroll performantes
- **React Icons** pour iconographie cohérente
- **DOMPurify** (côté backend) pour sanitisation XSS

### Architecture CSS
- **Variables SCSS** centralisées par thème
- **Mixins** pour la cohérence des layouts
- **Mobile-First** avec unités modernes (dvh, em)
- **ID-based encapsulation** pour éviter les conflits CSS

## 📁 Structure du Projet

```
src/
├── components/                    # Composants réutilisables
│   ├── authForm/                 # Hub d'authentification principal
│   ├── signInForm/               # Formulaire de connexion avec validation
│   ├── signUpForm/               # Formulaire d'inscription + indicateur force mdp
│   ├── passwordStrengthIndicator/ # Validation temps réel des mots de passe
│   ├── button/                   # Bouton personnalisable avec states
│   ├── modal/                    # Modal réutilisable
│   ├── loader/                   # Indicateur de chargement
│   ├── header/                   # Navigation principale fixe
│   ├── subNav/                   # Navigation contextuelle
│   ├── footer/                   # Footer qui apparaît au scroll
│   ├── creatableSelect/          # React-Select avec création d'options
│   ├── emailModal/               # Modal d'envoi d'emails
│   ├── pwaInstallButton/         # Installation PWA native
│   └── pwaStatus/                # Indicateur statut PWA
├── views/                        # Pages et vues principales
│   ├── home/                     # Dashboard avec accès rapide
│   ├── authPage/                 # Page d'authentification
│   └── courriers/                # Module gestion documentaire
│       ├── Courriers.tsx         # Hub principal avec statistiques
│       ├── listeCourriers/       # Liste paginée avec recherche
│       ├── nouveauCourrier/      # Upload + métadonnées
│       └── updateCourrier/       # Modification des métadonnées
├── context/                      # Gestion d'état globale
│   ├── user/                     # Authentification (UserContext + Provider)
│   └── courrier/                 # Documents (CourrierContext + Provider)
├── API/                          # Communication backend
│   ├── APICalls.ts               # Configuration Axios + interceptors sécurisés
│   ├── services/                 # Services métier
│   │   ├── auth.service.ts       # Login/register (cookies httpOnly)
│   │   ├── user.service.ts       # Profil utilisateur
│   │   └── courrier.service.ts   # CRUD documents + recherche + emails
│   └── models/                   # Interfaces TypeScript
├── utils/                        # Utilitaires et configuration
│   ├── middleware/               # WithAuth HOC pour protection routes
│   ├── services/                 # Services utilitaires
│   │   └── csrfService.ts        # Gestion tokens CSRF
│   ├── scripts/                  # Helpers et utilitaires
│   ├── styles/                   # Variables SCSS + mixins responsive
│   └── types/                    # Définitions TypeScript strictes
└── public/
    ├── manifest.json             # Configuration PWA
    └── sw.js                     # Service Worker
```

## 🎨 Design System

### Palette de Couleurs
**Palette principale (Gestion Documentaire)**
```scss
// Variables SCSS centralisées
$primary: #007bff;      // Bleu professionnel
$success: #28a745;      // Vert validation
$warning: #ffc107;      // Jaune attention
$danger: #dc3545;       // Rouge erreur
$info: #17a2b8;        // Bleu information
$light: #f8f9fa;       // Gris clair
$dark: #343a40;        // Gris foncé
```

**Couleurs contextuelles**
```scss
// États des documents
$entrant: #28a745;     // Vert pour courrier entrant
$sortant: #dc3545;     // Rouge pour courrier sortant
$interne: #007bff;     // Bleu pour courrier interne
$urgent: #ff6b47;      // Orange pour priorité urgente
```

### Responsive Design
- **Mobile** : Base de développement (< 768px)
- **Tablet** : 1024px+ avec `@media (min-width: $tabletWidth)`
- **Desktop** : 1440px+ avec `@media (min-width: $desktopWidth)`

### Unités Modernes
- **Layouts** : `em` pour les dimensions des blocs
- **Viewport** : `dvh`/`dvw` au lieu de `vh`/`vw`
- **Bordures** : `px` pour borders et border-radius
- **Header fixe** : 6dvh, **SubNav** : 4dvh

## 🛠️ Installation et Développement

### Prérequis
- Node.js (version 18+)
- npm

### Installation
```bash
# Cloner le projet
git clone [repository-url]

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build
```

### Scripts Disponibles
- `npm run dev` : Serveur de développement avec HMR
- `npm run build` : Build TypeScript + Vite optimisé
- `npm run lint` : Linting ESLint
- `npm run preview` : Prévisualisation du build

## 🔧 Architecture Technique

### 🔐 Sécurité Frontend
- **JWT cookies httpOnly** : Protection XSS avec SameSite=Strict
- **Protection CSRF** : Tokens automatiques sur requêtes critiques
- **Interceptors Axios** : Gestion auth/erreurs transparente
- **Protection des routes** : HOC WithAuth sur toutes les pages sensibles
- **Validation stricte** : Synchronisation client/serveur
- **Déconnexion sécurisée** : Nettoyage cookies côté serveur

### 📱 Architecture PWA
- **Service Worker** : Cache intelligent pour mode hors ligne
- **Manifest** : Configuration installation native
- **Détection capacités** : Fallbacks gracieux selon navigateur
- **Notifications** : Push notifications pour mises à jour
- **Responsive design** : Interface adaptative mobile/desktop

### 🎯 Gestion d'État
- **Context API** : UserContext + CourrierContext pour état global
- **Providers** : Injection de dépendances avec React Context
- **Services typés** : Couche abstraction API avec TypeScript strict
- **State synchrone** : Mise à jour temps réel des données

### 📝 Conventions de Code
- **TypeScript strict** : Zéro `any`, interfaces complètes
- **SCSS modulaire** : ID-based encapsulation (`#componentName`)
- **Mobile-First** : Base smartphone, responsive tablette/desktop
- **Flexbox only** : Layout moderne, pas de CSS Grid
- **Gap spacing** : Éviter margins, privilégier `gap` sur containers
- **Unités modernes** : `dvh`/`dvw` et `em` pour dimensions

## 📚 Pages et Fonctionnalités

### 🔐 `/auth` - Authentification
- **Connexion/Inscription** avec validation temps réel
- **Indicateur force mot de passe** dynamique
- **Gestion d'erreurs** contextuelles avec messages sécurisés
- **Auto-login** après inscription réussie

### 🏠 `/home` - Dashboard
- **Accueil** avec accès rapide aux fonctions principales
- **Interface adaptative** selon statut d'authentification
- **Navigation** vers module gestion documentaire

### 📄 `/mail` - Hub Documentaire
- **Statistiques temps réel** : Compteurs par direction/statut
- **Accès rapide** vers création, liste et recherche
- **Indicateurs visuels** état des documents

### 📋 `/mail/list` - Liste des Documents
- **Pagination performante** avec tri multi-colonnes
- **Recherche globale et par champs** avec filtres avancés
- **Actions groupées** : téléchargement ZIP, envoi email en lot
- **Prévisualisation** métadonnées avec actions rapides

### ➕ `/mail/new` - Création Document
- **Upload drag & drop** avec validation côté client
- **Métadonnées complètes** : émetteur, destinataire, département, etc.
- **Sélecteurs intelligents** avec création d'options à la volée
- **Validation synchronisée** client/serveur pour sécurité

### ✏️ `/mail/update/:id` - Modification
- **Édition métadonnées** sans rechargement fichier
- **Validation temps réel** des modifications
- **Historique des changements** (si implémenté)

## 🚀 Utilisation

### Installation et Démarrage
```bash
npm install && npm run dev
```

### Première utilisation
1. **Inscription** : Créer un compte avec mot de passe sécurisé
2. **Upload** : Ajouter vos premiers documents avec métadonnées
3. **Navigation** : Explorer la liste et les fonctions de recherche
4. **PWA** : Installer l'app en mode natif pour une expérience optimale

### Fonctionnalités Avancées
- **Mode hors ligne** : Consultation des documents cachés
- **Téléchargements groupés** : Sélection multiple avec export ZIP
- **Partage email** : Envoi sécurisé avec notifications
- **Recherche intelligente** : Filtres par colonnes et recherche globale

---

**🔐 ANTL** - Solution complète de gestion documentaire sécurisée avec PWA ! 📱✨