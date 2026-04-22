import React, { useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface ModernPDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const ModernPDFViewer: React.FC<ModernPDFViewerProps> = ({ pdfUrl }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Create plugins instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const handleDocumentLoad = () => {
    console.log('PDF loaded successfully with modern viewer');
    setLoading(false);
    setError('');
  };


  if (error) {
    return (
      <div className="pdf-viewer-error">
        <p>Erreur lors du chargement du PDF</p>
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
    <div className="modern-pdf-viewer">
      {loading && (
        <div className="pdf-viewer-loading">
          <p>Chargement du PDF...</p>
        </div>
      )}
      
      <div style={{ height: '80vh', minHeight: '600px' }}>
        <Worker workerUrl="/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
            onDocumentLoad={handleDocumentLoad}
          />
        </Worker>
      </div>
    </div>
  );
};

export default ModernPDFViewer;