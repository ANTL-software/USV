# Solutions pour la compatibilité CSP - Affichage des fichiers

## Problème initial

En production, les PDFs et images ne se chargeaient pas dans la modal à cause du CSP (Content Security Policy) restrictif qui bloquait les blob URLs dans les iframes.

**Erreurs observées :**
- "Refused to frame 'blob:https://www.antl.app/...' because it violates the following Content Security Policy directive: "default-src 'self'""
- "Not allowed to load local resource: blob:..."

## Solutions implémentées

### 1. Stratégie en cascade pour l'affichage des fichiers

La fonction `handleViewPdf` utilise maintenant une approche en cascade :

1. **URL directe de l'API** (priorité 1) : Tente d'utiliser `/api/courriers/{id}/download`
2. **Data URL** (priorité 2) : Pour les fichiers ≤ 10MB 
3. **Blob URL** (fallback) : Pour les gros fichiers (nécessite CSP adapté)

### 2. Remplacement d'iframe par embed pour les PDFs

- Les PDFs utilisent maintenant `<embed>` au lieu d'`<iframe>`
- Meilleure compatibilité avec les CSP restrictifs
- Les images continuent d'utiliser `<img>`

### 3. Gestion optimisée des ressources

- Nettoyage automatique des blob URLs pour éviter les fuites mémoire
- Conservation des URLs directes et data URLs (pas besoin de nettoyage)

## Configuration CSP recommandée

### Option 1 : CSP strict (recommandé)
```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; object-src 'self';
```

### Option 2 : CSP avec support blob (si nécessaire pour gros fichiers)
```
Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; object-src 'self' blob:; frame-src 'self' blob:;
```

## Modifications côté backend (si nécessaire)

Pour que l'URL directe fonctionne, l'API doit :

1. Servir les fichiers avec les headers appropriés :
```javascript
app.get('/api/courriers/:id/download', (req, res) => {
  // Headers pour compatibilité CSP
  res.set({
    'Content-Type': 'application/pdf', // ou image/jpeg, etc.
    'Content-Disposition': 'inline; filename="document.pdf"',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-cache'
  });
  // Servir le fichier
});
```

2. Gérer les requêtes HEAD pour la vérification de disponibilité

## Types de fichiers supportés

- **Images** : JPG, JPEG, PNG, GIF, BMP, WEBP
- **PDFs** : Tous les fichiers PDF

## Avantages des solutions

1. **Sécurité** : Compatible avec CSP strict
2. **Performance** : Data URLs pour petits fichiers (pas de requête réseau supplémentaire)
3. **Flexibilité** : Fallback automatique selon la taille et la disponibilité
4. **Compatibilité** : Fonctionne avec ou sans modifications backend

## Tests recommandés

1. Tester avec différentes tailles de fichiers
2. Vérifier la compatibilité cross-browser
3. Tester avec CSP strict activé
4. Valider les performances avec gros fichiers