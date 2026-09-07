import type { ReactElement } from 'react';
import { IoArrowBack, IoSave } from 'react-icons/io5';
import Select from 'react-select';
import type { AgentFormViewModel } from '../../../hooks/index.ts';
import { AgentPrimeGauge, BackToTop, Button, ColorPicker, Header, PasswordStrengthIndicator, SubNav } from '../index.ts';

interface AgentFormContentProps { viewModel: AgentFormViewModel; }

export function AgentFormContent({ viewModel }: AgentFormContentProps): ReactElement {
  const {
    form, setForm, existing,
    postes, niveauxPrime, activePrimeAssignment, isCommercial, primeObjectiveUnit, primeStats,
    isEdit, isLoading, isFetching, isPrimeStatsLoading,
    error, success, primeStatsError,
    handleChange, handleSubmit, navigateBack,
  } = viewModel;


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
            <Button style="back" onClick={navigateBack}>
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
                    onChange={opt => setForm(prev => ({ ...prev, id_poste: opt ? opt.value : '', id_niveau_prime: '' }))}
                    isDisabled={isLoading}
                    isClearable
                    placeholder="— Sélectionner un poste —"
                    noOptionsMessage={() => 'Aucun poste trouvé'}
                    classNamePrefix="reactSelect"
                  />
                  {isCommercial && (
                    <div className="agentForm__prime-fields">
                      <div className="agentForm__field">
                      <label htmlFor="id_niveau_prime">Palier de prime</label>
                      <Select
                        inputId="id_niveau_prime"
                        options={[
                          { value: '', label: 'Aucun' },
                          ...niveauxPrime.map(niveau => ({ value: String(niveau.id_niveau_prime), label: niveau.libelle }))
                        ]}
                        value={form.id_niveau_prime ? { value: form.id_niveau_prime, label: niveauxPrime.find(niveau => String(niveau.id_niveau_prime) === form.id_niveau_prime)?.libelle ?? '' } : { value: '', label: 'Aucun' }}
                        onChange={opt => setForm(prev => ({ ...prev, id_niveau_prime: opt ? opt.value : '' }))}
                        isDisabled={isLoading}
                        isClearable
                        placeholder="— Sélectionner un palier —"
                        noOptionsMessage={() => 'Aucun palier trouvé'}
                        classNamePrefix="reactSelect"
                      />
                      </div>
                      <div className="agentForm__field">
                        <label htmlFor="objectif_prime">Objectif 100 % ({primeObjectiveUnit})</label>
                        <input
                          id="objectif_prime"
                          name="objectif_prime"
                          type="number"
                          min="1"
                          step="1"
                          value={form.objectif_prime}
                          onChange={handleChange}
                          disabled={isLoading || !activePrimeAssignment}
                          placeholder={activePrimeAssignment ? undefined : 'Affectez d’abord une campagne'}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            {isEdit && isCommercial && (
              <fieldset className="agentForm__fieldset">
                <legend>Suivi de la prime</legend>
                <p className="agentForm__fieldset-hint">
                  Vue affichée au commercial sur le Dashboard du Script pour sa campagne active.
                </p>
                {isPrimeStatsLoading && (
                  <div className="agentForm__prime-state">Chargement de la jauge...</div>
                )}
                {!isPrimeStatsLoading && primeStatsError && (
                  <div className="agentForm__prime-state agentForm__prime-state--error">{primeStatsError}</div>
                )}
                {!isPrimeStatsLoading && !primeStatsError && primeStats?.prime && (
                  <AgentPrimeGauge stats={primeStats} />
                )}
                {!isPrimeStatsLoading && !primeStatsError && !primeStats?.prime && (
                  <div className="agentForm__prime-state">
                    {activePrimeAssignment
                      ? 'Sélectionnez un palier de prime pour afficher la jauge.'
                      : 'Aucune campagne active : la jauge de prime n’est pas disponible.'}
                  </div>
                )}
              </fieldset>
            )}

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



            <div className="agentForm__actions">
              <button type="button" className="agentForm__btn-cancel" onClick={navigateBack} disabled={isLoading}>
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
