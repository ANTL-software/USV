# Configuration des Environnements - ANTL

## Vue d'ensemble

L'application ANTL utilise un système de basculement automatique entre les environnements de développement et production basé sur la détection du hostname et du port.

## Détection Automatique

### Environnement de Développement
- **Hostname**: `localhost` ou `127.0.0.1`
- **Ports**: `5173`, `5174`, `5175` (Vite dev server)
- **Backend**: `http://localhost:8800/api`

### Environnement de Production
- **Hostname**: Tous les autres hostnames
- **Backend**: `https://ndecrolympe.duckdns.org/api`

## Configuration

### Détection Automatique
L'application détecte automatiquement l'environnement sans configuration supplémentaire :
- **Développement** : `localhost:5173-5175` → `http://localhost:8800/api`  
- **Production** : Autres domaines → `https://ndecrolympe.duckdns.org/api`

### Fichier `.env`
```env
# Configuration Mistral AI (seule variable nécessaire)
VITE_MISTRAL_API_KEY=your_api_key
```

## Utilisation

### Fonctions Utilitaires

```typescript
import { getApiBaseUrl, getEnvironment, isOnProduction } from './utils/scripts/utils';

// Récupérer l'URL du backend selon l'environnement
const apiUrl = getApiBaseUrl();

// Déterminer l'environnement actuel
const env = getEnvironment(); // 'development' | 'production'

// Vérifier si on est en production
const isProd = isOnProduction(); // boolean
```

### Logs Automatiques

Au démarrage de l'application, des informations sur l'environnement sont automatiquement affichées dans la console :

```
🌍 Configuration Environnement
Environnement: development
Hostname: localhost
Port: 5173
API Backend: http://localhost:8800/api
```

## Développement Local

### Prérequis
1. Backend Olympe démarré sur `http://localhost:8800`
2. Frontend démarré avec `npm run dev`

### Commandes
```bash
# Démarrer le frontend en développement
npm run dev

# Démarrer le backend (dans le dossier olympe)
npm start
```

### Vérification
- Ouvrir la console développeur
- Vérifier que les logs montrent "Mode développement détecté"
- Vérifier que l'API Backend pointe vers localhost:8800

## Production

### Déploiement
En production (Vercel), l'application détecte automatiquement l'environnement et utilise l'API de production.

### URLs de Production
- **Frontend**: `https://antl-usv.vercel.app`
- **Backend**: `https://ndecrolympe.duckdns.org/api`

## Dépannage

### Backend Local Non Accessible
1. Vérifier que le backend Olympe est démarré
2. Vérifier que le port 8800 est libre
3. Vérifier les logs de la console pour confirmer l'URL utilisée

### Environnement Non Détecté
1. Vérifier le hostname et port dans la console
2. S'assurer que Vite démarre sur les ports 5173-5175
3. Vérifier que les URLs codées en dur correspondent à votre setup

### Tests de Configuration
```typescript
// Activer les tests d'environnement (en dev uniquement)
(window as any).__TEST_ENV__ = true;
```

## Structure des Fichiers

```
src/
├── utils/
│   └── scripts/
│       ├── utils.ts              # Fonctions d'environnement
│       └── testEnvironment.ts    # Tests de configuration
├── API/
│   └── APICalls.ts              # Configuration Axios automatique
└── App.tsx                      # Initialisation des logs
```

## Sécurité

- Les variables sensibles (clés API) sont dans `.env` (ignoré par Git)
- Les URLs d'API sont détectées automatiquement selon l'environnement
- La détection d'environnement empêche l'usage accidentel de prod en dev