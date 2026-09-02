export const isOnProduction = (): boolean => {
  if (typeof window === 'undefined') return false;
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port); // Ports de développement Vite
  return !(isDev && isDevPort);
};

export function formatPersonDisplayName(
  civilite?: string | null,
  prenom?: string | null,
  nom?: string | null,
): string {
  const normalizedFirstName = prenom?.trim().toLocaleLowerCase('fr-FR').replace(
    /(^|[\s-])\p{L}/gu,
    (letter) => letter.toLocaleUpperCase('fr-FR'),
  );
  const parts = [
    civilite?.trim(),
    normalizedFirstName,
    nom?.trim().toLocaleUpperCase('fr-FR'),
  ].filter((value): value is string => Boolean(value));

  return parts.join(' ') || '—';
}

export const isLoopbackApiUrl = (apiUrl: string): boolean => {
  try {
    return new Set(['localhost', '127.0.0.1', '::1', '[::1]']).has(new URL(apiUrl).hostname);
  } catch {
    return false;
  }
};

const alignLoopbackApiHostname = (apiUrl: string): string => {
  try {
    const parsedUrl = new URL(apiUrl);
    const pageHostname = window.location.hostname;
    const loopbackHostnames = new Set(['localhost', '127.0.0.1']);

    if (
      loopbackHostnames.has(parsedUrl.hostname)
      && loopbackHostnames.has(pageHostname)
    ) {
      parsedUrl.hostname = pageHostname;
    }

    return parsedUrl.toString().replace(/\/+$/, '');
  } catch {
    return apiUrl.replace(/\/+$/, '');
  }
};

export const getApiBaseUrl = (): string => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  // Si on est en production (non-local) mais que l'URL configurée pointe vers localhost,
  // on ignore cette configuration locale erronée.
  const isProd = isOnProduction();
  const isLocalUrl = configuredUrl ? isLoopbackApiUrl(configuredUrl) : false;

  if (configuredUrl && !(isProd && isLocalUrl)) {
    return isProd
      ? configuredUrl.replace(/\/+$/, '')
      : alignLoopbackApiHostname(configuredUrl);
  }

  if (isProd) {
    return "https://api.antl.fr/api";
  }

  // Conserver le même hostname loopback que Vite afin que les cookies
  // SameSite=Lax soient envoyés à l'API locale.
  return alignLoopbackApiHostname(configuredUrl || "http://localhost:8800/api");
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
 * Construit l'endpoint authentifié d'une photo employé.
 * Le chemin de stockage sert uniquement à détecter la présence d'une photo et
 * n'est jamais utilisé comme URL publique.
 */
export const getEmployePhotoUrl = (
  employeId: number | null | undefined,
  photoPath: string | null | undefined,
): string | null => {
  if (!employeId || !photoPath) {
    return null;
  }

  return `${getApiBaseUrl()}/employes/${employeId}/photo`;
};

export const getAntlConfigurationRibUrl = (): string => (
  `${getApiBaseUrl()}/antl-configuration/rib/file`
);

/**
 * Détermine l'environnement actuel de l'application
 */
export const getEnvironment = (): 'development' | 'production' => {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isDevPort = ["5173", "5174", "5175"].includes(window.location.port);
  return (isDev && isDevPort) ? 'development' : 'production';
};

export const isTestEnvironment = (): boolean => {
  return getEnvironment() === 'development';
};

export function getGreetingName(prenom?: string): string | undefined {
  return prenom;
}

export type SalutationAudience = 'commercial' | 'employe' | 'partenaire_externe';

/**
 * Retourne un message d'accueil contextuel selon l'heure, le jour et le prénom.
 */
export function getSalutation(
  prenom?: string,
  _heure?: number,
  _jour?: number,
  audience: SalutationAudience = 'employe',
): string {
  const now  = new Date();
  const h    = _heure !== undefined ? _heure : now.getHours();
  const jour = _jour  !== undefined ? _jour  : now.getDay();
  const mois = now.getMonth();
  const date = now.getDate();
  const p    = prenom ? ` ${prenom}` : "";

  // Bon anniversaire Sonia le 11 mai, sans interférer avec les autres comptes.
  if (mois === 4 && date === 11 && prenom?.trim().toLocaleLowerCase('fr-FR') === 'sonia') {
    return "Bon anniversaire Sonia !";
  }

  if (audience === 'partenaire_externe') {
    if (h < 12) return `Bonjour${p} !`;
    if (h < 18) return `Bon après-midi${p} !`;
    return `Bonsoir${p} !`;
  }

  if (h < 5)  return `Vous êtes couché·e très tard${p} !`;
  if (h < 9)  return `Belle matinée${p}, on attaque !`;
  if (h < 11) {
    if (jour === 1) return `Belle semaine en perspective${p} !`;
    if (jour === 4) return `Dernier grand jour de la semaine${p}, on y va !`;
    return `Bonjour${p} !`;
  }
  if (h < 13) return `Bon appétit${p} !`;
  if (h < 18) {
    if (jour === 4) {
      return audience === 'commercial'
        ? `Le weekend approche${p}, plus que quelques appels !`
        : `Le weekend approche${p}, la journée avance bien !`;
    }
    return `Bon après-midi${p} !`;
  }
  if (h < 21) return `Bonne soirée${p} !`;
  return `Encore au bureau${p} ? Rentrez vous reposer !`;
}

/**
 * Planifie le prochain rendu du message au seul moment où son contenu peut changer.
 */
export function getSalutationRefreshDelay(now: Date = new Date()): number {
  const transitionHours = [5, 9, 11, 12, 13, 18, 21];
  const nextTransition = new Date(now);
  const nextHour = transitionHours.find((hour) => hour > now.getHours());

  if (nextHour === undefined) {
    nextTransition.setDate(now.getDate() + 1);
    nextTransition.setHours(5, 0, 0, 0);
  } else {
    nextTransition.setHours(nextHour, 0, 0, 0);
  }

  return Math.max(1_000, nextTransition.getTime() - now.getTime() + 50);
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

export function prependSelectOption<Value extends string>(
  options: Array<{ value: Value; label: string }>,
  value: string,
  label: string,
): Array<{ value: Value | string; label: string }> {
  return [{ value, label }, ...options];
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

/**
 * Extrait un message sûr depuis une erreur inconnue.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  return error instanceof Error && error.message ? error.message : fallback;
};

export function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
