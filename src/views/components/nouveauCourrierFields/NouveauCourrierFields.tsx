import type { ReactElement } from 'react';
import { FiCalendar, FiFileText, FiMail, FiTag, FiUser } from 'react-icons/fi';
import { MdUploadFile } from 'react-icons/md';
import Select from 'react-select';

import type { NouveauCourrierViewModel } from '../../../hooks/index.ts';
import {
  DIRECTION_OPTIONS,
  PRIORITY_OPTIONS,
} from '../../../utils/constants/index.ts';
import type { ISelectOption } from '../../../utils/constants/index.ts';
import { CreatableSelect } from '../index.ts';

interface NouveauCourrierFieldsProps {
  viewModel: NouveauCourrierViewModel;
}

export function NouveauCourrierFields({ viewModel }: NouveauCourrierFieldsProps): ReactElement {
  const { fieldOptions, formData } = viewModel;

  return (
    <>
      <section className="formSection">
        <h2 className="sectionTitle"><FiMail />Informations principales</h2>

        <div className="formRow">
          <div className="formGroup">
            <label htmlFor="direction">Direction *</label>
            <Select<ISelectOption>
              inputId="direction"
              value={DIRECTION_OPTIONS.find(({ value }) => value === formData.direction)}
              onChange={(option) => viewModel.handleSelectChange(option, 'direction')}
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
              onChange={(value) => viewModel.handleCreatableChange('kind', value)}
              options={fieldOptions.kind.options}
              placeholder="Sélectionner ou créer un type de courrier..."
              isLoading={fieldOptions.kind.isLoading}
            />
            {viewModel.kindSuggestion && <span className="analysisHint">{viewModel.kindSuggestion}</span>}
          </div>
        </div>

        <div className="formRow">
          <div className="formGroup">
            <label htmlFor="customFileName"><MdUploadFile />Nom du fichier *</label>
            <input
              type="text"
              id="customFileName"
              name="customFileName"
              value={formData.customFileName}
              onChange={viewModel.handleInputChange}
              onBlur={viewModel.handleInputBlur}
              placeholder="Nom personnalisé du fichier (sans extension)"
            />
            {viewModel.duplicateNameError && (
              <span className="duplicateErrorHint">{viewModel.duplicateNameError}</span>
            )}
          </div>
        </div>

        <div className="formRow">
          <div className="formGroup">
            <label htmlFor="emitter"><FiUser />Expéditeur</label>
            <CreatableSelect
              id="emitter"
              name="emitter"
              value={formData.emitter}
              onChange={(value) => viewModel.handleCreatableChange('emitter', value)}
              options={fieldOptions.emitter.options}
              placeholder="Sélectionner ou créer un expéditeur..."
              isLoading={fieldOptions.emitter.isLoading}
            />
          </div>
          <div className="formGroup">
            <label htmlFor="recipient"><FiUser />Destinataire</label>
            <CreatableSelect
              id="recipient"
              name="recipient"
              value={formData.recipient}
              onChange={(value) => viewModel.handleCreatableChange('recipient', value)}
              options={fieldOptions.recipient.options}
              placeholder="Sélectionner ou créer un destinataire..."
              isLoading={fieldOptions.recipient.isLoading}
            />
          </div>
        </div>

        <div className="formRow">
          <div className="formGroup">
            <label htmlFor="department"><FiTag />Service/Département *</label>
            <CreatableSelect
              id="department"
              name="department"
              value={formData.department}
              onChange={(value) => viewModel.handleCreatableChange('department', value)}
              options={fieldOptions.department.options}
              placeholder="Sélectionner ou créer un service/département..."
              isLoading={fieldOptions.department.isLoading}
            />
            {viewModel.departmentSuggestion && (
              <span className="analysisHint">{viewModel.departmentSuggestion}</span>
            )}
          </div>
          <div className="formGroup">
            <label htmlFor="priority"><FiTag />Priorité</label>
            <Select<ISelectOption>
              inputId="priority"
              value={PRIORITY_OPTIONS.find(({ value }) => value === formData.priority)}
              onChange={(option) => viewModel.handleSelectChange(option, 'priority')}
              options={PRIORITY_OPTIONS}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Sélectionner..."
              isSearchable={false}
            />
          </div>
        </div>
      </section>

      <section className="formSection">
        <h2 className="sectionTitle"><FiCalendar />Dates</h2>
        <div className="formRow">
          <div className="formGroup">
            <label htmlFor="receptionDate">Date de réception</label>
            <input
              type="date"
              id="receptionDate"
              name="receptionDate"
              value={formData.receptionDate}
              onChange={viewModel.handleInputChange}
            />
          </div>
          <div className="formGroup">
            <label htmlFor="courrierDate">Date du courrier *</label>
            <input
              type="date"
              id="courrierDate"
              name="courrierDate"
              value={formData.courrierDate}
              onChange={viewModel.handleInputChange}
            />
          </div>
        </div>
      </section>

      <section className="formSection fullWidth">
        <h2 className="sectionTitle"><FiFileText />Description</h2>
        <div className="formGroup">
          <label htmlFor="description">Notes et observations</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={viewModel.handleInputChange}
            onBlur={viewModel.handleInputBlur}
            placeholder="Décrivez le contenu du courrier, les actions à prendre..."
            rows={4}
          />
        </div>
      </section>
    </>
  );
}
