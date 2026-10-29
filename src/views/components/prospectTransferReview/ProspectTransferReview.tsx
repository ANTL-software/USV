import type { ProspectTransferViewModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';
export function ProspectTransferReview({ vm }: { vm: ProspectTransferViewModel }) {
  return <>
    {vm.error && <div className="prospectTransfer__error" role="alert">{vm.error}<Button style="grey" onClick={() => void vm.loadOptions()}>Recharger les commerciaux</Button></div>}
    {vm.result && <p className="prospectTransfer__success" role="status">Transfert effectué : {vm.result.prospects} prospects et {vm.result.appointments} rendez-vous et {vm.result.forced_recalls ?? 0} rappels Vigie. Suivi réattribué pour {vm.result.pending_sales ?? 0} commandes. L’ancien propriétaire est conservé dans le journal.</p>}
    {vm.preview && <section className="prospectTransfer__card" aria-label="Prévisualisation">
      <h2>Confirmer ce portefeuille</h2>
      <p>{vm.preview.summary.prospects} prospects · {vm.preview.summary.reservations} affectations de campagne · {vm.preview.summary.appointments} rendez-vous vivants (y compris échus) · {vm.preview.summary.forced_recalls ?? 0} rappels Vigie · {vm.preview.summary.pending_sales ?? 0} commandes à suivre.</p>
      <p>Lot valable 30 minutes. Toute modification du portefeuille impose une nouvelle analyse.</p>
      <div className="prospectTransfer__table"><table><caption>Échantillon des 50 premiers prospects maximum</caption><thead><tr><th>Identifiant</th><th>Prospect</th><th>Téléphone</th></tr></thead><tbody>{vm.preview.rows.map(row => <tr key={row.id_prospect}><td>{row.id_prospect}</td><td>{row.nom}</td><td>{row.telephone}</td></tr>)}</tbody></table></div>
      <Button style="gradient" disabled={vm.busy} onClick={() => void vm.execute()}>Confirmer le transfert</Button>
    </section>}
    <section className="prospectTransfer__card" aria-label="Journal des transferts">
      <h2>Historique et restitution</h2><p>Les anciens propriétaires, les fiches et les rendez-vous du lot restent enregistrés après le transfert. La restitution se prépare sans exécuter de changement.</p>
      {vm.historyError && <p role="alert">{vm.historyError}</p>}
      <Button style="grey" disabled={vm.loadingHistory || vm.busy} onClick={() => void vm.loadHistory()}>Actualiser le journal</Button>
      <div className="prospectTransfer__table"><table><thead><tr><th>Date</th><th>Ancien commercial</th><th>Nouveau commercial</th><th>Auteur</th><th>Prospects / RDV / Vigie / Commandes</th><th>Restitution</th></tr></thead><tbody>{vm.history.map(entry => <tr key={entry.id}><td>{new Date(entry.executed_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</td><td>{entry.source_name}</td><td>{entry.destination_name}</td><td>{entry.author_name}</td><td>{entry.summary.prospects} / {entry.summary.appointments} / {entry.summary.forced_recalls ?? 0} / {entry.summary.pending_sales ?? 0}</td><td><Button style="grey" disabled={vm.busy} onClick={() => vm.restore(entry)}>Préparer la restitution</Button></td></tr>)}</tbody></table></div>
      {!vm.history.length && !vm.loadingHistory && <p>Aucun transfert sur cette page.</p>}
      <div className="prospectTransfer__selection"><Button style="grey" disabled={!vm.hasHistoryPrevious || vm.loadingHistory || vm.busy} onClick={vm.historyPrevious}>Transferts précédents</Button><Button style="grey" disabled={!vm.hasHistoryNext || vm.loadingHistory || vm.busy} onClick={vm.historyNext}>Transferts suivants</Button></div>
    </section>
  </>;
}
