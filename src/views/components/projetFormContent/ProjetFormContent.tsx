import type { ReactElement } from 'react';
import { IoArrowBack, IoSave, IoTrash } from 'react-icons/io5';
import { BackToTop, Button, Header, SubNav } from '../index.ts';
import type { ProjetEditorViewModel } from '../../../hooks/index.ts';

interface ProjetFormContentProps { viewModel: ProjetEditorViewModel; }

export function ProjetFormContent({ viewModel }: ProjetFormContentProps): ReactElement {
  const {
    deleteProject,
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
    typeProjetOptions,
  } = viewModel;

  return (
    <div id="projetForm">
      <Header />
      <SubNav />
      <main>
        <div className="projetForm__container">
          {/* Header */}
          <div className="projetForm__header">
            <Button style="back" onClick={goBack}>
              <IoArrowBack />
              <span>Retour</span>
            </Button>
            <h1>{isEditing ? 'Modifier le projet' : 'Nouveau projet'}</h1>
            {isEditing && (
              <Button style="red" onClick={() => void deleteProject()}>
                <IoTrash />
                <span>Supprimer</span>
              </Button>
            )}
          </div>

          {/* Formulaire */}
          <form onSubmit={(event) => void submit(event)} className="projetForm__form">
            {/* Informations générales */}
            <div className="projetForm__section">
              <h2>Informations générales</h2>

              <div className="projetForm__field">
                <label htmlFor="titre">Titre *</label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                  placeholder="Titre du projet"
                />
              </div>

              <div className="projetForm__field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Description du projet..."
                />
              </div>

              <div className="projetForm__row">
                <div className="projetForm__field">
                  <label htmlFor="type_projet">Type de projet *</label>
                  <select
                    id="type_projet"
                    name="type_projet"
                    value={formData.type_projet}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {typeProjetOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="projetForm__field">
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

                <div className="projetForm__field">
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

            {/* Responsable et dates */}
            <div className="projetForm__section">
              <h2>Responsable et planning</h2>

              <div className="projetForm__field">
                <label htmlFor="id_pilote">Pilote du projet *</label>
                <select
                  id="id_pilote"
                  name="id_pilote"
                  value={formData.id_pilote}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionner un pilote...</option>
                  {employes.map((employe) => (
                    <option key={employe.id_employe} value={employe.id_employe}>
                      {employe.prenom} {employe.nom} - {employe.poste?.libelle_poste}
                    </option>
                  ))}
                </select>
              </div>

              <div className="projetForm__row">
                <div className="projetForm__field">
                  <label htmlFor="date_debut">Date de début</label>
                  <input
                    type="date"
                    id="date_debut"
                    name="date_debut"
                    value={formData.date_debut}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="projetForm__field">
                  <label htmlFor="date_fin">Date de fin</label>
                  <input
                    type="date"
                    id="date_fin"
                    name="date_fin"
                    value={formData.date_fin}
                    onChange={handleInputChange}
                    min={formData.date_debut}
                  />
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="projetForm__error">
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="projetForm__actions">
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
                <span>{isLoading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le projet'}</span>
              </Button>
            </div>
          </form>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}
