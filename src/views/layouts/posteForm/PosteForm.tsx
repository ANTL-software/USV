// styles
import './posteForm.scss';

// hooks | library
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoSave } from 'react-icons/io5';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { usePosteForm } from '../../../hooks/usePosteForm';

// constants
import { TYPE_OPTIONS, COLOR_PALETTE } from '../../../utils/constants/poste.constants';
import { SECTIONS_CONFIG } from '../../../utils/scripts/permissions';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

function PosteForm(): ReactElement {
  const navigate = useNavigate();
  const {
    form, setForm, isEdit, isLoading, isFetching,
    error, success, handleChange, handleSelectChange,
    togglePermissionSection, togglePermissionSubsection, handleSubmit,
  } = usePosteForm();

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
            <Button style="back" onClick={() => navigate('/operations/postes')}>
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
              <button type="button" className="posteForm__btn-cancel" onClick={() => navigate('/operations/postes')} disabled={isLoading}>
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

const PosteFormWithAuth = WithAuth(PosteForm);
export default PosteFormWithAuth;
