import type {
  TargetingCatalog,
  TargetingChoice,
  TargetingRow,
  TargetingCriterion,
  TargetingValue,
} from "../types/index.ts";
export const TARGETING_OPERATORS: Record<string, string> = {
  eq: "Est égal à",
  ne: "Est différent de",
  in: "Est parmi",
  not_in: "N’est pas parmi",
  contains: "Contient",
  not_contains: "Ne contient pas",
  gte: "Au moins / à partir du",
  lte: "Au plus / jusqu’au",
  exists: "Est renseigné",
  missing: "Est absent",
  range: "Plage d’effectif",
};
export function newTargetingCriterion(
  field: string,
  catalog: TargetingCatalog,
): TargetingCriterion {
  const definition = catalog.fields.find((item) => item.field === field);
  const type = definition?.type;
  const value: TargetingValue =
    type === "workforce"
      ? { min: 20, max: null, include_unknown: true }
      : type === "radius"
        ? { postcode: "", km: 50 }
        : type === "boolean"
          ? true
          : type === "category"
            ? "ecoles"
            : type === "number"
              ? 0
              : ["list", "campaigns"].includes(type ?? "")
                ? []
                : "";
  return { field, operator: definition?.operators[0] ?? "eq", value };
}
export function targetingCsv(rows: TargetingRow[]): string {
  const quote = (value: unknown): string =>
    `"${String(value ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replace(/"/g, '""')}"`;
  return (
    "\ufeff" +
    [
      [
        "ID",
        "Entreprise",
        "CP",
        "Commune",
        "Activité",
        "Téléphone",
        "Source",
        "Effectif min",
        "Effectif max",
        "Origine",
      ],
      ...rows.map(({ id_prospect, snapshot: p }) => [
        id_prospect,
        p.raison_sociale,
        p.code_postal,
        p.ville,
        p.activite,
        p.telephone,
        p.source,
        p.workforce.min,
        p.workforce.max,
        p.workforce.origine,
      ]),
    ]
      .map((line) => line.map(quote).join(";"))
      .join("\r\n")
  );
}

export function createTargetingOptionsLoader(
  load: (
    campaign: number,
    field: string,
    search: string,
  ) => Promise<TargetingChoice[]>,
  capacity = 80,
) {
  const requests = new Map<string, Promise<TargetingChoice[]>>();
  return (campaign: number, field: string, search: string) => {
    const key = JSON.stringify([campaign, field, search]);
    const cached = requests.get(key);
    if (cached) return cached;
    const request = load(campaign, field, search).catch((error: unknown) => {
      if (requests.get(key) === request) requests.delete(key);
      throw error;
    });
    requests.set(key, request);
    if (requests.size > capacity) {
      const oldest = requests.keys().next();
      if (!oldest.done) requests.delete(oldest.value);
    }
    return request;
  };
}

export function selectedTargetingValues(
  choices: readonly TargetingChoice[],
): string[] {
  return [
    ...new Set(
      choices.map((choice) => choice.value).filter((value) => value.trim()),
    ),
  ];
}
