import type { ReactElement } from 'react';
import { IoArrowBack, IoSave } from 'react-icons/io5';
import Select from 'react-select';
import type { PosteFormViewModel } from '../../../hooks/index.ts';

// constants
import { TYPE_OPTIONS, COLOR_PALETTE } from '../../../utils/constants/index.ts';
import { SECTIONS_CONFIG } from '../../../utils/scripts/index.ts';

import { BackToTop, Button, Header, SubNav } from '../index.ts';

interface PosteFormContentProps { viewModel: PosteFormViewModel; }

export function PosteFormContent({ viewModel }: PosteFormContentProps): ReactElement {
  const {
    form, setForm, isEdit, isLoading, isFetching,
    error, success, handleChange, handleSelectChange,
    togglePermissionSection, togglePermissionSubsection, handleSubmit, navigateBack,
  } = viewModel;

  if (isFetching) {
    return (
      <div id="posteForm">
        <Header /><SubNav />
        <main><div className="posteForm__loading">Chargement...</div></main>
      </div>
    );
  }

  return (
    <div id="posteForm">
      <Header />
      <SubNav />
      <main>
        <div className="posteForm__container">
          <div className="posteForm__header">
            <Button style="back" onClick={navigateBack}>
              <IoArrowBack /> Retour
            </Button>
            <h1>{isEdit ? 'Modifier le poste' : 'Nouveau poste'}</h1>
          </div>

          {error   && <div className="posteForm__error">{error}</div>}
          {success && <div className="posteForm__success">{success}</div>}

          <form className="posteForm__form" onSubmit={handleSubmit}>
            <div className="posteForm__field">
              <label htmlFor="libelle_poste">Libellé *</label>
              <input
                id="libelle_poste" name="libelle_poste" type="text"
                value={form.libelle_poste} onChange={handleChange}
                required disabled={isLoading}
              />
            </div>

            <div className="posteForm__row">
              <div className="posteForm__field">
                <label>Catégorie</label>
                <Select
                  inputId="type_poste"
                  options={TYPE_OPTIONS}
                  value={TYPE_OPTIONS.find(o => o.value === form.type_poste) ?? null}
                  onChange={opt => handleSelectChange('type_poste', opt ? opt.value : '')}
                  isDisabled={isLoading}
                  isClearable
                  placeholder="— Sélectionner —"
                  noOptionsMessage={() => 'Aucun résultat'}
                  classNamePrefix="reactSelect"
                />
              </div>
              <div className="posteForm__field">
                <label htmlFor="salaire_base">Salaire de base (€)</label>
                <input
                  id="salaire_base" name="salaire_base" type="number" min="0" step="0.01"
                  value={form.salaire_base} onChange={handleChange}
                  placeholder="ex: 2200" disabled={isLoading}
                />
              </div>
            </div>

            <div className="posteForm__field">
              <label>Couleur du badge</label>
              <div className="posteForm__swatches">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c.bg}
                    type="button"
                    className={`posteForm__swatch${form.couleur === c.bg ? ' posteForm__swatch--selected' : ''}`}
                    style={{ background: c.bg, color: c.text }}
                    onClick={() => setForm(prev => ({ ...prev, couleur: prev.couleur === c.bg ? '' : c.bg }))}
                    title={c.label}
                    disabled={isLoading}
                  >
                    <span className="posteForm__swatch-preview">{form.libelle_poste || c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="posteForm__field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description" name="description"
                value={form.description} onChange={handleChange}
                rows={3} disabled={isLoading}
                placeholder="Description du poste..."
              />
            </div>

            <div className="posteForm__field permissions-section">
              <label>Permissions et accès aux menus</label>
              <div className="permissions-grid">
                {SECTIONS_CONFIG.map(section => {
                  const hasSubsections = section.subsections.length > 0;
                  const isSectionEnabled = !!form.permissions[section.id]?.enabled;
                  const allowedSubsections = form.permissions[section.id]?.subsections || [];

                  return (
                    <div 
                      key={section.id} 
                      className={`permission-card ${isSectionEnabled ? 'permission-card--enabled' : ''}`}
                    >
                      <div className="permission-card-header">
                        <span className="permission-card-name">{section.name}</span>
                        <label className="permission-toggle">
                          <input
                            type="checkbox"
                            checked={isSectionEnabled}
                            onChange={() => togglePermissionSection(section.id)}
                            disabled={isLoading}
                          />
                          <span className="permission-toggle-slider"></span>
                        </label>
                      </div>

                      {hasSubsections && isSectionEnabled && (
                        <div className="permission-card-body">
                          <span className="permission-sub-label">Sous-applications accessibles :</span>
                          <div className="permission-pills">
                            {section.subsections.map(sub => {
                              const isSubEnabled = allowedSubsections.includes(sub.id);
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  className={`permission-pill ${isSubEnabled ? 'permission-pill--active' : ''}`}
                                  onClick={() => togglePermissionSubsection(section.id, sub.id)}
                                  disabled={isLoading}
                                >
                                  {sub.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {!hasSubsections && isSectionEnabled && (
                        <div className="permission-card-body">
                          <span className="permission-full-access">Accès complet à la section</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="posteForm__actions">
              <button type="button" className="posteForm__btn-cancel" onClick={navigateBack} disabled={isLoading}>
                Annuler
              </button>
              <button type="submit" className="posteForm__btn-save" disabled={isLoading}>
                <IoSave />
                {isLoading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}
