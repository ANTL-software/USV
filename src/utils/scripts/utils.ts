export const isOnProduction = (): boolean => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port); // Ports de développement Vite
  return !(isDev && isDevPort);
};

export const getApiBaseUrl = (): string => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port); // Ports de développement Vite
  
  if (isDev && isDevPort) {
    // Environnement de développement - utiliser le backend local
    const devUrl = "http://localhost:8800/api";
    console.log('🔧 Mode développement détecté - Backend:', devUrl);
    return devUrl;
  } else {
    // Production - utiliser le backend de production
    const prodUrl = "https://api.antl.app/api";
    console.log('🚀 Mode production détecté - Backend:', prodUrl);
    return prodUrl;
  }
};

/**
 * Détermine l'environnement actuel de l'application
 */
export const getEnvironment = (): 'development' | 'production' => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port);
  return (isDev && isDevPort) ? 'development' : 'production';
};

/**
 * Génère la CSP (Content Security Policy) adaptée à l'environnement
 */
export const getCSP = (): string => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port);
  
  if (isDev && isDevPort) {
    // Environnement de développement - inclure localhost:8800
    return "frame-src 'self' http://localhost:8800; connect-src 'self' http://localhost:8800; img-src 'self' data: http://localhost:8800;";
  } else {
    // Production - utiliser uniquement le domaine de production
    return "frame-src 'self' https://api.antl.app; connect-src 'self' https://api.antl.app; img-src 'self' data: https://api.antl.app;";
  }
};

/**
 * Logs des informations sur l'environnement au démarrage
 */
export const logEnvironmentInfo = (): void => {
  const env = getEnvironment();
  const apiUrl = getApiBaseUrl();
  const csp = getCSP();
  
  console.group('🌍 Configuration Environnement');
  console.log('Environnement:', env);
  console.log('Hostname:', window.location.hostname);
  console.log('Port:', window.location.port);
  console.log('API Backend:', apiUrl);
  console.log('CSP:', csp);
  console.groupEnd();
};
