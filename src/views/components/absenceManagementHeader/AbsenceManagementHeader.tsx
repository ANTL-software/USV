import type { Dispatch, ReactElement, SetStateAction } from 'react';
import { MdArrowBack } from 'react-icons/md';
import type { AbsenceManagementTab } from '../../../hooks/index.ts';
import { Button, NotificationBadge } from '../index.ts';

interface AbsenceManagementHeaderProps {
  activeTab: AbsenceManagementTab;
  navigateBack: () => void;
  setActiveTab: Dispatch<SetStateAction<AbsenceManagementTab>>;
}

export function AbsenceManagementHeader({
  activeTab,
  navigateBack,
  setActiveTab,
}: AbsenceManagementHeaderProps): ReactElement {
  return (
    <>
      <div className="absenceDemandes__back">
        <Button style="back" onClick={navigateBack}>
          <MdArrowBack />
          <span>Retour</span>
        </Button>
      </div>

      <div className="absenceDemandes__header">
        <div>
          <h1>Demandes d&apos;absence</h1>
          <p>Suivi des absences en cours et traitement des nouvelles demandes.</p>
        </div>
        <div className="absenceDemandes__tabs">
          <button
            type="button"
            className={activeTab === 'active' ? 'is-active' : ''}
            onClick={() => setActiveTab('active')}
          >
            Absences en cours
          </button>
          <button
            type="button"
            className={`absenceDemandes__pendingTab${activeTab === 'pending' ? ' is-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Demandes à traiter
            <NotificationBadge
              sectionId="operations"
              subsectionId="demandes-absence"
              className="absenceDemandes__notificationBadge"
            />
          </button>
          <button
            type="button"
            className={activeTab === 'all' ? 'is-active' : ''}
            onClick={() => setActiveTab('all')}
          >
            Toutes les demandes
          </button>
        </div>
      </div>
    </>
  );
}
