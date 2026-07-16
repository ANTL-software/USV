import 'react-big-calendar/lib/css/react-big-calendar.css';

import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { Calendar, Views } from 'react-big-calendar';
import Select from 'react-select';
import { BackToTop, Button, Header, Modal, SubNav } from '../index.ts';
import { CALENDAR_MESSAGES, calendarLocalizer } from '../../../utils/scripts/index.ts';
import type { MonPlanningPageViewModel } from '../../../hooks/index.ts';
import { ABSENCE_MOTIFS, ABSENCE_STATUS_LABELS } from '../../../utils/constants/index.ts';

interface MonPlanningContentProps { viewModel: MonPlanningPageViewModel; }

export function MonPlanningContent({ viewModel }: MonPlanningContentProps): ReactElement {
  const {
    absence,
    calendar,
    eventPropGetter,
    formatRequestDate,
    navigateBack,
  } = viewModel;
  const {
    currentDate,
    currentView,
    events,
    isLoading,
    maxTime,
    minTime,
    setCurrentDate,
    setCurrentView,
  } = calendar;
  const {
    isCreateModalOpen,
    isListModalOpen,
    form,
    requests,
    isSubmitting,
    isLoadingList,
    formError,
    listError,
    selectedMotif,
    openCreateModal,
    closeCreateModal,
    openListModal,
    closeListModal,
    updateField,
    submitRequest,
  } = absence;

  return (
    <div id="commerciauxPlaceholder">
      <Header />
      <SubNav />
      <main>
        <div className="commerciauxPlaceholder__back">
          <Button style="back" onClick={navigateBack}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
        </div>

        <div className="commerciauxPlaceholder__wrapper">
          <div className="commerciauxPlaceholder__header">
            <h1 className="commerciauxPlaceholder__title">Voir mon planning</h1>
            <div className="commerciauxPlaceholder__actions">
              <Button style="white" onClick={openListModal}>
                <span>Mes demandes d&apos;absence</span>
              </Button>
              <Button style="gradient" onClick={openCreateModal}>
                <span>Faire une demande d&apos;absence</span>
              </Button>
            </div>
          </div>

          <section className="commerciauxPlaceholder__calendarWrapper">
            {isLoading && <p className="commerciauxPlaceholder__loading">Chargement du planning...</p>}
            <Calendar
              localizer={calendarLocalizer}
              culture="fr"
              messages={CALENDAR_MESSAGES}
              events={events}
              date={currentDate}
              view={currentView}
              onNavigate={setCurrentDate}
              onView={setCurrentView}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventPropGetter}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              min={minTime}
              max={maxTime}
              popup
            />
          </section>
        </div>
      </main>

      <Modal
        isVisible={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Faire une demande d’absence"
      >
        <div className="commerciauxPlaceholder__absenceModal">
          <div className="commerciauxPlaceholder__absenceGrid">
            <label className="commerciauxPlaceholder__field">
              <span>Motif</span>
              <Select
                classNamePrefix="reactSelect"
                options={ABSENCE_MOTIFS}
                value={selectedMotif}
                onChange={(option) => updateField('motif_code', option?.value ?? '')}
                placeholder="Veuillez sélectionner un motif"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 100000 }),
                }}
              />
            </label>

            <label className="commerciauxPlaceholder__field">
              <span>Type de demande</span>
              <div className="commerciauxPlaceholder__typeToggle">
                <button
                  type="button"
                  className={form.type_demande === 'jours' ? 'is-active' : ''}
                  onClick={() => updateField('type_demande', 'jours')}
                >
                  Plage de jours
                </button>
                <button
                  type="button"
                  className={form.type_demande === 'heures' ? 'is-active' : ''}
                  onClick={() => updateField('type_demande', 'heures')}
                >
                  Plage horaire
                </button>
              </div>
            </label>
          </div>

          <label className="commerciauxPlaceholder__field">
            <span>Pourquoi cette demande d’absence ?</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Veuillez expliquer le contexte de votre demande"
            />
          </label>

          <div className="commerciauxPlaceholder__absenceGrid">
            <label className="commerciauxPlaceholder__field">
              <span>Date de début</span>
              <input
                type="date"
                value={form.date_debut}
                onChange={(event) => updateField('date_debut', event.target.value)}
              />
            </label>

            <label className="commerciauxPlaceholder__field">
              <span>{form.type_demande === 'heures' ? 'Date concernée' : 'Date de fin'}</span>
              <input
                type="date"
                value={form.type_demande === 'heures' ? form.date_debut : form.date_fin}
                onChange={(event) => updateField('date_fin', event.target.value)}
                disabled={form.type_demande === 'heures'}
              />
            </label>
          </div>

          {form.type_demande === 'heures' && (
            <div className="commerciauxPlaceholder__absenceGrid">
              <label className="commerciauxPlaceholder__field">
                <span>Heure de début</span>
                <input
                  type="time"
                  value={form.heure_debut}
                  onChange={(event) => updateField('heure_debut', event.target.value)}
                />
              </label>

              <label className="commerciauxPlaceholder__field">
                <span>Heure de fin</span>
                <input
                  type="time"
                  value={form.heure_fin}
                  onChange={(event) => updateField('heure_fin', event.target.value)}
                />
              </label>
            </div>
          )}

          {selectedMotif?.justificatif_requis && (
            <p className="commerciauxPlaceholder__absenceHint">
              Un justificatif vous sera demandé pour ce motif.
            </p>
          )}

          {formError && (
            <p className="commerciauxPlaceholder__absenceError">{formError}</p>
          )}

          <div className="commerciauxPlaceholder__absenceFooter">
            <Button style="grey" onClick={closeCreateModal}>
              <span>Annuler</span>
            </Button>
            <Button style="gradient" onClick={() => void submitRequest()} disabled={isSubmitting}>
              <span>{isSubmitting ? 'Envoi...' : 'Envoyer la demande'}</span>
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isVisible={isListModalOpen}
        onClose={closeListModal}
        title="Mes demandes d’absence"
      >
        <div className="commerciauxPlaceholder__absenceList">
          {isLoadingList ? (
            <p className="commerciauxPlaceholder__absenceState">Chargement...</p>
          ) : listError ? (
            <p className="commerciauxPlaceholder__absenceError">{listError}</p>
          ) : requests.length === 0 ? (
            <p className="commerciauxPlaceholder__absenceState">Aucune demande d’absence pour le moment.</p>
          ) : (
            requests.map((request) => (
              <article key={request.id_demande} className="commerciauxPlaceholder__absenceCard">
                <div className="commerciauxPlaceholder__absenceCardHeader">
                  <div>
                    <h3>{request.motif_label}</h3>
                    <p>Demandée le {formatRequestDate(request.created_at)}</p>
                  </div>
                  <span className={`commerciauxPlaceholder__status commerciauxPlaceholder__status--${request.statut}`}>
                    {ABSENCE_STATUS_LABELS[request.statut]}
                  </span>
                </div>

                <p className="commerciauxPlaceholder__absenceCardText">{request.description}</p>

                <div className="commerciauxPlaceholder__absenceMeta">
                  <span>
                    {request.type_demande === 'heures'
                      ? `${request.date_debut} • ${request.heure_debut?.slice(0, 5)} - ${request.heure_fin?.slice(0, 5)}`
                      : `${request.date_debut} au ${request.date_fin}`}
                  </span>
                  {request.justificatif_requis && <strong>Justificatif demandé</strong>}
                </div>
              </article>
            ))
          )}
        </div>
      </Modal>
      <BackToTop />
    </div>
  );
}
