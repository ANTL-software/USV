import type { ReactElement } from 'react';
import { IoEyeOutline, IoTimeOutline } from 'react-icons/io5';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';

import type { VigieViewState } from '../../../hooks/index.ts';
import {
  VIGIE_ACTION_LABELS,
  VIGIE_STATUS_LABELS,
  formatVigieDateTime,
  getVigiePayloadLabel,
} from '../../../utils/scripts/index.ts';
import type { SelectOption } from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';

interface VigieActionsProps {
  state: VigieViewState;
}

export function VigieActions({ state }: VigieActionsProps): ReactElement {
  return (
    <section id="vigie-actions" className="vigieView__panel vigieView__actions">
      <div className="vigieView__panel-title"><IoEyeOutline /><div><h2>Actions humaines tracées</h2><p>Préparer, confirmer puis suivre chaque décision prise depuis la vigie.</p></div></div>
      <div className="vigieView__action-grid">
        <div className="vigieView__prepare-action">
          <div><span className="vigieView__step">01</span><h3>Préparer une injection ciblée</h3></div><p>La demande sera journalisée pour contrôle. Elle ne lance aucun import.</p>
          <label htmlFor="vigie-sector">Segment, secteur ou critère souhaité</label><input id="vigie-sector" value={state.sectorToPrepare} onChange={(event) => state.setSectorToPrepare(event.target.value)} placeholder="Ex. Bâtiment – département 69" />
          <button className="vigieView__button vigieView__button--primary" type="button" disabled={!state.sectorToPrepare.trim() || state.pendingAction === 'preparation_injection-preparation-injection'} onClick={() => { void state.prepareInjection(); }}>Préparer l’injection</button>
        </div>
        <div className="vigieView__prepare-action">
          <div><span className="vigieView__step">02</span><h3>Envoyer un lot prioritaire</h3></div><p>Sélectionnez jusqu’à 30 fiches dans le classement. Elles expirent après 24 h et les rappels échus restent servis avant le lot.</p>
          <div className="vigieView__selected-list">{state.selectedCandidates.length === 0 ? <span>Sélectionnez les fiches à envoyer dans le tableau Potentiel.</span> : state.selectedCandidates.map((candidate, index) => <button key={candidate.id_prospect} type="button" onClick={() => state.toggleCandidate(candidate.id_prospect)} title="Retirer de la sélection"><b>{index + 1}</b><span>{candidate.raison_sociale}</span><small>{candidate.telephone_contact || candidate.telephone}</small></button>)}</div>
          <label htmlFor="vigie-priority-agent">Commercial affecté à la campagne</label>
          <Select<SelectOption<number>, false>
            inputId="vigie-priority-agent" options={state.agentOptions}
            value={state.agentOptions.find(({ value }) => value === state.priorityAgentId) || null}
            onChange={(option) => state.setPriorityAgentId(option?.value ?? null)}
            styles={reactSelectStyles as StylesConfig<SelectOption<number>, false>}
            placeholder={state.campaignAgentsLoading ? 'Chargement des agents...' : 'Choisir un commercial...'}
            isLoading={state.campaignAgentsLoading} isDisabled={state.campaignAgentsLoading}
          />
          <button className="vigieView__button vigieView__button--primary" type="button" disabled={state.selectedCandidates.length === 0 || !state.priorityAgentId || state.pendingAction === 'priorite-lot'} onClick={() => { void state.submitPriorityBatch(); }}>Envoyer {state.selectedCandidates.length || ''} fiche(s) au commercial</button>
          <div className="vigieView__manual-priority">
            <div><span>ou</span><strong>Injecter un numéro manuel</strong></div><p>Pour un rappel transmis au superviseur : la fiche est créée ou rattachée à la campagne, puis servie en priorité au commercial choisi.</p>
            <label htmlFor="vigie-manual-priority-phone">Numéro à appeler</label><input id="vigie-manual-priority-phone" type="tel" value={state.manualPriorityTelephone} onChange={(event) => state.setManualPriorityTelephone(event.target.value)} placeholder="Ex. 06 12 34 56 78" />
            <label htmlFor="vigie-manual-priority-label">Nom ou société <em>facultatif</em></label><input id="vigie-manual-priority-label" value={state.manualPriorityLabel} onChange={(event) => state.setManualPriorityLabel(event.target.value)} placeholder="Ex. Mme Martin — rappel demandé" />
            <button className="vigieView__button vigieView__button--secondary" type="button" disabled={!state.manualPriorityTelephone.trim() || !state.priorityAgentId || state.pendingAction === 'priorite-manuelle'} onClick={() => { void state.submitManualPriority(); }}>Injecter et prioriser ce numéro</button>
          </div>
        </div>
      </div>
      {state.actionMessage && <p className={`vigieView__action-message vigieView__action-message--${state.actionMessageTone}`}>{state.actionMessage}</p>}
      <div className="vigieView__journal">
        <div className="vigieView__journal-title"><h3>Journal récent</h3><span>{state.actions.length} action(s)</span></div>{state.actionsError && <p className="vigieView__inline-error">{state.actionsError}</p>}
        {state.actions.length === 0 && !state.actionsError ? <p className="vigieView__empty-copy">Aucune action enregistrée pour cette campagne.</p> : <div className="vigieView__journal-list">{state.actions.map((action) => <article key={action.id_vigie_action}>
          <div className="vigieView__journal-icon"><IoTimeOutline /></div><div><strong>{VIGIE_ACTION_LABELS[action.type_action]}</strong><span>{getVigiePayloadLabel(action) || action.prospect_raison_sociale || action.prospect_nom || action.prospect_telephone || 'Action de vigie'}{action.agent_cible_nom ? ` · pour ${action.agent_cible_prenom || ''} ${action.agent_cible_nom}` : ''}</span><small>{formatVigieDateTime(action.created_at)} · par {action.createur_prenom} {action.createur_nom}</small></div>
          <span className={`vigieView__action-status vigieView__action-status--${action.est_expiree ? 'annulee' : action.statut}`}>{action.est_expiree ? 'Expirée' : VIGIE_STATUS_LABELS[action.statut]}</span>
          {action.type_action === 'priorite_fiche' && action.statut === 'validee' && !action.est_expiree && <button className="vigieView__button vigieView__button--danger-link" type="button" disabled={state.pendingAction === `cancel-${action.id_vigie_action}`} onClick={() => { void state.cancelAction(action); }}>Annuler</button>}
        </article>)}</div>}
      </div>
    </section>
  );
}
