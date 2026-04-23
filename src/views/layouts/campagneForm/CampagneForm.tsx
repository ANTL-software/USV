import './campagneForm.scss';
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { IoSwapHorizontal, IoAddCircleOutline } from 'react-icons/io5';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useCampagneForm } from '../../../hooks/useCampagneForm';
import { useCampagneAgents, useCampagnes } from '../../../hooks/useCampagnes';
import { useEmployes } from '../../../hooks/useEmployes';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import { useAlert } from '../../../context/alert/AlertContext';

function CampagneForm(): ReactElement {
  const navigate = useNavigate();
  const { showConfirm } = useAlert();
  const {
    form, existing, isEdit, isLoading, isFetching, error, success,
    handleChange, handleSubmit,
  } = useCampagneForm();

  const campagneId = existing?.id_campagne ?? null;
  const {
    agents, isLoading: agentsLoading,
    addAgent, removeAgent, transferAgent,
    transferEnCours, setTransferEnCours,
  } = useCampagneAgents(campagneId);

  const { campagnes: toutesLesCampagnes } = useCampagnes();

  const { employes: allEmployes } = useEmployes();

  type SelectOption = { value: string; label: string };

  const [selectedAgent, setSelectedAgent] = useState<SelectOption | null>(null);
  const [transferDestId, setTransferDestId] = useState<Record<number, SelectOption | null>>({});

  const agentIds = new Set(agents.map(a => a.id_employe));
  const emploiesDisponibles = allEmployes.filter(e => e.actif && !agentIds.has(e.id_employe));

  const campagnesTransfert = toutesLesCampagnes.filter(
    c => c.id_campagne !== campagneId && c.statut !== 'terminee'
  );

  const handleAddAgent = () => {
    if (!selectedAgent) return;
    addAgent({ id_employe: Number(selectedAgent.value) });
    setSelectedAgent(null);
  };

  const handleStartTransfer = (idEmploye: number) => {
    setTransferEnCours(idEmploye);
    setTransferDestId(prev => ({ ...prev, [idEmploye]: null }));
  };

  const handleConfirmTransfer = (idEmploye: number, nom: string) => {
    const destId = Number(transferDestId[idEmploye]?.value);
    if (!destId) return;
    const dest = campagnesTransfert.find(c => c.id_campagne === destId);
    if (!dest) return;
    transferAgent(idEmploye, destId, nom, dest.nom_campagne);
  };

  const handleRemoveAgent = async (idEmploye: number, nom: string) => {
    const confirmed = await showConfirm(
      `Retirer ${nom || 'cet agent'} de cette campagne ?`,
      'Confirmer le retrait'
    );
    if (confirmed) {
      removeAgent(idEmploye, nom);
    }
  };

  if (isFetching) {
    return (
      <div id="campagneForm">
        <Header /><SubNav />
        <main><div className="campagneForm__loading">Chargement...</div></main>
      </div>
    );
  }

  return (
    <div id="campagneForm">
      <Header />
      <SubNav />
      <main>
        <div className="campagneForm__container">
          <div className="campagneForm__back">
            <Button style="back" onClick={() => navigate('/campagnes')}>
              <MdArrowBack /><span>Retour aux campagnes</span>
            </Button>
          </div>

          <h1>{isEdit ? `Modifier "${existing?.nom_campagne}"` : 'Nouvelle campagne'}</h1>

          {error   && <div className="campagneForm__error">{error}</div>}
          {success && <div className="campagneForm__success">{success}</div>}

          <div className="campagneForm__layout">
            <form onSubmit={handleSubmit} className="campagneForm__form">
              <fieldset>
                <legend>Informations générales</legend>

                <div className="campagneForm__row">
                  <label>
                    Nom de la campagne *
                    <input
                      name="nom_campagne"
                      value={form.nom_campagne}
                      onChange={handleChange}
                      required
                      placeholder="Ex : Campagne fenêtres PVC 2026"
                    />
                  </label>

                  <label>
                    Type
                    <input
                      name="type_campagne"
                      value={form.type_campagne}
                      onChange={handleChange}
                      placeholder="Ex : Rénovation, Énergie..."
                    />
                  </label>
                </div>

                <div className="campagneForm__row">
                  <label>
                    Date de début *
                    <input
                      type="date"
                      name="date_debut"
                      value={form.date_debut}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Date de fin
                    <input
                      type="date"
                      name="date_fin"
                      value={form.date_fin}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <div className="campagneForm__row">
                  <label>
                    Budget (€)
                    <input
                      type="number"
                      name="budget"
                      value={form.budget}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </label>

                  <label>
                    Code postal maison mère
                    <input
                      type="text"
                      name="code_postal_maison_mere"
                      value={form.code_postal_maison_mere}
                      onChange={handleChange}
                      placeholder="ex: 75001"
                      maxLength={10}
                    />
                  </label>
                </div>

                <label className="campagneForm__label-full">
                  Objectifs
                  <textarea
                    name="objectifs"
                    value={form.objectifs}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Décrivez les objectifs de la campagne..."
                  />
                </label>

                <div className="campagneForm__actions">
                  <Button style="grey" type="button" onClick={() => navigate('/campagnes')}>Annuler</Button>
                  <Button style="gradient" type="submit" disabled={isLoading}>
                    {isLoading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer la campagne'}
                  </Button>
                </div>
              </fieldset>
            </form>

            {isEdit && (
            <aside className="campagneForm__sidebar">

              {existing?.statut === 'active' && (
                <div className="campagneForm__sidebar-actions">
                  <Button style="gradient" type="button" onClick={() => navigate(`/campagnes/${campagneId}/inject`)}>
                    <IoAddCircleOutline /> Injecter des prospects
                  </Button>
                  <Button style="grey" type="button" onClick={() => navigate(`/campagnes/${campagneId}/prospects`)}>
                    Voir les prospects injectés
                  </Button>
                </div>
              )}

              <section className="campagneForm__agents">
              <h2>Agents affectés <span className="campagneForm__agents-count">{agents.length}</span></h2>

              <div className="campagneForm__agents-add">
                <Select
                  value={selectedAgent}
                  onChange={opt => setSelectedAgent(opt)}
                  options={emploiesDisponibles.map(e => ({ value: String(e.id_employe), label: `${e.prenom} ${e.nom} (${e.identifiant})` }))}
                  isDisabled={emploiesDisponibles.length === 0}
                  isClearable
                  placeholder="— Sélectionner un agent —"
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

              {agentsLoading ? (
                <p>Chargement des agents...</p>
              ) : agents.length === 0 ? (
                <p className="campagneForm__agents-empty">Aucun agent affecté à cette campagne.</p>
              ) : (
                <ul className="campagneForm__agents-list">
                  {[...agents].sort((a, b) => {
                    const nomA = `${a.agent?.prenom ?? ''} ${a.agent?.nom ?? ''}`.trim().toLowerCase();
                    const nomB = `${b.agent?.prenom ?? ''} ${b.agent?.nom ?? ''}`.trim().toLowerCase();
                    return nomA.localeCompare(nomB, 'fr');
                  }).map(a => {
                    const nomComplet = `${a.agent?.prenom ?? ''} ${a.agent?.nom ?? ''}`.trim();
                    const enTransfert = transferEnCours === a.id_employe;

                    return (
                      <li key={a.id_affectation} className="campagneForm__agents-item">
                        <div className="campagneForm__agents-info">
                          <span className="campagneForm__agents-nom">
                            {nomComplet}
                            <em> ({a.agent?.identifiant})</em>
                          </span>
                          {a.role_campagne && (
                            <span className="campagneForm__agents-role">{a.role_campagne}</span>
                          )}
                        </div>

                        <div className="campagneForm__agents-btns">
                          {!enTransfert ? (
                            <>
                              {campagnesTransfert.length > 0 && (
                                <Button
                                  style="seaGreen"
                                  type="button"
                                  onClick={() => handleStartTransfer(a.id_employe)}
                                >
                                  <IoSwapHorizontal /> Transférer
                                </Button>
                              )}
                              <Button
                                style="red"
                                type="button"
                                onClick={() => handleRemoveAgent(a.id_employe, nomComplet)}
                              >
                                Retirer
                              </Button>
                            </>
                          ) : (
                            <div className="campagneForm__agents-transfer-row">
                              <Select
                                value={transferDestId[a.id_employe] ?? null}
                                onChange={opt => setTransferDestId(prev => ({ ...prev, [a.id_employe]: opt }))}
                                options={campagnesTransfert.map(c => ({ value: String(c.id_campagne), label: `${c.nom_campagne} (${c.statut})` }))}
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
                                onClick={() => handleConfirmTransfer(a.id_employe, nomComplet)}
                                disabled={!transferDestId[a.id_employe]?.value}
                              >
                                Confirmer
                              </Button>
                              <Button
                                style="grey"
                                type="button"
                                onClick={() => setTransferEnCours(null)}
                              >
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
            )}
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const CampagneFormWithAuth = WithAuth(CampagneForm);
export default CampagneFormWithAuth;
