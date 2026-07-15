import React, { useState, useEffect, useRef } from 'react';

interface SimplePDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ pdfUrl, fileName }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const cspTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('SimplePDFViewer - pdfUrl:', pdfUrl);
    setIframeSrc(pdfUrl);
    setLoading(true);
    setError('');
    
    // Détecter les erreurs CSP plus rapidement
    cspTimeoutRef.current = setTimeout(() => {
      console.log('SimplePDFViewer - CSP timeout, probable blocage iframe');
      setError('CSP bloque l\'iframe, ouverture dans nouvel onglet recommandée');
      setLoading(false);
    }, 1500); // Réduit à 1.5s pour détecter plus vite
    
    return () => {
      if (cspTimeoutRef.current) {
        clearTimeout(cspTimeoutRef.current);
      }
    };
  }, [pdfUrl]);

  const handleIframeLoad = () => {
    console.log('SimplePDFViewer - iframe chargée avec succès');
    setLoading(false);
    setError('');
    // Annuler le timeout CSP si l'iframe se charge
    if (cspTimeoutRef.current) {
      clearTimeout(cspTimeoutRef.current);
    }
  };

  const handleIframeError = () => {
    console.log('SimplePDFViewer - erreur lors du chargement iframe');
    setLoading(false);
    setError('Impossible de charger le PDF');
  };

  if (loading) {
    return (
      <div className="pdf-viewer-loading">
        <p>Chargement du PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pdf-viewer-error">
        <p>Erreur lors du chargement du PDF</p>
        <p>Le fichier sera ouvert dans un nouvel onglet</p>
        <button 
          onClick={() => window.open(pdfUrl, '_blank')}
          className="pdf-error-button"
        >
          Ouvrir dans un nouvel onglet
        </button>
      </div>
    );
  }

  return (
    <div className="simple-pdf-viewer">
      <div className="pdf-iframe-container">
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          className="pdf-iframe"
          title={`Prévisualisation PDF: ${fileName}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
};

export default SimplePDFViewer;