import { useProspectTargetingEditor } from "./useProspectTargetingEditor.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  deactivateTargeting,
  executeTargeting,
  getCampagneByIdService,
  getTargetingCatalog,
  getTargetingHistory,
  getTargetingRows,
  getTargetings,
  previewTargeting,
  saveTargeting,
} from "../API/services/index.ts";
import { useAlert } from "../context/alert/index.ts";
import { parseCampaignRouteId, targetingCsv } from "../utils/scripts/index.ts";
import type {
  TargetingAction,
  TargetingCatalog,
  TargetingGroup,
  TargetingHistory,
  TargetingPreview,
  TargetingResult,
  TargetingSaved,
} from "../utils/types/index.ts";
const EMPTY_CATALOG: TargetingCatalog = { fields: [], categories: [] };
export function useProspectInjectionPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const campagneId = parseCampaignRouteId(id);
  const navigate = useNavigate();
  const { showConfirm, showError, showSuccess } = useAlert();
  const [campagneNom, setCampagneNom] = useState("");
  const [catalog, setCatalog] = useState<TargetingCatalog>(EMPTY_CATALOG);
  const [criteria, setCriteria] = useState<TargetingGroup>({
    logic: "and",
    rules: [],
  });
  const [action, setAction] = useState<TargetingAction>(
    searchParams.get("action") === "withdraw" ? "withdraw" : "inject",
  );
  const [nom, setNom] = useState("");
  const [limit, setLimit] = useState(5000);
  const [allowAll, setAllowAll] = useState(false);
  const [saved, setSaved] = useState<TargetingSaved[]>([]);
  const [history, setHistory] = useState<TargetingHistory[]>([]);
  const [preview, setPreview] = useState<TargetingPreview | null>(null);
  const [result, setResult] = useState<TargetingResult | null>(null);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const revision = useRef(0);
  const running = useRef(false);
  const invalidate = useCallback(() => {
    revision.current += 1;
    setPreview(null);
    setResult(null);
    setPage(1);
  }, []);
  const changeGuidedCriteria = useCallback(
    (next: TargetingGroup) => {
      invalidate();
      setCriteria(next);
    },
    [invalidate],
  );
  const guided = useProspectTargetingEditor(
    criteria,
    catalog,
    changeGuidedCriteria,
    campagneId,
  );
  const refresh = useCallback(async () => {
    if (!campagneId) return;
    const [rules, operations] = await Promise.all([
      getTargetings(campagneId),
      getTargetingHistory(campagneId),
    ]);
    setSaved(rules);
    setHistory(operations);
  }, [campagneId]);
  useEffect(() => {
    if (!campagneId) return;
    let cancelled = false;
    revision.current += 1;
    queueMicrotask(() => {
      if (cancelled) return;
      setCriteria({ logic: "and", rules: [] });
      setPreview(null);
      setResult(null);
      setSaved([]);
      setHistory([]);
      setCatalog(EMPTY_CATALOG);
      setNom("");
      setAllowAll(false);
      setPage(1);
      setError("");
    });
    void Promise.all([
      getTargetingCatalog(campagneId),
      getCampagneByIdService(campagneId),
      getTargetings(campagneId),
      getTargetingHistory(campagneId),
    ])
      .then(([available, campaign, rules, operations]) => {
        if (!cancelled) {
          setCatalog(available);
          setCampagneNom(campaign.toJSON().nom_campagne);
          setSaved(rules);
          setHistory(operations);
        }
      })
      .catch((failure: unknown) => {
        if (!cancelled)
          setError(
            failure instanceof Error
              ? failure.message
              : "Chargement impossible.",
          );
      });
    return () => {
      cancelled = true;
      revision.current += 1;
    };
  }, [campagneId]);
  async function run(work: () => Promise<void>): Promise<void> {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (failure: unknown) {
      const message =
        failure instanceof Error ? failure.message : "Opération impossible.";
      setError(message);
      void showError(message);
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  const analyze = (): void => {
    void run(async () => {
      if (!campagneId) return;
      const version = revision.current;
      const lot = await previewTargeting(campagneId, {
        criteria,
        action,
        limit,
        nom,
        allow_all: allowAll,
      });
      if (version === revision.current) {
        setPreview(lot);
        setPage(1);
        setResult(null);
      }
    });
  };
  const execute = (): void => {
    void run(async () => {
      if (!campagneId || !preview) return;
      const version = revision.current;
      const message = `${preview.summary.selected.toLocaleString("fr-FR")} fiches sélectionnées pour « ${nom} ». ${preview.summary.reminders} rappels commerciaux seront annulés lors d’un retrait. Les leads et rendez-vous clients sont conservés.${action === "exclude" ? " Une exclusion durable sera également créée pour cette campagne." : ""}`;
      if (
        !(await showConfirm(message, "Confirmer l’opération")) ||
        version !== revision.current
      )
        return;
      const applied = await executeTargeting(campagneId, preview.id);
      setResult(applied);
      setPreview(null);
      await refresh();
      void showSuccess(
        `${applied.affected} fiches traitées, ${applied.cancelled_reminders} rappels annulés, ${applied.skipped} fiches écartées après revalidation.`,
      );
    });
  };
  const save = (): void => {
    void run(async () => {
      if (!campagneId) return;
      await saveTargeting(campagneId, nom, criteria);
      await refresh();
      void showSuccess("Ciblage enregistré.");
    });
  };
  const disableSaved = (rule: TargetingSaved): void => {
    void run(async () => {
      if (
        !campagneId ||
        !(await showConfirm(
          `Désactiver « ${rule.nom} » ? Les fiches retirées et les rappels annulés ne seront pas restaurés.`,
          "Désactiver la règle",
        ))
      )
        return;
      await deactivateTargeting(campagneId, rule.id);
      invalidate();
      await refresh();
    });
  };
  const loadSaved = (rule: TargetingSaved): void => {
    invalidate();
    setCriteria(rule.criteria);
    setNom(rule.nom);
    setAllowAll(false);
  };
  const loadPage = (next: number): void => {
    void run(async () => {
      if (!campagneId || !preview) return;
      const lot = preview.id;
      const version = revision.current;
      const lines = await getTargetingRows(campagneId, lot, next);
      setPreview((current) =>
        current?.id === lot ? { ...current, rows: lines } : current,
      );
      if (revision.current === version) setPage(next);
    });
  };
  const exportLot = (): void => {
    void run(async () => {
      if (!campagneId || !preview) return;
      const lines: TargetingPreview["rows"] = [];
      // Export the fixed lot independently of the currently displayed page.
      for (
        let current = 1;
        current <= Math.ceil(preview.summary.selected / 50);
        current += 1
      )
        lines.push(
          ...(await getTargetingRows(campagneId, preview.id, current)),
        );
      const url = URL.createObjectURL(
        new Blob([targetingCsv(lines)], { type: "text/csv;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `ciblage-${preview.id}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };
  return {
    guided,
    campagneId,
    campagneNom,
    catalog,
    action,
    nom,
    limit,
    allowAll,
    saved,
    history: history.map((operation) => ({
      ...operation,
      display: `${operation.nom} · ${{ inject: "Injection", withdraw: "Retrait", exclude: "Exclusion durable", restore: "Réinjection" }[operation.action]} · ${operation.statut === "completed" ? "Exécuté" : "Analyse"} · ${operation.summary.selected} fiches · ${new Date(operation.created_at).toLocaleString("fr-FR")} · ${operation.auteur ?? ""}`,
    })),
    preview,
    result,
    busy,
    error,
    page,
    totalPages: preview ? Math.ceil(preview.summary.selected / 50) : 0,
    summaryText: guided.summary,
    canExecute: Boolean(
      preview &&
      (preview.summary.selected > 0 || action === "exclude") &&
      !result,
    ),
    navigateBack: () => void navigate("/operations/prospects"),
    changeAction: (value: TargetingAction) => {
      invalidate();
      setAction(value);
    },
    changeName: (value: string) => {
      invalidate();
      setNom(value);
    },
    changeLimit: (value: string) => {
      invalidate();
      setLimit(Number(value));
    },
    changeAllowAll: (value: boolean) => {
      invalidate();
      setAllowAll(value);
    },
    analyze,
    execute,
    save,
    disableSaved,
    loadSaved,
    loadPage,
    exportLot,
    restoreLot: (operation: TargetingHistory) => {
      invalidate();
      setAction("restore");
      setNom(`Restaurer ${operation.nom}`.slice(0, 160));
      setCriteria({
        logic: "and",
        rules: [{ field: "lot", operator: "eq", value: operation.id }],
      });
    },
    viewHistory: (operation: TargetingHistory) => {
      void run(async () => {
        if (!campagneId) return;
        const lines = await getTargetingRows(campagneId, operation.id, 1);
        invalidate();
        setAction(operation.action);
        setNom(operation.nom);
        setPreview({
          id: operation.id,
          action: operation.action,
          summary: operation.summary,
          rows: lines,
        });
        setResult(operation.result);
      });
    },
  };
}
export type ProspectInjectionPageViewModel = ReturnType<
  typeof useProspectInjectionPage
>;
