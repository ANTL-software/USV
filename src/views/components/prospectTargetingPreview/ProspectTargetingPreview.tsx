import type { ReactElement } from "react";
import type { ProspectInjectionPageViewModel } from "../../../hooks/index.ts";
import { Button } from "../index.ts";
interface Props {
  viewModel: ProspectInjectionPageViewModel;
}
export function ProspectTargetingPreview({
  viewModel: v,
}: Props): ReactElement | null {
  return v.preview ? (
    <section className="targetingPanel" aria-label="Prévisualisation">
      <h2>Prévisualisation du lot</h2>
      {v.preview.summary.scope === "candidate_pool" ? (
        <p>
          <strong>
            {v.preview.summary.selected.toLocaleString("fr-FR")} fiches
            sélectionnées
          </strong>{" "}
          dans le lot analysé. Le total de la base n’est pas calculé.{" "}
          {v.preview.summary.capped
            ? "La limite d’analyse a été atteinte ; d’autres fiches peuvent correspondre."
            : ""}
        </p>
      ) : (
        <p>
          {v.preview.summary.matched.toLocaleString("fr-FR")} correspondances ·{" "}
          {v.preview.summary.eligible.toLocaleString("fr-FR")} éligibles à
          l’opération ·{" "}
          <strong>
            {v.preview.summary.selected.toLocaleString("fr-FR")} sélectionnées
          </strong>
        </p>
      )}
      {v.preview.summary.scope !== "candidate_pool" && (
        <p>
          Déjà présentes : {v.preview.summary.already_present} · Écartées par
          les protections : {v.preview.summary.blocked} · Doublons de téléphone
          éligibles : {v.preview.summary.duplicates} · Rappels commerciaux à
          annuler : {v.preview.summary.reminders}
        </p>
      )}
      {v.preview.summary.scope === "candidate_pool" && (
        <p>
          Doublons de téléphone dans le lot : {v.preview.summary.duplicates} ·
          Rappels commerciaux à annuler : {v.preview.summary.reminders}
        </p>
      )}
      {v.preview.summary.departments && (
        <p>
          Répartition du lot par préfixe postal :{" "}
          {v.preview.summary.departments
            .map((zone) => `${zone.departement} : ${zone.count}`)
            .join(" · ")}
        </p>
      )}
      <p>
        Analyse valable 30 minutes. Les fiches sont revérifiées à la
        confirmation. Le lot ne sera pas élargi.
      </p>
      <div className="targetingTable">
        <table>
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Localisation</th>
              <th>Activité</th>
              <th>Effectif retenu</th>
              <th>Origine effectif</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {v.preview.rows.map((row) => (
              <tr key={row.id_prospect}>
                <td>
                  {row.snapshot.raison_sociale}
                  <small>#{row.id_prospect}</small>
                </td>
                <td>
                  {row.snapshot.code_postal} {row.snapshot.ville}
                </td>
                <td>{row.snapshot.activite || "—"}</td>
                <td>
                  {row.snapshot.workforce.known
                    ? `${row.snapshot.workforce.min ?? "?"} – ${row.snapshot.workforce.max ?? "?"}`
                    : "Inconnu"}
                </td>
                <td>{row.snapshot.workforce.origine}</td>
                <td>{row.snapshot.source || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="prospectInjection__actions">
        <Button
          style="grey"
          disabled={v.busy || v.page <= 1}
          onClick={() => v.loadPage(v.page - 1)}
        >
          Précédent
        </Button>
        <span>
          Page {v.page} / {v.totalPages || 1}
        </span>
        <Button
          style="grey"
          disabled={v.busy || v.page >= v.totalPages}
          onClick={() => v.loadPage(v.page + 1)}
        >
          Suivant
        </Button>
        <Button style="grey" disabled={v.busy} onClick={v.exportLot}>
          Exporter le lot CSV
        </Button>
        <Button
          style="gradient"
          disabled={v.busy || !v.canExecute}
          onClick={v.execute}
        >
          Confirmer l’opération
        </Button>
      </div>
    </section>
  ) : null;
}
