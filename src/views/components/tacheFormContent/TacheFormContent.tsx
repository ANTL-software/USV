import type { ReactElement } from 'react';
import { IoArrowBack, IoSave, IoTrash } from 'react-icons/io5';
import { BackToTop, Button, Header, SubNav } from '../index.ts';
import type { TacheEditorViewModel } from '../../../hooks/index.ts';

interface TacheFormContentProps { viewModel: TacheEditorViewModel; }

export function TacheFormContent({ viewModel }: TacheFormContentProps): ReactElement {
  const {
    deleteTask,
    employes,
    error,
    formData,
    goBack,
    handleInputChange,
    isEditing,
    isLoading,
    prioriteOptions,
    statutOptions,
    submit,
  } = viewModel;

  return (
    <div id="tacheForm">
      <Header />
      <SubNav />
      <main>
        <div className="tacheForm__container">
          {/* Header */}
          <div className="tacheForm__header">
            <Button style="back" onClick={goBack}>
              <IoArrowBack />
              <span>Retour</span>
            </Button>
            <h1>{isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}</h1>
            {isEditing && (
              <Button style="red" onClick={() => void deleteTask()}>
                <IoTrash />
                <span>Supprimer</span>
              </Button>
            )}
          </div>

          {/* Formulaire */}
          <form onSubmit={(event) => void submit(event)} className="tacheForm__form">
            {/* Informations générales */}
            <div className="tacheForm__section">
              <h2>Informations générales</h2>

              <div className="tacheForm__field">
                <label htmlFor="titre">Titre *</label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                  placeholder="Titre de la tâche"
                />
              </div>

              <div className="tacheForm__field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Description de la tâche..."
                />
              </div>

              <div className="tacheForm__row">
                <div className="tacheForm__field">
                  <label htmlFor="statut">Statut *</label>
                  <select
                    id="statut"
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    required
                  >
                    {statutOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tacheForm__field">
                  <label htmlFor="priorite">Priorité *</label>
                  <select
                    id="priorite"
                    name="priorite"
                    value={formData.priorite}
                    onChange={handleInputChange}
                    required
                  >
                    {prioriteOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Assignation et planning */}
            <div className="tacheForm__section">
              <h2>Assignation et planning</h2>

              <div className="tacheForm__field">
                <label htmlFor="id_assigne">Assigné à</label>
                <select
                  id="id_assigne"
                  name="id_assigne"
                  value={formData.id_assigne}
                  onChange={handleInputChange}
                >
                  <option value="">Non assigné</option>
                  {employes.map((employe) => (
                    <option key={employe.id_employe} value={employe.id_employe}>
                      {employe.prenom} {employe.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tacheForm__row">
                <div className="tacheForm__field">
                  <label htmlFor="date_echeance">Date d'échéance</label>
                  <input
                    type="date"
                    id="date_echeance"
                    name="date_echeance"
                    value={formData.date_echeance}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="tacheForm__field">
                  <label htmlFor="temps_esthe">Temps estimé (minutes)</label>
                  <input
                    type="number"
                    id="temps_esthe"
                    name="temps_esthe"
                    value={formData.temps_esthe}
                    onChange={handleInputChange}
                    min="0"
                    step="15"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="tacheForm__field">
                <label htmlFor="progression">Progression (%)</label>
                <input
                  type="range"
                  id="progression"
                  name="progression"
                  value={formData.progression}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="5"
                />
                <span className="tacheForm__progression-value">{formData.progression}%</span>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="tacheForm__error">
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="tacheForm__actions">
              <Button
                type="button"
                style="white"
                onClick={goBack}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                style="gradient"
                disabled={isLoading}
              >
                <IoSave />
                <span>{isLoading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer la tâche'}</span>
              </Button>
            </div>
          </form>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}
