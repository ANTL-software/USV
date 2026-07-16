import type { MouseEvent, ReactElement } from 'react';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import Select from 'react-select';
import type { GroupBase, StylesConfig } from 'react-select';

import type { MaterielListViewModel } from '../../../hooks/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import { TYPE_MATERIEL_OPTIONS } from '../../../utils/types/index.ts';
import type { TypeMateriel } from '../../../utils/types/index.ts';
import { Button, CreatableSelect } from '../index.ts';

interface MaterielFormModalProps {
  viewModel: MaterielListViewModel;
}

const typeSelectStyles = reactSelectStyles as StylesConfig<
  { value: TypeMateriel; label: string },
  false,
  GroupBase<{ value: TypeMateriel; label: string }>
>;

export function MaterielFormModal({ viewModel }: MaterielFormModalProps): ReactElement | null {
  if (!viewModel.modalOpen) return null;
  const stopPropagation = (event: MouseEvent): void => event.stopPropagation();
  const { form } = viewModel;

  return (
    <div className="materielList__overlay" onClick={viewModel.closeMaterielModal}>
      <div className={`materielList__modal ${viewModel.modalMode === 'edit' ? 'materielList__modal--large' : ''}`} onClick={stopPropagation}>
        <h2>{viewModel.modalMode === 'create' ? 'Ajouter un matériel' : 'Modifier le matériel'}</h2>
        <form onSubmit={viewModel.handleSubmit} className="materielList__form">
          <div className="materielList__formGrid">
            <div className="materielList__formRow">
              <div className="materielList__formGroup">
                <label>Nom de la machine *</label>
                <input type="text" value={form.nom_machine} onChange={(event) => viewModel.setFormField('nom_machine', event.target.value)} required placeholder="ex: Laptop-03-Salle-A" />
              </div>
              <div className="materielList__formGroup">
                <label>Marque</label>
                <CreatableSelect value={form.marque} onChange={(value) => viewModel.setFormField('marque', value)} options={viewModel.marques} placeholder="Sélectionner ou créer..." />
              </div>
            </div>

            <div className="materielList__formRow">
              <div className="materielList__formGroup">
                <label>Type</label>
                <Select
                  options={TYPE_MATERIEL_OPTIONS}
                  value={TYPE_MATERIEL_OPTIONS.find(({ value }) => value === form.type_materiel)}
                  onChange={(option) => { if (option) viewModel.setFormField('type_materiel', option.value); }}
                  isSearchable={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  styles={typeSelectStyles}
                />
              </div>
              <div className="materielList__formGroup">
                <label>Numéro de série</label>
                <input type="text" value={form.numero_serie} onChange={(event) => viewModel.setFormField('numero_serie', event.target.value)} placeholder="ex: SN-ABC12345" />
              </div>
            </div>

            <div className="materielList__formRow">
              <div className="materielList__formGroup">
                <label>Adresse MAC</label>
                <input type="text" value={form.adresse_mac} onChange={(event) => viewModel.setFormField('adresse_mac', event.target.value)} placeholder="ex: AA:BB:CC:DD:EE:FF" maxLength={17} />
              </div>
              <div className="materielList__formGroup">
                <label>RustDesk ID</label>
                <input type="text" value={form.rustdesk_id} onChange={(event) => viewModel.setFormField('rustdesk_id', event.target.value)} placeholder="ex: 123456789" />
              </div>
            </div>

            <div className="materielList__formRow">
              <div className="materielList__formGroup">
                <label>RustDesk Password (lifetime)</label>
                <div className="materielList__password-wrap">
                  <input type={viewModel.showPassword ? 'text' : 'password'} value={form.rustdesk_password} onChange={(event) => viewModel.setFormField('rustdesk_password', event.target.value)} placeholder="Mot de passe permanent" />
                  <button type="button" className="materielList__btn-eye" onClick={viewModel.togglePassword} tabIndex={-1}>{viewModel.showPassword ? <IoEyeOff /> : <IoEye />}</button>
                </div>
              </div>
              <div className="materielList__formGroup">
                <label>Notes</label>
                <textarea value={form.notes} onChange={(event) => viewModel.setFormField('notes', event.target.value)} rows={3} placeholder="Informations complémentaires..." />
              </div>
            </div>
          </div>

          {viewModel.modalMode === 'edit' && (
            <div className="materielList__historique">
              <h3>Historique des affectations</h3>
              {viewModel.isLoadingHistorique ? (
                <p className="materielList__historique-loading">Chargement...</p>
              ) : viewModel.historiqueRows.length === 0 ? (
                <p className="materielList__historique-empty">Aucune affectation enregistrée.</p>
              ) : (
                <table className="materielList__historique-table">
                  <thead><tr><th>Employé</th><th>Du</th><th>Au</th><th>État départ</th><th>État retour</th><th>Notes</th></tr></thead>
                  <tbody>
                    {viewModel.historiqueRows.map((row) => (
                      <tr key={row.id} className={row.isCurrent ? 'materielList__historique-row--active' : ''}>
                        <td>{row.employeeName}</td><td>{row.startDate}</td><td>{row.endDate || <span className="materielList__historique-actif">En cours</span>}</td>
                        <td>{row.initialState && row.initialStateLabel ? <span className={`materielList__etat materielList__etat--${row.initialState}`}>{row.initialStateLabel}</span> : '—'}</td>
                        <td>{row.returnState && row.returnStateLabel ? <span className={`materielList__etat materielList__etat--${row.returnState}`}>{row.returnStateLabel}</span> : '—'}</td>
                        <td className="materielList__historique-notes">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          <div className="materielList__modal-actions">
            <Button style="grey" onClick={viewModel.closeMaterielModal}>Annuler</Button>
            <Button style="gradient" type="submit" disabled={viewModel.isSaving}>{viewModel.isSaving ? 'Enregistrement...' : viewModel.modalMode === 'create' ? 'Ajouter' : 'Enregistrer'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
