// styles
import './agentForm.scss';

// hooks | library
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoSave } from 'react-icons/io5';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { useAgentForm } from '../../../hooks/useAgentForm';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import PasswordStrengthIndicator from '../../components/passwordStrengthIndicator/PasswordStrengthIndicator';
import ColorPicker from '../../../components/colorPicker/ColorPicker';

function AgentForm(): ReactElement {
  const navigate = useNavigate();
  const {
    form, setForm, existing, sipUri,
    postes, rangs, isEdit, isLoading, isFetching, isProvisioningSip,
    error, success, sipWarning,
    handleChange, handleProvisionSip, handleSubmit,
  } = useAgentForm();


  if (isFetching) {
    return (
      <div id="agentForm">
        <Header />
        <SubNav />
        <main><div className="agentForm__loading">Chargement...</div></main>
      </div>
    );
  }

  return (
    <div id="agentForm">
      <Header />
      <SubNav />
      <main>
        <div className="agentForm__container">
          <div className="agentForm__header">
            <Button style="back" onClick={() => navigate('/operations/employes')}>
              <IoArrowBack /> Retour
            </Button>
            <h1>{isEdit ? `Modifier ${existing?.prenom} ${existing?.nom}` : 'Nouvel agent'}</h1>
            {isEdit && existing && (
              <span className="agentForm__identifiant">
                Identifiant : <code>{existing.identifiant}</code>
              </span>
            )}
          </div>

          {error      && <div className="agentForm__error">{error}</div>}
          {success    && <div className="agentForm__success">{success}</div>}
          {sipWarning && (
            <div className="agentForm__sip-warning">
              <span>{sipWarning}</span>
              <button
                type="button"
                className="agentForm__btn-provision-sip"
                onClick={handleProvisionSip}
                disabled={isProvisioningSip}
              >
                {isProvisioningSip ? 'Provisionnement...' : 'Provisionner le SIP'}
              </button>
            </div>
          )}

          <form className="agentForm__form" onSubmit={handleSubmit}>
            <fieldset className="agentForm__fieldset">
              <legend>Informations personnelles</legend>
              <div className="agentForm__row">
                <div className="agentForm__field">
                  <label htmlFor="prenom">Prénom *</label>
                  <input id="prenom" name="prenom" type="text" value={form.prenom} onChange={handleChange} required disabled={isLoading} />
                </div>
                <div className="agentForm__field">
                  <label htmlFor="nom">Nom *</label>
                  <input id="nom" name="nom" type="text" value={form.nom} onChange={handleChange} required disabled={isLoading} />
                </div>
              </div>
              <div className="agentForm__row">
                <div className="agentForm__field">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} disabled={isLoading} />
                </div>
                <div className="agentForm__field">
                  <label htmlFor="telephone">Téléphone</label>
                  <input id="telephone" name="telephone" type="tel" value={form.telephone} onChange={handleChange} disabled={isLoading} />
                </div>
              </div>
              <div className="agentForm__row">
                <div className="agentForm__field">
                  <label htmlFor="date_embauche">Date d'embauche</label>
                  <input id="date_embauche" name="date_embauche" type="date" value={form.date_embauche} onChange={handleChange} disabled={isLoading} />
                </div>
                <div className="agentForm__field">
                  <label htmlFor="id_poste">Poste</label>
                  <Select
                    inputId="id_poste"
                    options={postes.map(p => ({ value: String(p.id_poste), label: p.libelle_poste }))}
                    value={form.id_poste ? { value: form.id_poste, label: postes.find(p => String(p.id_poste) === form.id_poste)?.libelle_poste ?? '' } : null}
                    onChange={opt => setForm(prev => ({ ...prev, id_poste: opt ? opt.value : '', id_rang_commercial: '' }))}
                    isDisabled={isLoading}
                    isClearable
                    placeholder="— Sélectionner un poste —"
                    noOptionsMessage={() => 'Aucun poste trouvé'}
                    classNamePrefix="reactSelect"
                  />
                  {postes.find(p => String(p.id_poste) === form.id_poste)?.type_poste === 'commercial' && (
                    <div className="agentForm__field" style={{ marginTop: '0.75em' }}>
                      <label htmlFor="id_rang_commercial">Rang commercial</label>
                      <Select
                        inputId="id_rang_commercial"
                        options={rangs.map(r => ({ value: String(r.id_rang), label: r.libelle }))}
                        value={form.id_rang_commercial ? { value: form.id_rang_commercial, label: rangs.find(r => String(r.id_rang) === form.id_rang_commercial)?.libelle ?? '' } : null}
                        onChange={opt => setForm(prev => ({ ...prev, id_rang_commercial: opt ? opt.value : '' }))}
                        isDisabled={isLoading}
                        isClearable
                        placeholder="— Sélectionner un rang —"
                        noOptionsMessage={() => 'Aucun rang trouvé'}
                        classNamePrefix="reactSelect"
                      />
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            <fieldset className="agentForm__fieldset">
              <legend>{isEdit ? 'Changer le mot de passe (laisser vide pour conserver)' : 'Mot de passe *'}</legend>
              <p className="agentForm__fieldset-hint">
                8 caractères minimum · 1 majuscule · 1 chiffre
              </p>
              <div className="agentForm__row">
                <div className="agentForm__field">
                  <label htmlFor="password">{isEdit ? 'Nouveau mot de passe' : 'Mot de passe'}</label>
                  <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required={!isEdit} disabled={isLoading} autoComplete="new-password" />
                  <PasswordStrengthIndicator password={form.password} />
                </div>
                <div className="agentForm__field">
                  <label htmlFor="password_confirm">Confirmer</label>
                  <input id="password_confirm" name="password_confirm" type="password" value={form.password_confirm} onChange={handleChange} required={!isEdit} disabled={isLoading} autoComplete="new-password" />
                  {form.password_confirm && form.password !== form.password_confirm && (
                    <p className="agentForm__field-error">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
              </div>
            </fieldset>

            <fieldset className="agentForm__fieldset">
              <legend>Agenda ANTL</legend>
              <p className="agentForm__fieldset-hint">
                Couleur pour les rendez-vous dans l'agenda (optionnel)
              </p>
              <div className="agentForm__field">
                <ColorPicker
                  color={form.couleur || null}
                  onChange={(color: string | null) => setForm(prev => ({ ...prev, couleur: color }))}
                  label="Couleur"
                />
              </div>
            </fieldset>

            {isEdit ? (
              <fieldset className="agentForm__fieldset agentForm__fieldset--sip">
                <legend>Configuration SIP</legend>
                {(existing?.sip_uri || sipUri) ? (
                  <p className="agentForm__fieldset-hint">
                    URI active : <code>{existing?.sip_uri || sipUri}</code>
                    <span className="agentForm__sip-sync-note"> — mot de passe synchronisé avec le mot de passe de connexion</span>
                  </p>
                ) : (
                  <div className="agentForm__sip-unprov">
                    <span>Aucun SIP configuré pour cet agent.</span>
                    <button
                      type="button"
                      className="agentForm__btn-provision-sip"
                      onClick={handleProvisionSip}
                      disabled={isProvisioningSip || isLoading}
                    >
                      {isProvisioningSip ? 'Provisionnement...' : 'Provisionner le SIP automatiquement'}
                    </button>
                  </div>
                )}
              </fieldset>
            ) : (
              <div className="agentForm__sip-info">
                Les credentials SIP seront provisionnés automatiquement sur SignalWire à la création.
              </div>
            )}

            <div className="agentForm__actions">
              <button type="button" className="agentForm__btn-cancel" onClick={() => navigate('/operations/employes')} disabled={isLoading}>
                Annuler
              </button>
              <button type="submit" className="agentForm__btn-save" disabled={isLoading}>
                <IoSave />
                {isLoading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer l\'agent'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const AgentFormWithAuth = WithAuth(AgentForm);
export default AgentFormWithAuth;
