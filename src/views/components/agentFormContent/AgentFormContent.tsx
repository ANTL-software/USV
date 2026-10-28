import type { ReactElement } from 'react';
import { IoArrowBack, IoSave } from 'react-icons/io5';
import Select from 'react-select';
import type { AgentFormViewModel } from '../../../hooks/index.ts';
import { AddressAutocomplete } from '../addressAutocomplete/index.ts';
import { BackToTop, Button, ColorPicker, Header, PasswordStrengthIndicator, SubNav } from '../index.ts';

interface AgentFormContentProps { viewModel: AgentFormViewModel; }

const formatSalaryLevel = (niveau: { numero: number } | undefined): string => (
  niveau?.numero === 1 ? 'Junior' : niveau?.numero === 2 ? 'Senior' : niveau?.numero === 3 ? 'Expert' : ''
);

export function AgentFormContent({ viewModel }: AgentFormContentProps): ReactElement {
  const {
    form, setForm, existing,
    postes, niveauxPrime, isCommercial,
    isEdit, isLoading, isFetching,
    error, success,
    handleChange, handleSubmit, navigateBack, changeAddress, selectAddress,
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
                </div>
              </div>
              {isCommercial && (
                <div className="agentForm__row">
                  <div className="agentForm__prime-fields">
                    <div className="agentForm__field">
                      <label htmlFor="id_niveau_prime">Niveau</label>
                      <Select
                        inputId="id_niveau_prime"
                        options={[
                          { value: '', label: 'Aucun' },
                          ...niveauxPrime.map((niveau) => ({ value: String(niveau.id_niveau_prime), label: formatSalaryLevel(niveau) }))
                        ]}
                        value={form.id_niveau_prime ? { value: form.id_niveau_prime, label: formatSalaryLevel(niveauxPrime.find((niveau) => String(niveau.id_niveau_prime) === form.id_niveau_prime)) } : { value: '', label: 'Aucun' }}
                        onChange={opt => setForm(prev => ({ ...prev, id_niveau_prime: opt ? opt.value : '' }))}
                        isDisabled={isLoading}
                        isClearable
                        placeholder="— Sélectionner un palier —"
                        noOptionsMessage={() => 'Aucun palier trouvé'}
                        classNamePrefix="reactSelect"
                      />
                    </div>
                    <div className="agentForm__field">
                      <label htmlFor="objectif_prime">Objectif global 100 % (€)</label>
                      <input
                        id="objectif_prime"
                        name="objectif_prime"
                        type="number"
                        min="1"
                        step="1"
                        value={form.objectif_prime}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}
            </fieldset>

            <fieldset className="agentForm__fieldset">
              <legend>Adresse postale</legend>
              <div className="agentForm__field">
                <AddressAutocomplete id="employee-address" label="Adresse" value={form.adresse} onChange={changeAddress} onSelectAddress={selectAddress} disabled={isLoading} />
              </div>
              <div className="agentForm__field">
                <label htmlFor="complement_adresse">Complément d’adresse</label>
                <input id="complement_adresse" name="complement_adresse" maxLength={255} value={form.complement_adresse} onChange={handleChange} disabled={isLoading} placeholder="Bâtiment, appartement, étage…" />
              </div>
              <div className="agentForm__row">
                <div className="agentForm__field"><label htmlFor="code_postal">Code postal</label><input id="code_postal" name="code_postal" maxLength={10} value={form.code_postal} onChange={handleChange} disabled={isLoading} /></div>
                <div className="agentForm__field"><label htmlFor="ville">Ville</label><input id="ville" name="ville" maxLength={100} value={form.ville} onChange={handleChange} disabled={isLoading} /></div>
              </div>
              <div className="agentForm__field"><label htmlFor="pays">Pays</label><input id="pays" name="pays" maxLength={100} value={form.pays} onChange={handleChange} disabled={isLoading} /></div>
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
