import type { ReactElement } from 'react';
import Select from 'react-select';
import { FiCalendar, FiFile, FiFileText, FiMail, FiTag, FiUser } from 'react-icons/fi';
import { MdCancel, MdSave } from 'react-icons/md';
import type { UpdateCourrierViewModel } from '../../../hooks/index.ts';
import type { ICourrierFormData } from '../../../utils/types/index.ts';
import { DIRECTION_OPTIONS, PRIORITY_OPTIONS } from '../../../utils/constants/index.ts';
import { CreatableSelect } from '../index.ts';

interface CourrierUpdateFormProps {
  viewModel: UpdateCourrierViewModel;
}

export function CourrierUpdateForm({ viewModel }: CourrierUpdateFormProps): ReactElement {
  const {
    fieldOptions,
    formData,
    isLoading,
    isSubmitDisabled,
    navigateToList,
    setField,
    submit,
    trimField,
  } = viewModel;

  return (
    <section className="formSection updateCourrierFormSection">
      <form className="courrierForm" onSubmit={(event) => void submit(event)}>
        <div className="formGrid">
          <section className="formSection updateCourrierFormGroup">
            <h3 className="sectionTitle"><FiMail /> Informations principales</h3>
            <div className="formRow">
              <div className="formGroup">
                <label htmlFor="direction">Direction *</label>
                <Select
                  inputId="direction"
                  value={DIRECTION_OPTIONS.find((option) => option.value === formData.direction)}
                  onChange={(option) => {
                    if (option) setField('direction', option.value as ICourrierFormData['direction']);
                  }}
                  options={DIRECTION_OPTIONS}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Sélectionner..."
                  isSearchable={false}
                />
              </div>
              <div className="formGroup">
                <label htmlFor="kind">Type de courrier *</label>
                <CreatableSelect
                  id="kind"
                  name="kind"
                  value={formData.kind}
                  onChange={(value) => setField('kind', value)}
                  options={fieldOptions.kind.options}
                  placeholder="Sélectionner ou créer un type de courrier..."
                  isLoading={fieldOptions.kind.isLoading}
                />
              </div>
            </div>

            <div className="formRow">
              <div className="formGroup">
                <label htmlFor="customFileName"><FiFile /> Nom du fichier *</label>
                <input
                  type="text"
                  id="customFileName"
                  name="customFileName"
                  value={formData.customFileName}
                  onChange={(event) => setField('customFileName', event.target.value)}
                  onBlur={() => trimField('customFileName')}
                  placeholder="Nom du document (sans extension)"
                />
              </div>
            </div>

            <div className="formRow">
              <div className="formGroup">
                <label htmlFor="emitter"><FiUser /> Expéditeur</label>
                <CreatableSelect
                  id="emitter"
                  name="emitter"
                  value={formData.emitter}
                  onChange={(value) => setField('emitter', value)}
                  options={fieldOptions.emitter.options}
                  placeholder="Sélectionner ou créer un expéditeur..."
                  isLoading={fieldOptions.emitter.isLoading}
                />
              </div>
              <div className="formGroup">
                <label htmlFor="recipient"><FiUser /> Destinataire</label>
                <CreatableSelect
                  id="recipient"
                  name="recipient"
                  value={formData.recipient}
                  onChange={(value) => setField('recipient', value)}
                  options={fieldOptions.recipient.options}
                  placeholder="Sélectionner ou créer un destinataire..."
                  isLoading={fieldOptions.recipient.isLoading}
                />
              </div>
            </div>

            <div className="formRow">
              <div className="formGroup">
                <label htmlFor="department"><FiTag /> Service/Département *</label>
                <CreatableSelect
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={(value) => setField('department', value)}
                  options={fieldOptions.department.options}
                  placeholder="Sélectionner ou créer un service/département..."
                  isLoading={fieldOptions.department.isLoading}
                />
              </div>
              <div className="formGroup">
                <label htmlFor="priority"><FiTag /> Priorité</label>
                <Select
                  inputId="priority"
                  value={PRIORITY_OPTIONS.find((option) => option.value === formData.priority)}
                  onChange={(option) => {
                    if (option) setField('priority', option.value);
                  }}
                  options={PRIORITY_OPTIONS}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Sélectionner..."
                  isSearchable={false}
                />
              </div>
            </div>
          </section>

          <section className="formSection updateCourrierFormGroup">
            <h3 className="sectionTitle"><FiCalendar /> Dates</h3>
            <div className="formRow">
              <div className="formGroup">
                <label htmlFor="receptionDate">Date de réception</label>
                <input id="receptionDate" type="date" value={formData.receptionDate} onChange={(event) => setField('receptionDate', event.target.value)} />
              </div>
              <div className="formGroup">
                <label htmlFor="courrierDate">Date du courrier</label>
                <input id="courrierDate" type="date" value={formData.courrierDate} onChange={(event) => setField('courrierDate', event.target.value)} />
              </div>
            </div>
          </section>

          <section className="formSection updateCourrierFormGroup fullWidth">
            <h3 className="sectionTitle"><FiFileText /> Description</h3>
            <div className="formGroup">
              <label htmlFor="description">Notes et observations</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(event) => setField('description', event.target.value)}
                onBlur={() => trimField('description')}
                placeholder="Décrivez le contenu du courrier, les actions à prendre..."
                rows={4}
              />
            </div>
          </section>
        </div>

        <div className="formActions">
          <button type="button" className="btnCancel" onClick={navigateToList} disabled={isLoading}>
            <MdCancel /> Annuler
          </button>
          <button type="submit" className="btnSubmit" disabled={isSubmitDisabled}>
            <MdSave /> {isLoading ? 'Modification...' : 'Modifier'}
          </button>
        </div>
      </form>
    </section>
  );
}
