import React, { useState } from 'react';
import SimplePDFViewer from './SimplePDFViewer';
import ModernPDFViewer from './ModernPDFViewer';

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, fileName }) => {
  const [useModernViewer, setUseModernViewer] = useState<boolean>(true);

  // Essayer d'abord le viewer moderne, fallback vers iframe si problème
  if (useModernViewer) {
    return (
      <div>
        <ModernPDFViewer pdfUrl={pdfUrl} fileName={fileName} />
        <button 
          onClick={() => setUseModernViewer(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            fontSize: '12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Passer à iframe
        </button>
      </div>
    );
  }

  return (
    <div>
      <SimplePDFViewer pdfUrl={pdfUrl} fileName={fileName} />
      <button 
        onClick={() => setUseModernViewer(true)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '5px 10px',
          fontSize: '12px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Passer au viewer PDF
      </button>
    </div>
  );
};

export default PDFViewer;