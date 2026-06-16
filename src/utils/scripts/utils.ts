export const isOnProduction = (): boolean => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port); // Ports de développement Vite
  return !(isDev && isDevPort);
};

export const getApiBaseUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port);

  if (isDev && isDevPort) {
    return "http://localhost:8800/api";
  }

  return "https://api.antl.fr/api";
};

/**
 * Construit l'URL complète pour une image de logo de campagne
 * @param logoPath - Chemin relatif du logo (ex: /uploads/campagne_logos/filename.png)
 * @returns URL complète de l'image (ex: http://localhost:8800/uploads/campagne_logos/filename.png)
 */
export const getCampagneLogoUrl = (logoPath: string | null | undefined): string | null => {
  console.log('🔍 [DEBUG] getCampagneLogoUrl called with:', logoPath);

  if (!logoPath) {
    console.log('❌ [DEBUG] logoPath is null/undefined');
    return null;
  }

  // Si le chemin est déjà une URL complète, le retourner tel quel
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    console.log('✅ [DEBUG] Full URL detected, returning as-is:', logoPath);
    return logoPath;
  }

  // Pour les chemins relatifs commençant par /uploads/, construire l'URL complète
  if (logoPath.startsWith('/uploads/')) {
    const apiBaseUrl = getApiBaseUrl();
    const serverUrl = apiBaseUrl.replace(/\/api$/, '');
    const fullUrl = `${serverUrl}${logoPath}`;
    console.log('🔧 [DEBUG] Constructing URL:', { apiBaseUrl, serverUrl, fullUrl });
    return fullUrl;
  }

  console.log('⚠️ [DEBUG] Unexpected path format, returning as-is:', logoPath);
  // Pour les chemins absolus (ancien format), retourner tel quel (ne fonctionnera pas en prod)
  return logoPath;
};

/**
 * Construit l'URL complète pour une photo d'un employé
 * @param photoPath - Chemin relatif de la photo (ex: /uploads/employe_photos/filename.png)
 * @returns URL complète de l'image (ex: http://localhost:8800/uploads/employe_photos/filename.png)
 */
export const getEmployePhotoUrl = (photoPath: string | null | undefined): string | null => {
  if (!photoPath) {
    return null;
  }

  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }

  if (photoPath.startsWith('/uploads/')) {
    const apiBaseUrl = getApiBaseUrl();
    const serverUrl = apiBaseUrl.replace(/\/api$/, '');
    return `${serverUrl}${photoPath}`;
  }

  return photoPath;
};

/**
 * Détermine l'environnement actuel de l'application
 */
export const getEnvironment = (): 'development' | 'production' => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port);
  return (isDev && isDevPort) ? 'development' : 'production';
};

export function getGreetingName(prenom?: string, userId?: number): string | undefined {
  if (userId === 5) {
    return 'Anthony McCallister';
  }

  return prenom;
}

/**
 * Retourne un message d'accueil contextuel selon l'heure, le jour et le prénom.
 */
export function getSalutation(prenom?: string, _heure?: number, _jour?: number): string {
  const now  = new Date();
  const h    = _heure !== undefined ? _heure : now.getHours();
  const jour = _jour  !== undefined ? _jour  : now.getDay();
  const mois = now.getMonth();
  const date = now.getDate();
  const p    = prenom ? ` ${prenom}` : "";

  // Bon anniversaire Sonia le 11 mai
  if (mois === 4 && date === 11) {
    return "Bon anniversaire Sonia !";
  }

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

/**
 * Formate un numéro de téléphone sous la forme xx.xx.xx.xx.xx
 * @param phone - Le numéro de téléphone à formater
 */
export const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return '—';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
};

/**
 * Nettoie un numéro de téléphone pour ne conserver que les chiffres (format bdd xxxxxxxxxx)
 * @param phone - Le numéro de téléphone à nettoyer
 */
export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};
