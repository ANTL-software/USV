import type { ReactElement } from "react";
import Select from "react-select";
import type { ProspectInjectionPageViewModel } from "../../../hooks/index.ts";
import type { TargetingChoice } from "../../../utils/types/index.ts";
import { createReactSelectStyles } from "../../../utils/styles/index.ts";
import { Button, ProspectTargetingCriterion } from "../index.ts";
const selectStyles = createReactSelectStyles<TargetingChoice, false>();
interface Props {
  viewModel: ProspectInjectionPageViewModel;
}
export function ProspectTargetingEditor({ viewModel: v }: Props): ReactElement {
  const disabled = v.busy || !v.catalog.fields.length;
  return (
    <section className="targetingBuilder" aria-label="Construire la sélection">
      <div className="targetingIntro">
        <h2>Quelles fiches souhaitez-vous retenir ?</h2>
        <p>
          Ajoutez uniquement les informations utiles. Dans une même sélection,
          une fiche doit respecter chacun de vos choix.
        </p>
      </div>
      {!v.guided.editable && (
        <div className="targetingPanel">
          <p>
            Ce ciblage enregistré comporte beaucoup de variantes. Ses critères
            sont conservés : vous pouvez examiner les résultats ou repartir
            d’une sélection vide.
          </p>
          <Button
            style="grey"
            disabled={disabled}
            onClick={() => void v.guided.reset()}
          >
            Repartir d’une sélection vide
          </Button>
        </div>
      )}
      {v.guided.profiles.map((profile) => (
        <fieldset
          key={profile.key}
          disabled={disabled}
          className="targetingPanel targetingProfile"
        >
          <legend>{profile.title}</legend>
          {profile.empty && (
            <div className="targetingStarters">
              <p>Commencez par ce qui compte pour cette campagne :</p>
              <Button style="grey" onClick={() => profile.add("departement")}>
                Choisir une zone
              </Button>
              <Button style="grey" onClick={() => profile.add("effectif")}>
                Préciser la taille des entreprises
              </Button>
              <Button style="grey" onClick={() => profile.add("activite")}>
                Choisir une activité
              </Button>
            </div>
          )}
          {profile.sections.map((section) => (
            <div className="targetingFamily" key={section.label}>
              <h3>{section.label}</h3>
              {section.rows.map((row) => (
                <ProspectTargetingCriterion
                  key={row.key}
                  row={row}
                  fields={v.guided.fields}
                  disabled={disabled}
                />
              ))}
            </div>
          ))}
          <div className="targetingAddFilter">
            <label htmlFor={`add-filter-${profile.key}`}>
              Affiner cette sélection
              <Select<TargetingChoice, false>
                inputId={`add-filter-${profile.key}`}
                aria-label={`Ajouter un filtre ${profile.key}`}
                options={v.guided.fields}
                value={null}
                onChange={(option) => {
                  if (option) profile.add(option.value);
                }}
                isDisabled={disabled}
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                className="targetingSelect"
                placeholder="Ajouter un filtre : source, contact, historique…"
                noOptionsMessage={() => "Aucun filtre trouvé"}
              />
            </label>
            {v.guided.profiles.length > 1 && (
              <button
                type="button"
                disabled={disabled}
                onClick={profile.remove}
              >
                Supprimer cette sélection
              </button>
            )}
          </div>
          {profile.sentence && (
            <p className="targetingProfileSentence">
              À retenir : {profile.sentence}.
            </p>
          )}
        </fieldset>
      ))}
      {v.guided.editable && (
        <div className="targetingAlternative">
          <p>
            <strong>Vous souhaitez aussi d’autres fiches ?</strong> Ajoutez une
            autre sélection avec ses propres choix. Une fiche correspondant à
            l’une des sélections pourra être retenue.
          </p>
          <Button
            style="grey"
            disabled={disabled || !v.guided.canAddProfile}
            onClick={v.guided.addProfile}
          >
            Accepter aussi une autre sélection
          </Button>
        </div>
      )}
      {v.guided.editable && (
        <fieldset
          disabled={disabled}
          className="targetingPanel targetingExclusions"
        >
          <legend>Quelles fiches faut-il toujours écarter ?</legend>
          <p>
            Ces exclusions s’appliquent à toutes vos sélections. Elles ne
            retirent rien de la campagne tant que vous n’avez pas confirmé
            l’opération.
          </p>
          {v.guided.exclusions.length === 0 && (
            <p className="targetingEmpty">Aucune exclusion ajoutée.</p>
          )}
          {v.guided.exclusions.map((row) => (
            <ProspectTargetingCriterion
              key={row.key}
              row={row}
              fields={v.guided.exclusionFields}
              disabled={disabled}
            />
          ))}
          <label htmlFor="add-exclusion">
            Écarter des fiches selon
            <Select<TargetingChoice, false>
              inputId="add-exclusion"
              aria-label="Ajouter une exclusion"
              options={v.guided.exclusionFields}
              value={null}
              onChange={(option) => {
                if (option) v.guided.addExclusion(option.value);
              }}
              isDisabled={disabled}
              styles={selectStyles}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="targetingSelect"
              placeholder="Une ville, une activité, une source…"
              noOptionsMessage={() => "Aucune information trouvée"}
            />
          </label>
        </fieldset>
      )}
      <section
        className="targetingPanel targetingReview"
        aria-label="Résumé de la sélection"
      >
        <h2>Voici les fiches qui seront recherchées</h2>
        <p>{v.summaryText}</p>
        {v.guided.hasIncomplete && (
          <p role="status">
            Complétez les valeurs de chaque filtre et vérifiez les bornes
            saisies. Supprimez les filtres ou les sélections dont vous n’avez
            pas besoin.
          </p>
        )}
        <label className="targetingCheck">
          <input
            type="checkbox"
            checked={v.allowAll}
            disabled={disabled}
            onChange={(event) => v.changeAllowAll(event.target.checked)}
          />
          Si je ne précise aucun filtre, je confirme vouloir examiner toutes les
          fiches du périmètre.
        </label>
        <div className="prospectInjection__actions">
          <Button
            style="grey"
            disabled={disabled || v.guided.hasIncomplete}
            onClick={v.save}
          >
            Enregistrer mes choix
          </Button>
          <Button
            style="gradient"
            disabled={disabled || v.guided.hasIncomplete}
            onClick={v.analyze}
          >
            {v.busy ? "Recherche en cours…" : "Voir les fiches correspondantes"}
          </Button>
        </div>
      </section>
    </section>
  );
}
