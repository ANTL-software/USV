import type { ReactElement } from "react";
import Select from "react-select";
import { createReactSelectStyles } from "../../../utils/styles/index.ts";
import type { ProspectInjectionPageViewModel } from "../../../hooks/index.ts";
import type { TargetingAction } from "../../../utils/types/index.ts";
import {
  Button,
  Header,
  SubNav,
  ProspectTargetingEditor,
  ProspectTargetingPreview,
} from "../index.ts";
interface Props {
  viewModel: ProspectInjectionPageViewModel;
}
const actionStyles = createReactSelectStyles<
  { value: TargetingAction; label: string },
  false
>();
const ACTIONS: { value: TargetingAction; label: string }[] = [
  { value: "inject", label: "Injecter dans la campagne" },
  { value: "withdraw", label: "Retirer une sélection" },
  { value: "exclude", label: "Retirer et exclure durablement" },
  { value: "restore", label: "Réinjecter des fiches retirées" },
];
export function ProspectInjectionContent({
  viewModel: v,
}: Props): ReactElement {
  return (
    <div id="prospectInjection">
      <Header />
      <SubNav />
      <main>
        <div className="prospectInjection__container">
          <div className="prospectInjection__header">
            <Button style="back" onClick={v.navigateBack}>
              Retour
            </Button>
            <h1>
              Ciblage des prospects —{" "}
              {v.campagneNom || `campagne ${v.campagneId ?? "inconnue"}`}
            </h1>
          </div>
          <p>
            Définissez une sélection, examinez les fiches puis confirmez
            l’opération. Les refus de contact et les protections de campagne
            s’appliquent à l’injection.
          </p>
          {v.error && (
            <p role="alert" className="targetingError">
              {v.error}
            </p>
          )}
          <fieldset disabled={v.busy} className="targetingPanel">
            <legend>Opération</legend>
            <div className="targetingGrid">
              <label htmlFor="targeting-action">
                Action
                <Select<{ value: TargetingAction; label: string }, false>
                  inputId="targeting-action"
                  aria-label="Action"
                  options={ACTIONS}
                  value={ACTIONS.find((option) => option.value === v.action)}
                  onChange={(option) => {
                    if (option) v.changeAction(option.value);
                  }}
                  isSearchable={false}
                  isDisabled={v.busy}
                  styles={actionStyles}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  className="targetingSelect"
                  classNamePrefix="targetingSelect"
                />
              </label>
              <label>
                Nom du ciblage / de l’opération
                <input
                  value={v.nom}
                  maxLength={160}
                  onChange={(e) => v.changeName(e.target.value)}
                  placeholder="Facultatif pour voir les fiches"
                />
              </label>
              <label>
                Nombre maximum de fiches
                <input
                  type="number"
                  min={1}
                  max={50000}
                  value={v.limit}
                  onChange={(e) => v.changeLimit(e.target.value)}
                />
              </label>
            </div>
            {v.action === "withdraw" || v.action === "exclude" ? (
              <p>
                Les rappels de l’agenda commercial liés aux fiches retirées
                seront annulés pour cette campagne. Les leads et rendez-vous
                clients sont conservés. Un appel établi peut se terminer, sans
                remise en file.
              </p>
            ) : (
              <p>
                Vérifiez les fiches proposées avant de confirmer leur ajout à la
                campagne.
              </p>
            )}
            {v.action === "exclude" && (
              <p>
                <strong>Exclusion durable :</strong> les prochaines injections
                et réactivations correspondantes seront bloquées. Les fiches
                déjà en file sont retirées dans la limite du lot analysé ; le
                bilan indique s’il en reste.
              </p>
            )}
          </fieldset>
          <ProspectTargetingEditor viewModel={v} />
          <ProspectTargetingPreview viewModel={v} />
          {v.result && (
            <p role="status" className="targetingPanel">
              {v.result.affected} fiches traitées ·{" "}
              {v.result.cancelled_reminders} rappels commerciaux annulés ·{" "}
              {v.result.skipped} fiches écartées après revalidation.
            </p>
          )}
          <section className="targetingPanel">
            <h2>Ciblages et exclusions enregistrés</h2>
            {v.saved.length === 0 && <p>Aucun ciblage enregistré.</p>}
            {v.saved.map((rule) => (
              <div className="targetingSaved" key={rule.id}>
                <span>
                  {rule.nom} —{" "}
                  {rule.exclusion ? "Exclusion durable" : "Ciblage"}
                  {rule.active ? "" : " (désactivé)"}
                </span>
                <Button
                  style="grey"
                  disabled={v.busy}
                  onClick={() => v.loadSaved(rule)}
                >
                  Charger les critères
                </Button>
                {rule.active && (
                  <Button
                    style="grey"
                    disabled={v.busy}
                    onClick={() => v.disableSaved(rule)}
                  >
                    Désactiver
                  </Button>
                )}
              </div>
            ))}
          </section>
          <section className="targetingPanel">
            <h2>Historique des lots</h2>
            {v.history.map((operation) => (
              <div className="targetingSaved" key={operation.id}>
                <span>{operation.display}</span>
                <Button
                  style="grey"
                  disabled={v.busy}
                  onClick={() => v.viewHistory(operation)}
                >
                  Consulter
                </Button>
                {operation.statut === "completed" && (
                  <Button
                    style="grey"
                    disabled={v.busy}
                    onClick={() => v.restoreLot(operation)}
                  >
                    Préparer une réinjection
                  </Button>
                )}
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
