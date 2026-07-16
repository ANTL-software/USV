import type { ReactElement } from 'react';
import { IoPencil, IoPersonAdd, IoReturnDownBack } from 'react-icons/io5';

import type { MaterielListViewModel } from '../../../hooks/index.ts';

interface MaterielTableProps {
  viewModel: MaterielListViewModel;
}

export function MaterielTable({ viewModel }: MaterielTableProps): ReactElement {
  if (viewModel.materielStore.isLoading) {
    return <div className="materielList__loading">Chargement...</div>;
  }

  return (
    <div className="materielList__table-wrapper">
      <table className="materielList__table">
        <thead><tr><th>Machine</th><th>Marque</th><th>Type</th><th>N° Série</th><th>Adresse MAC</th><th>RustDesk ID</th><th>Affecté à</th><th>Depuis</th><th>Notes</th><th>Actions</th></tr></thead>
        <tbody>
          {viewModel.tableRows.map((row) => (
            <tr key={row.id} className={!row.isActive ? 'materielList__row--inactive' : ''}>
              <td className="materielList__nom">{row.name}</td>
              <td>{row.brand}</td>
              <td><span className={`materielList__badge ${row.typeClassName}`}>{row.typeLabel}</span></td>
              <td><code>{row.serialNumber}</code></td>
              <td><code>{row.macAddress}</code></td>
              <td><code>{row.rustdeskId}</code></td>
              <td>{row.employeeName ? <span className="materielList__employe">{row.employeeName}</span> : <span className="materielList__libre">Libre</span>}</td>
              <td>{row.assignedSince}</td>
              <td className="materielList__notes">{row.notes}</td>
              <td className="materielList__actions">
                <button className="materielList__btn materielList__btn--edit" onClick={() => { void viewModel.openEdit(row.source); }} title="Modifier" type="button"><IoPencil /></button>
                {!row.isAssigned && <button className="materielList__btn materielList__btn--assign" onClick={() => viewModel.openAffectation(row.source)} title="Affecter à un employé" type="button"><IoPersonAdd /></button>}
                {row.isAssigned && <button className="materielList__btn materielList__btn--return" onClick={() => viewModel.openRestitution(row.source)} title="Restituer" type="button"><IoReturnDownBack /></button>}
              </td>
            </tr>
          ))}
          {viewModel.tableRows.length === 0 && <tr><td colSpan={10} className="materielList__empty">Aucun matériel enregistré</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
