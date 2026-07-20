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

        <div className="campagneForm__agents-add">
          <Select<CampagneSelectOption>
            value={selectedAgent}
            onChange={setSelectedAgent}
            options={availableEmployeOptions}
            isDisabled={availableEmployeOptions.length === 0}
            isClearable
            placeholder="Choisir un agent"
            noOptionsMessage={() => 'Aucun agent disponible'}
            classNamePrefix="reactSelect"
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
          <Button
            style="gradient"
            type="button"
            onClick={handleAddAgent}
            disabled={!selectedAgent}
          >
            Affecter
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
                          >
                            <IoSwapHorizontal /> Transfert
                          </Button>
                        )}
                        <Button
                          style="red"
                          type="button"
                          onClick={() => handleRemoveAgent(agent.id_employe, agentName)}
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
                          classNamePrefix="reactSelect"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                        <Button
                          style="gradient"
                          type="button"
                          onClick={() => handleConfirmTransfer(agent.id_employe, agentName)}
                          disabled={!transferDestinations[agent.id_employe]?.value}
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
