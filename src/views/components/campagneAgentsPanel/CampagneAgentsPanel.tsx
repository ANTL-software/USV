import type { ReactElement } from 'react';
import { IoSwapHorizontal } from 'react-icons/io5';
import Select from 'react-select';

import type { CampagneFormViewModel } from '../../../hooks/index.ts';
import type { CampagneSelectOption } from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

interface CampagneAgentsPanelProps {
  viewModel: CampagneFormViewModel;
}

export function CampagneAgentsPanel({ viewModel }: CampagneAgentsPanelProps): ReactElement {
  const {
    availableEmployeOptions,
    campaignAgents,
    employesLoading,
    employesError,
    cancelTransfer,
    getAgentName,
    handleAddAgent,
    handleConfirmTransfer,
    handleRemoveAgent,
    handleStartTransfer,
    selectedAgent,
    setSelectedAgent,
    setTransferDestination,
    sortedAgents,
    transferCampaignOptions,
    transferDestinations,
  } = viewModel;

  return (
    <aside className="campagneForm__sidebar">
      <section className="campagneForm__agents">
        <h2>
          Agents affectés
          <span className="campagneForm__agents-count">{sortedAgents.length}</span>
        </h2>

        <p className="campagneForm__agents-help">Affectez un commercial à cette campagne. S’il travaille déjà sur une autre campagne, son transfert vous sera demandé.</p>
        {(campaignAgents.error || employesError) && (
          <p className="campagneForm__error" role="alert">{campaignAgents.error || employesError}</p>
        )}
        <div className="campagneForm__agents-add">
          <Select<CampagneSelectOption>
            value={selectedAgent}
            onChange={setSelectedAgent}
            options={availableEmployeOptions}
            isDisabled={employesLoading || campaignAgents.isLoading || campaignAgents.isSaving || availableEmployeOptions.length === 0}
            isLoading={employesLoading}
            aria-label="Commercial à affecter"
            isClearable
            placeholder="Choisir un commercial"
            noOptionsMessage={() => 'Aucun commercial disponible'}
            className="campagneForm__agents-select"
            classNamePrefix="reactSelect"
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
          <Button
            style="gradient"
            type="button"
            onClick={handleAddAgent}
            disabled={!selectedAgent || employesLoading || campaignAgents.isLoading || campaignAgents.isSaving}
          >
            {campaignAgents.isSaving ? 'Affectation...' : 'Affecter'}
          </Button>
        </div>

        {campaignAgents.isLoading ? (
          <p>Chargement des agents...</p>
        ) : sortedAgents.length === 0 ? (
          <p className="campagneForm__agents-empty">Aucun agent affecté à cette campagne.</p>
        ) : (
          <ul className="campagneForm__agents-list">
            {sortedAgents.map((agent) => {
              const agentName = getAgentName(agent);
              const isTransferring = campaignAgents.transferEnCours === agent.id_employe;

              return (
                <li key={agent.id_affectation} className="campagneForm__agents-item">
                  <div className="campagneForm__agents-info">
                    <span className="campagneForm__agents-nom">
                      {agentName}
                      <em> ({agent.agent?.identifiant})</em>
                    </span>
                    {agent.role_campagne && (
                      <span className="campagneForm__agents-role">{agent.role_campagne}</span>
                    )}
                  </div>

                  <div className="campagneForm__agents-btns">
                    {!isTransferring ? (
                      <>
                        {transferCampaignOptions.length > 0 && (
                          <Button
                            style="seaGreen"
                            type="button"
                            onClick={() => handleStartTransfer(agent.id_employe)}
                            disabled={campaignAgents.isSaving}
                          >
                            <IoSwapHorizontal /> Transfert
                          </Button>
                        )}
                        <Button
                          style="red"
                          type="button"
                          onClick={() => handleRemoveAgent(agent.id_employe, agentName)}
                          disabled={campaignAgents.isSaving}
                        >
                          Retirer
                        </Button>
                      </>
                    ) : (
                      <div className="campagneForm__agents-transfer-row">
                        <Select<CampagneSelectOption>
                          value={transferDestinations[agent.id_employe] ?? null}
                          onChange={(option) => setTransferDestination(agent.id_employe, option)}
                          options={transferCampaignOptions}
                          isClearable
                          autoFocus
                          placeholder="— Campagne destination —"
                          noOptionsMessage={() => 'Aucune campagne disponible'}
                          className="campagneForm__agents-select"
                          aria-label={`Campagne destination pour ${agentName}`}
                          classNamePrefix="reactSelect"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                        <Button
                          style="gradient"
                          type="button"
                          onClick={() => handleConfirmTransfer(agent.id_employe, agentName)}
                          disabled={!transferDestinations[agent.id_employe]?.value || campaignAgents.isSaving}
                        >
                          Confirmer
                        </Button>
                        <Button style="grey" type="button" onClick={cancelTransfer}>
                          Annuler
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
}
