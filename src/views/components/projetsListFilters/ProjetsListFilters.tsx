import type { KeyboardEvent, ReactElement } from 'react';
import { IoFilter, IoSearch } from 'react-icons/io5';
import type { ProjetsListViewModel } from '../../../hooks/index.ts';
import type { Priorite, StatutProjet, TypeProjet } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

interface ProjetsListFiltersProps { viewModel: ProjetsListViewModel }

export function ProjetsListFilters({ viewModel }: ProjetsListFiltersProps): ReactElement {
  const applyOnEnter = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') viewModel.applySearch();
  };
  return (
    <div className="projetsList__filters">
      <div className="projetsList__search"><IoSearch /><input type="search" placeholder="Rechercher un projet..." value={viewModel.searchTerm} onChange={(event) => viewModel.setSearchTerm(event.target.value)} onKeyDown={applyOnEnter} /></div>
      <div className="projetsList__filter-selects">
        <select aria-label="Statut" value={viewModel.filters.statut || ''} onChange={(event) => viewModel.setStatusFilter(event.target.value as StatutProjet | '')}>
          <option value="">Tous les statuts</option><option value="brouillon">Brouillon</option><option value="actif">Actif</option><option value="en_pause">En pause</option><option value="termine">Terminé</option><option value="annule">Annulé</option>
        </select>
        <select aria-label="Type" value={viewModel.filters.type_projet || ''} onChange={(event) => viewModel.setTypeFilter(event.target.value as TypeProjet | '')}>
          <option value="">Tous les types</option><option value="developpement">Développement</option><option value="commercial">Commercial</option><option value="administratif">Administratif</option><option value="marketing">Marketing</option><option value="rh">RH</option><option value="technique">Technique</option><option value="autre">Autre</option>
        </select>
        <select aria-label="Priorité" value={viewModel.filters.priorite || ''} onChange={(event) => viewModel.setPriorityFilter(event.target.value as Priorite | '')}>
          <option value="">Toutes les priorités</option><option value="critique">Critique</option><option value="haute">Haute</option><option value="normale">Normale</option><option value="basse">Basse</option>
        </select>
      </div>
      {viewModel.hasActiveFilters && <Button style="white" onClick={viewModel.resetFilters}><IoFilter /><span>Réinitialiser</span></Button>}
    </div>
  );
}
