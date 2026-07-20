import type { KeyboardEvent, ReactElement } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import type { ProspectsViewPageViewModel } from '../../../hooks/index.ts';

type ProspectsPaginationProps = Pick<ProspectsViewPageViewModel, 'applyPageJump' | 'currentPage' | 'jumpToPage' | 'nextPage' | 'pagination' | 'previousPage' | 'setJumpToPage'>;

export function ProspectsPagination(props: ProspectsPaginationProps): ReactElement | null {
  if (!props.pagination || props.pagination.totalPages <= 1) return null;
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => { if (event.key === 'Enter') props.applyPageJump(); };
  return (
    <div className="prospectsView__pagination">
      <button className="pagination-btn" onClick={props.previousPage} disabled={props.currentPage === 1}><IoChevronBack />Précédent</button>
      <div className="pagination-center"><span className="pagination-info">Page <input type="number" min="1" max={props.pagination.totalPages} value={props.jumpToPage} onChange={(event) => props.setJumpToPage(event.target.value)} onKeyDown={onKeyDown} placeholder={props.currentPage.toString()} className="pagination-jump-input" /> sur {props.pagination.totalPages}</span><span className="pagination-total">({props.pagination.total} prospects)</span></div>
      <button className="pagination-btn" onClick={props.nextPage} disabled={props.currentPage === props.pagination.totalPages}>Suivant<IoChevronForward /></button>
    </div>
  );
}
