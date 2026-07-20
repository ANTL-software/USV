import type { ReactElement } from 'react';
import { IoPersonAdd } from 'react-icons/io5';
import type { ProjetDetailsViewModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';

interface ProjetMembersCardProps { viewModel: ProjetDetailsViewModel }

export function ProjetMembersCard({ viewModel }: ProjetMembersCardProps): ReactElement {
  return (
    <div className="projetDetails__card">
      <div className="projetDetails__card-header">
        <h2>Membres</h2>
        <Button style="gradient" onClick={() => viewModel.setShowMembreForm(!viewModel.showMembreForm)}><IoPersonAdd /><span>Ajouter</span></Button>
      </div>
      <div className="projetDetails__card-body">
        {viewModel.showMembreForm && (
          <div className="projetDetails__membre-form">
            <select value={viewModel.newMembreId} onChange={(event) => viewModel.setNewMembreId(event.target.value)} className="projetDetails__employe-select">
              <option value="">Sélectionner un employé...</option>
              {viewModel.availableMemberOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select value={viewModel.newRole} onChange={(event) => viewModel.setNewRole(event.target.value as 'membre' | 'observateur')}>
              <option value="membre">Membre</option><option value="observateur">Observateur</option>
            </select>
            <Button style="gradient" onClick={() => void viewModel.addMember()}>Ajouter</Button>
            <Button style="white" onClick={() => viewModel.setShowMembreForm(false)}>Annuler</Button>
          </div>
        )}
        {viewModel.membresLoading ? (
          <div className="projetDetails__loading-small">Chargement...</div>
        ) : viewModel.membres.length === 0 ? (
          <div className="projetDetails__empty">Aucun membre</div>
        ) : (
          <div className="projetDetails__membres-list">
            {viewModel.membres.map((membre) => (
              <div key={membre.id_membre} className="projetDetails__membre-item">
                <div className="projetDetails__membre-info">
                  <span className="projetDetails__membre-name">{membre.employe?.prenom} {membre.employe?.nom}</span>
                  <span className={`projetDetails__membre-role projetDetails__membre-role--${membre.role}`}>{membre.role}</span>
                </div>
                <Button style="white" onClick={() => void viewModel.removeMember(membre.id_membre)} className="projetDetails__membre-remove">×</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
