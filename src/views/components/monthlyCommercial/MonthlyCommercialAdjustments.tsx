import type { MonthlyCommercialViewModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';
import { formatPrimeAmount } from '../../../utils/scripts/index.ts';
export function MonthlyCommercialAdjustments({ viewModel: vm }: { viewModel: MonthlyCommercialViewModel }) {
  const closure = vm.primeStats?.cloture;
  const form = vm.adjustments;
  if (!closure) return null;
  return <fieldset className="monthlyCommercial__fieldset">
    <legend>Clôture et ajustements de prime</legend>
    <p>Prime figée le {new Date(closure.captured_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}.
      {closure.source === 'reconstitution' ? ' Reconstitution avec les données disponibles à cette date.' : ' Clôture automatique.'}</p>
    <p>Prime initiale : <strong>{formatPrimeAmount(closure.prime_initiale)}</strong> · Ajustements : <strong>{formatPrimeAmount(closure.total_ajustements)}</strong> · Prime finale : <strong>{formatPrimeAmount(closure.prime_finale)}</strong></p>
    <div className="monthlyCommercial__adjustments-table"><table><caption>Journal des ajustements</caption>
      <thead><tr><th>Date</th><th>Auteur</th><th>Montant</th><th>Motif</th></tr></thead>
      <tbody>{closure.ajustements.map(entry => <tr key={entry.id}><td>{new Date(entry.created_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</td><td>{entry.auteur_nom}</td><td>{formatPrimeAmount(entry.montant)}</td><td>{entry.motif}</td></tr>)}</tbody>
    </table></div>
    {!closure.ajustements.length && <p>Aucun ajustement pour ce mois.</p>}
    {form.canManage && <div className="monthlyCommercial__adjustment-form">
      <label htmlFor="prime-adjustment-amount">Ajustement en euros</label>
      <input id="prime-adjustment-amount" type="text" inputMode="decimal" value={form.amount} disabled={form.busy} onChange={event => form.changeAmount(event.target.value)} placeholder="Ex. 50 ou -50" />
      <label htmlFor="prime-adjustment-reason">Motif de l’ajustement</label>
      <textarea id="prime-adjustment-reason" value={form.motif} maxLength={2000} rows={3} disabled={form.busy} onChange={event => form.changeMotif(event.target.value)} />
      <p>L’ajustement est ajouté au journal avec votre identité. La clôture initiale reste conservée.</p>
      <Button style="gradient" disabled={!form.canSubmit} onClick={() => void form.submit()}>Enregistrer l’ajustement</Button>
    </div>}
    {form.error && <p role="alert">{form.error}</p>}
    {form.success && <p role="status">{form.success}</p>}
  </fieldset>;
}
