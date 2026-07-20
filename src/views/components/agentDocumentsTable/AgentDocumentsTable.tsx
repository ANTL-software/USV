import type { ReactElement } from 'react';
import { MdDelete, MdDownload, MdVisibility } from 'react-icons/md';
import type { EmployeeDetailsViewModel } from '../../../hooks/index.ts';
import { formatEmployeeDocumentDate } from '../../../utils/scripts/index.ts';

type AgentDocumentsTableProps = Pick<
  EmployeeDetailsViewModel,
  | 'documents'
  | 'documentsError'
  | 'documentsLoading'
  | 'handleDeleteDocument'
  | 'handleDownloadDocument'
  | 'handleViewDocument'
>;

export function AgentDocumentsTable({
  documents,
  documentsError,
  documentsLoading,
  handleDeleteDocument,
  handleDownloadDocument,
  handleViewDocument,
}: AgentDocumentsTableProps): ReactElement {
  let content: ReactElement;

  if (documentsLoading) {
    content = <p className="agentDetails__no-documents">Chargement des documents...</p>;
  } else if (documentsError) {
    content = <p className="agentDetails__no-documents agentDetails__no-documents--error">{documentsError}</p>;
  } else if (documents.length === 0) {
    content = <p className="agentDetails__no-documents">Aucun document trouvé pour cet employé.</p>;
  } else {
    content = (
      <div className="agentDetails__documents-table-wrapper">
        <table className="agentDetails__documents-table">
          <thead>
            <tr>
              <th>Nom du document</th>
              <th>Taille</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document.id} className="agentDetails__documents-row">
                <td className="agentDetails__documents-name">{document.name}</td>
                <td>{document.formattedSize}</td>
                <td>{formatEmployeeDocumentDate(document.date_created)}</td>
                <td className="agentDetails__documents-actions">
                  <button
                    type="button"
                    className="actionBtn view"
                    title="Visualiser"
                    onClick={() => void handleViewDocument(document)}
                  >
                    <MdVisibility />
                  </button>
                  <button
                    type="button"
                    className="actionBtn download"
                    title="Télécharger"
                    onClick={() => void handleDownloadDocument(document.id, document.filename)}
                  >
                    <MdDownload />
                  </button>
                  <button
                    type="button"
                    className="actionBtn delete"
                    title="Supprimer"
                    onClick={() => void handleDeleteDocument(document.id)}
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="agentDetails__documents">
      <h2>Documents liés</h2>
      {content}
    </section>
  );
}
