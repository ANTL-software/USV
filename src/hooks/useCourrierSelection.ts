import { useState, useCallback } from 'react';
import type { ICourrier } from '../utils/types/index.ts';

export function useCourrierSelection(courriers: ICourrier[]) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = useCallback((id: number, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((checked: boolean) => {
    setSelected(checked ? new Set(courriers.map(c => c.id)) : new Set());
  }, [courriers]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const isAllSelected = selected.size > 0 && selected.size === courriers.length;

  return { selected, toggle, toggleAll, clear, isAllSelected };
}
