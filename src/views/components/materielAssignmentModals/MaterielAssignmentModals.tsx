import type { MouseEvent, ReactElement } from 'react';
import Select from 'react-select';
import type { GroupBase, StylesConfig } from 'react-select';

import type { MaterielListViewModel } from '../../../hooks/index.ts';
import type { MaterielEmployeOption } from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import { ETAT_MATERIEL_OPTIONS } from '../../../utils/types/index.ts';
import type { EtatMateriel } from '../../../utils/types/index.ts';
import { Button } from '../index.ts';

interface MaterielAssignmentModalsProps {
  viewModel: MaterielListViewModel;
}

const employeStyles = reactSelectStyles as StylesConfig<MaterielEmployeOption, false, GroupBase<MaterielEmployeOption>>;
const etatStyles = reactSelectStyles as StylesConfig<{ value: EtatMateriel; label: string }, false, GroupBase<{ value: EtatMateriel; label: string }>>;

export function MaterielAssignmentModals({ viewModel }: MaterielAssignmentModalsProps): ReactElement {
  const stopPropagation = (event: MouseEvent): void => event.stopPropagation();

  return (
    <>
      {viewModel.affectationTarget && (
        <div className="materielList__overlay" onClick={viewModel.closeAffectation}>
          <div className="materielList__modal" onClick={stopPropagation}>
            <h2>Affecter &quot;{viewModel.affectationTarget.nom_machine}&quot;</h2>
            <div className="materielList__form">
              <div className="materielList__formRow"><div className="materielList__formGroup">
                <label>Employé *</label>
                <Select<MaterielEmployeOption>
                  options={viewModel.employeOptions}
                  value={viewModel.employeOptions.find(({ value }) => value === viewModel.selectedEmployeId) ?? null}
                  onChange={(option) => viewModel.setSelectedEmployeId(option?.value ?? null)}
                  placeholder="Sélectionner un employé..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isSearchable
                  menuPortalTarget={document.body}
                  styles={employeStyles}
                />
              </div></div>
              <div className="materielList__formRow"><div className="materielList__formGroup">
                <label>État du matériel à la remise *</label>
                <Select
                  options={ETAT_MATERIEL_OPTIONS}
                  value={ETAT_MATERIEL_OPTIONS.find(({ value }) => value === viewModel.affectationEtat) ?? null}
                  onChange={(option) => viewModel.setAffectationEtat(option?.value ?? null)}
                  placeholder="Sélectionner un état..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  styles={etatStyles}
                />
              </div></div>
              <div className="materielList__formRow"><div className="materielList__formGroup">
                <label>Notes</label>
                <textarea value={viewModel.affectationNotes} onChange={(event) => viewModel.setAffectationNotes(event.target.value)} rows={2} placeholder="Remarques sur cette affectation..." />
              </div></div>
              <div className="materielList__modal-actions">
                <Button style="grey" onClick={viewModel.closeAffectation}>Annuler</Button>
                <Button style="gradient" onClick={() => { void viewModel.handleAffecter(); }} disabled={!viewModel.selectedEmployeId || !viewModel.affectationEtat || viewModel.isAffecting}>{viewModel.isAffecting ? 'Affectation...' : 'Affecter'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewModel.restitutionTarget && (
        <div className="materielList__overlay" onClick={viewModel.closeRestitution}>
          <div className="materielList__modal" onClick={stopPropagation}>
            <h2>Restituer &quot;{viewModel.restitutionTarget.nom_machine}&quot;</h2>
            {viewModel.restitutionEmployeeName && <p className="materielList__current-assign">Actuellement assigné à : <strong>{viewModel.restitutionEmployeeName}</strong></p>}
            <div className="materielList__form">
              <div className="materielList__formRow"><div className="materielList__formGroup">
                <label>État du matériel au retour *</label>
                <Select
                  options={ETAT_MATERIEL_OPTIONS}
                  value={ETAT_MATERIEL_OPTIONS.find(({ value }) => value === viewModel.restitutionEtat) ?? null}
                  onChange={(option) => viewModel.setRestitutionEtat(option?.value ?? null)}
                  placeholder="Sélectionner un état..."
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                  styles={etatStyles}
                />
              </div></div>
              <div className="materielList__modal-actions">
                <Button style="grey" onClick={viewModel.closeRestitution}>Annuler</Button>
                <Button style="gradient" onClick={() => { void viewModel.handleRestituer(); }} disabled={!viewModel.restitutionEtat || viewModel.isRestituting}>{viewModel.isRestituting ? 'Restitution...' : 'Confirmer la restitution'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
