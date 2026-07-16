import type { ReactElement } from 'react';
import { IoPersonAdd } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import type { SingleValue } from 'react-select';
import type { AgentsListViewModel } from '../../../hooks/index.ts';
import { EMPLOYEE_FILTER_OPTIONS } from '../../../utils/scripts/index.ts';
import type { EmployeeFilterOption } from '../../../utils/scripts/index.ts';
import { Button } from '../button/index.ts';

interface AgentsListHeaderProps { viewModel: AgentsListViewModel }

export function AgentsListHeader({ viewModel }: AgentsListHeaderProps): ReactElement {
  const count = viewModel.filteredEmployees.length;
  return (
    <>
      <div className="agentsList__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button></div>
      <div className="agentsList__header">
        <div><h1>Employés</h1><p className="agentsList__subtitle">{count} employé{count !== 1 ? 's' : ''} affiché{count !== 1 ? 's' : ''}</p></div>
        <div className="agentsList__controls">
          <Select<EmployeeFilterOption> options={EMPLOYEE_FILTER_OPTIONS} value={viewModel.selectedFilter} onChange={(option: SingleValue<EmployeeFilterOption>) => option && viewModel.setFilterValue(option.value)} isSearchable={false} classNamePrefix="reactSelect" />
          <Button style="gradient" onClick={viewModel.navigateNewEmployee}><IoPersonAdd /> Nouvel employé</Button>
        </div>
      </div>
    </>
  );
}
