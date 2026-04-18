import { getApiBaseUrl, getEnvironment, isOnProduction } from './utils';

/**
 * Script de test pour vérifier la configuration d'environnement
 * À utiliser uniquement en développement
 */
export const testEnvironmentConfig = (): void => {
  console.group('🧪 Test Configuration Environnement');
  
  // Variables d'environnement
  console.log('Variables Vite:');
  console.log('- MODE:', import.meta.env.MODE);
  console.log('- DEV:', import.meta.env.DEV);
  console.log('- PROD:', import.meta.env.PROD);
  
  // Informations window.location
  console.log('\nWindow Location:');
  console.log('- hostname:', window.location.hostname);
  console.log('- port:', window.location.port);
  console.log('- origin:', window.location.origin);
  
  // Fonctions utilitaires
  console.log('\nFonctions utilitaires:');
  console.log('- getEnvironment():', getEnvironment());
  console.log('- isOnProduction():', isOnProduction());
  console.log('- getApiBaseUrl():', getApiBaseUrl());
  
  // Tests conditionnels
  console.log('\nTests:');
  if (getEnvironment() === 'development') {
    console.log('✅ Mode développement détecté correctement');
    if (getApiBaseUrl().includes('localhost')) {
      console.log('✅ Backend local configuré correctement');
    } else {
      console.warn('⚠️ Backend local non configuré - utilise:', getApiBaseUrl());
    }
  } else {
    console.log('✅ Mode production détecté correctement');
    if (!getApiBaseUrl().includes('localhost')) {
      console.log('✅ Backend production configuré correctement');
    } else {
      console.warn('⚠️ Backend production utilise localhost:', getApiBaseUrl());
    }
  }
  
  console.groupEnd();
};

// Auto-exécution en développement si la variable globale est définie
if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).__TEST_ENV__) {
  testEnvironmentConfig();
}