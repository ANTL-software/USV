import { useState, useCallback } from 'react';

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

export function useTooltip(minLength = 20) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, content: '', x: 0, y: 0,
  });

  const handleMouseEnter = useCallback((event: React.MouseEvent, content: string) => {
    if (content && content !== 'N/A' && content.length > minLength) {
      setTooltip({ visible: true, content, x: event.clientX + 10, y: event.clientY - 10 });
    }
  }, [minLength]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (tooltip.visible) {
      setTooltip(prev => ({ ...prev, x: event.clientX + 10, y: event.clientY - 10 }));
    }
  }, [tooltip.visible]);

  const handleMouseLeave = useCallback(() => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  }, []);

  return { tooltip, handleMouseEnter, handleMouseMove, handleMouseLeave };
}
