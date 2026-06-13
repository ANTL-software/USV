// styles
import './postesList.scss';

// hooks | library
import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPencil, IoTrash, IoAdd, IoCalendarClear, IoClose, IoSave } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// hooks
import { usePostes } from '../../../hooks/usePostes';
import { usePlanningAdmin } from '../../../hooks/usePlanningAdmin';

// constants
import { TYPE_LABELS, getPosteBadgeStyle } from '../../../utils/constants/poste.constants';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Modal from '../../components/modal/Modal';

const DAY_OPTIONS = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 7, label: 'Dimanche' },
];

function PostesList(): ReactElement {
  const navigate = useNavigate();
  const { postes, isLoading, error, deletePoste } = usePostes();
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const {
    plannings,
    selectedPlanningId,
    selectedPlanning,
    isCreating,
    form,
    isLoading: isPlanningLoading,
    isSaving,
    error: planningError,
    success: planningSuccess,
    startCreate,
    selectPlanning,
    updateField,
    addSlot,
    updateSlot,
    removeSlot,
    savePlanning,
    deletePlanning,
  } = usePlanningAdmin(isPlanningModalOpen);

  return (
    <div id="postesList">
      <Header />
      <SubNav />
      <main>
        <div className="postesList__container">
          <div className="postesList__back">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
          </div>

          <div className="postesList__header">
            <div>
              <h1>Postes</h1>
              <p className="postesList__subtitle">{postes.length} poste{postes.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="postesList__headerActions">
              <Button style="white" onClick={() => setIsPlanningModalOpen(true)}>
                <IoCalendarClear /> Gérer les plannings
              </Button>
              <Button style="gradient" onClick={() => navigate('/operations/postes/new')}>
                <IoAdd /> Nouveau poste
              </Button>
            </div>
          </div>

          {error && <div className="postesList__error">{error}</div>}

          {isLoading ? (
            <div className="postesList__loading">Chargement...</div>
          ) : (
            <div className="postesList__table-wrapper">
              <table className="postesList__table">
                <thead>
                  <tr>
                    <th>Libellé</th>
                    <th>Catégorie</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postes.map(p => (
                    <tr key={p.id_poste}>
                      <td className="postesList__label">{p.libelle_poste}</td>
                      <td>
                        {p.type_poste ? (
                          <span
                            className={`postesList__badge${!p.couleur ? ` postesList__badge--${p.type_poste}` : ''}`}
                            style={getPosteBadgeStyle(p.couleur)}
                          >
                            {TYPE_LABELS[p.type_poste] ?? p.type_poste}
                          </span>
                        ) : (
                          <span className="postesList__badge postesList__badge--autre">—</span>
                        )}
                      </td>
                      <td className="postesList__desc">{p.description || '—'}</td>
                      <td>
                        <div className="postesList__actions">
                          <button
                            className="postesList__btn-edit"
                            onClick={() => navigate(`/operations/postes/${p.id_poste}`)}
                            title="Modifier"
                          >
                            <IoPencil />
                          </button>
                          <button
                            className="postesList__btn-delete"
                            onClick={() => deletePoste(p)}
                            title="Supprimer"
                          >
                            <IoTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Modal
        isVisible={isPlanningModalOpen}
        onClose={() => setIsPlanningModalOpen(false)}
        title="Gestion des plannings"
      >
        <div className="postesList__planningModal">
          <aside className="postesList__planningSidebar">
            <div className="postesList__planningSidebarHeader">
              <div>
                <h3>Plannings</h3>
                <p>{plannings.length} actif{plannings.length > 1 ? 's' : ''}</p>
              </div>
              <Button style="gradient" onClick={startCreate}>
                <IoAdd /> Nouveau
              </Button>
            </div>

            {isPlanningLoading ? (
              <p className="postesList__planningState">Chargement...</p>
            ) : (
              <div className="postesList__planningCards">
                {plannings.map((planning) => (
                  <button
                    key={planning.id_planning}
                    className={`postesList__planningCard${selectedPlanningId === planning.id_planning ? ' postesList__planningCard--active' : ''}`}
                    onClick={() => selectPlanning(planning.id_planning)}
                  >
                    <strong>{planning.nom_planning}</strong>
                    <span>{planning.heures_hebdo} h / semaine</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <div className="postesList__planningEditor">
            {(planningError || planningSuccess) && (
              <div className={`postesList__planningFeedback${planningError ? ' postesList__planningFeedback--error' : ''}`}>
                {planningError || planningSuccess}
              </div>
            )}

            {selectedPlanningId !== null ? (
              <>
                <div className="postesList__planningEditorHeader">
                  <div>
                    <h3>{isCreating ? 'Nouveau planning' : selectedPlanning?.nom_planning}</h3>
                    <p>Configure les créneaux hebdomadaires et les jours fériés.</p>
                  </div>
                  {!isCreating && (
                    <Button style="red" onClick={() => void deletePlanning()} disabled={isSaving}>
                      <IoTrash /> Supprimer
                    </Button>
                  )}
                </div>

                <div className="postesList__planningGrid">
                  <label>
                    <span>Code</span>
                    <input
                      value={form.code_planning}
                      onChange={(e) => updateField('code_planning', e.target.value)}
                      placeholder="ex: cadre_35h"
                    />
                  </label>
                  <label>
                    <span>Nom</span>
                    <input
                      value={form.nom_planning}
                      onChange={(e) => updateField('nom_planning', e.target.value)}
                      placeholder="Nom du planning"
                    />
                  </label>
                  <label>
                    <span>Heures hebdo</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.heures_hebdo}
                      onChange={(e) => updateField('heures_hebdo', e.target.value)}
                    />
                  </label>
                  <label className="postesList__planningCheckbox">
                    <input
                      type="checkbox"
                      checked={form.jours_feries_chomes}
                      onChange={(e) => updateField('jours_feries_chomes', e.target.checked)}
                    />
                    <span>Jours fériés chômés</span>
                  </label>
                </div>

                <label className="postesList__planningTextarea">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Description interne du planning"
                  />
                </label>

                <div className="postesList__planningSlotsHeader">
                  <h4>Créneaux</h4>
                  <div className="postesList__planningSlotsActions">
                    {DAY_OPTIONS.map((day) => (
                      <button key={day.value} type="button" onClick={() => addSlot(day.value)}>
                        + {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="postesList__planningSlots">
                  {form.creneaux.map((slot) => (
                    <div key={slot.id} className="postesList__planningSlot">
                      <select
                        style={{ display: 'none' }}
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                      <Select
                        classNamePrefix="reactSelect"
                        options={DAY_OPTIONS}
                        value={DAY_OPTIONS.find((day) => day.value === slot.jour_semaine) ?? null}
                        onChange={(option) => {
                          if (option) {
                            updateSlot(slot.id, 'jour_semaine', option.value);
                          }
                        }}
                        isSearchable={false}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 100000 }),
                        }}
                      />

                      <input
                        type="time"
                        value={slot.heure_debut}
                        onChange={(e) => updateSlot(slot.id, 'heure_debut', e.target.value)}
                      />

                      <input
                        type="time"
                        value={slot.heure_fin}
                        onChange={(e) => updateSlot(slot.id, 'heure_fin', e.target.value)}
                      />

                      <button type="button" className="postesList__planningSlotRemove" onClick={() => removeSlot(slot.id)}>
                        <IoClose />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="postesList__planningFooter">
                  <Button style="gradient" onClick={() => void savePlanning()} disabled={isSaving}>
                    <IoSave /> {isSaving ? 'Enregistrement...' : 'Enregistrer le planning'}
                  </Button>
                </div>
              </>
            ) : (
              <p className="postesList__planningState">Sélectionne un planning ou crée-en un nouveau.</p>
            )}
          </div>
        </div>
      </Modal>
      <BackToTop />
    </div>
  );
}

const PostesListWithAuth = WithAuth(PostesList);
export default PostesListWithAuth;
