// styles
import './agentsList.scss';

// hooks | library
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPersonAdd, IoPencil, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { useEmployes } from '../../../hooks/useEmployes';
import type { EmployeFilter } from '../../../hooks/useEmployes';

// constants
import { getPosteBadgeStyle } from '../../../utils/constants/poste.constants';

// components
import Header from '../../../components/header/Header';
import SubNav from '../../../components/subNav/SubNav';
import BackToTop from '../../../components/backToTop/BackToTop';
import Button from '../../../components/button/Button';

const FILTER_OPTIONS: { value: EmployeFilter; label: string }[] = [
  { value: 'actifs',   label: 'Uniquement les actifs'   },
  { value: 'inactifs', label: 'Uniquement les inactifs' },
  { value: 'tous',     label: 'Tous les employés'        },
];

function AgentsList(): ReactElement {
  const navigate = useNavigate();
  const { employes, isLoading, error, deactivate, filter } = useEmployes();
  const [filterOption, setFilterOption] = useState(FILTER_OPTIONS[0]);

  const filtered = employes.filter(a => filter(a, filterOption.value));

  return (
    <div id="agentsList">
      <Header />
      <SubNav />
      <main>
        <div className="agentsList__container">
          <div className="agentsList__back">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
          </div>
          <div className="agentsList__header">
            <div>
              <h1>Employés</h1>
              <p className="agentsList__subtitle">{filtered.length} employé{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="agentsList__controls">
              <Select
                options={FILTER_OPTIONS}
                value={filterOption}
                onChange={opt => opt && setFilterOption(opt)}
                isSearchable={false}
                classNamePrefix="reactSelect"
              />
              <button className="agentsList__btn-create" onClick={() => navigate('/operations/employes/new')}>
                <IoPersonAdd />
                Nouvel employé
              </button>
            </div>
          </div>

          {error && <div className="agentsList__error">{error}</div>}

          {isLoading ? (
            <div className="agentsList__loading">Chargement...</div>
          ) : (
            <div className="agentsList__table-wrapper">
              <table className="agentsList__table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center' }}>Matricule</th>
                    <th>Identifiant</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th style={{ textAlign: 'center' }}>Poste</th>
                    <th>SIP</th>
                    <th>Actif</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(agent => (
                    <tr key={agent.id_employe} className={!agent.actif ? 'agentsList__row--inactive' : ''}>
                      <td style={{ textAlign: 'center' }}><code>{agent.id_employe}</code></td>
                      <td><code>{agent.identifiant}</code></td>
                      <td style={{ textTransform: 'uppercase' }}>{agent.nom}</td>
                      <td>{agent.prenom}</td>
                      <td>{agent.email || '—'}</td>
                      <td>{agent.telephone || '—'}</td>
                      <td style={{ textAlign: 'center' }}>
                        {agent.poste ? (
                          <span
                            className={`agentsList__badge agentsList__badge--poste${!agent.poste.couleur ? ` agentsList__badge--${agent.poste.type_poste ?? 'autre'}` : ''}`}
                            style={getPosteBadgeStyle(agent.poste.couleur)}
                          >
                            {agent.poste.libelle_poste}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        {agent.sip_uri
                          ? <span className="agentsList__badge agentsList__badge--ok"><IoCheckmarkCircle /> Configuré</span>
                          : <span className="agentsList__badge agentsList__badge--missing"><IoCloseCircle /> Non configuré</span>
                        }
                      </td>
                      <td>
                        {agent.actif
                          ? <span className="agentsList__badge agentsList__badge--ok">Actif</span>
                          : <span className="agentsList__badge agentsList__badge--inactive">Inactif</span>
                        }
                      </td>
                      <td className="agentsList__actions">
                        <button
                          className="agentsList__btn-edit"
                          onClick={() => navigate(`/operations/employes/${agent.id_employe}`)}
                          title="Modifier"
                        >
                          <IoPencil />
                        </button>
                        {agent.actif && (
                          <button
                            className="agentsList__btn-deactivate"
                            onClick={() => deactivate(agent.id_employe, `${agent.prenom} ${agent.nom}`)}
                            title="Désactiver"
                          >
                            <IoCloseCircle />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const AgentsListWithAuth = WithAuth(AgentsList);
export default AgentsListWithAuth;
