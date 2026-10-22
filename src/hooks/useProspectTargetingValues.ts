import { useCallback, useRef, useState } from "react";
import { getTargetingOptions } from "../API/services/index.ts";
import { createTargetingOptionsLoader } from "../utils/scripts/index.ts";
import type { TargetingChoice } from "../utils/types/index.ts";
export function useProspectTargetingValues(campaign: number | null) {
  const loader = useRef(createTargetingOptionsLoader(getTargetingOptions));
  const [choices, setChoices] = useState<Record<string, TargetingChoice[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const load = useCallback(
    async (field: string, search: string): Promise<TargetingChoice[]> => {
      if (!campaign) return [];
      try {
        const values = await loader.current(campaign, field, search);
        setChoices((previous) => ({
          ...previous,
          [field]: [
            ...new Map(
              [...(previous[field] ?? []), ...values].map((option) => [
                option.value,
                option,
              ]),
            ).values(),
          ],
        }));
        setErrors((previous) =>
          previous[field] ? { ...previous, [field]: "" } : previous,
        );
        return values;
      } catch (error: unknown) {
        setErrors((previous) => ({
          ...previous,
          [field]:
            error instanceof Error
              ? error.message
              : "Liste indisponible. Réessayez.",
        }));
        return [];
      }
    },
    [campaign],
  );
  return { load, errors, choices };
}
