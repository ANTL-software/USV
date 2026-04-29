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
    const prodUrl = "https://api.antl.fr/api";
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
 * Retourne un message d'accueil contextuel selon l'heure, le jour et le prénom.
 */
export function getSalutation(prenom?: string, _heure?: number, _jour?: number): string {
  const now  = new Date();
  const h    = _heure !== undefined ? _heure : now.getHours();
  const jour = _jour  !== undefined ? _jour  : now.getDay();
  const p    = prenom ? ` ${prenom}` : "";

  if (h < 5)  return `Vous êtes couché·e très tard${p} !`;
  if (h < 9)  return `Belle matinée${p}, on attaque !`;
  if (h < 12) {
    if (jour === 1) return `Belle semaine en perspective${p} !`;
    if (jour === 4) return `Dernier grand jour de la semaine${p}, on y va !`;
    return `Bonjour${p} !`;
  }
  if (h < 14) return `Bon appétit${p} !`;
  if (h < 18) {
    if (jour === 4) return `Le weekend approche${p}, plus que quelques appels !`;
    return `Bon après-midi${p} !`;
  }
  if (h < 21) return `Bonne soirée${p} !`;
  return `Encore au bureau${p} ? Rentrez vous reposer !`;
}

/**
 * Logs des informations sur l'environnement au démarrage
 */
export const logEnvironmentInfo = (): void => {
  const env = getEnvironment();
  const apiUrl = getApiBaseUrl();

  console.group('🌍 Configuration Environnement');
  console.log('Environnement:', env);
  console.log('Hostname:', window.location.hostname);
  console.log('Port:', window.location.port);
  console.log('API Backend:', apiUrl);
  console.groupEnd();
};

export type SelectOption = { value: string; label: string };

/**
 * Transforme une liste d'items en options react-select.
 * @param items - Liste d'objets
 * @param getValue - Fonction pour extraire la valeur (sera convertie en string)
 * @param getLabel - Fonction pour extraire le label
 * @param filter - Filtre optionnel (retourne true pour inclure l'item)
 */
export function toSelectOptions<T>(
  items: T[],
  getValue: (item: T) => string | number,
  getLabel: (item: T) => string,
  filter?: (item: T) => boolean,
): SelectOption[] {
  const filtered = filter ? items.filter(filter) : items;
  return filtered.map(item => ({
    value: String(getValue(item)),
    label: getLabel(item),
  }));
}
