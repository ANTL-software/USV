import type { CSSProperties, ReactElement } from 'react';
import type { Employe } from '../../../utils/types/index.ts';
import { getEmployePhotoUrl } from '../../../utils/scripts/index.ts';

interface AgentPhotoTooltipProps { employee: Employe; x: number; y: number }

export function AgentPhotoTooltip({ employee, x, y }: AgentPhotoTooltipProps): ReactElement {
  const position: CSSProperties = { left: x + 15, top: y + 15 };
  return (
    <div className="agentsList__photo-tooltip" style={position}>
      {employee.photo_path ? <img src={getEmployePhotoUrl(employee.photo_path) || ''} alt={`${employee.prenom} ${employee.nom}`} className="agentsList__tooltip-img" /> : <div className="agentsList__tooltip-placeholder"><span>Aucune photo</span></div>}
    </div>
  );
}
