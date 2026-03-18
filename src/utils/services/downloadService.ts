/**
 * Déclenche le téléchargement d'un Blob dans le navigateur.
 * Crée un lien temporaire, clique dessus, puis le révoque immédiatement.
 */
export const triggerBlobDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
