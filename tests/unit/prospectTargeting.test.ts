import assert from "node:assert/strict";
import { test } from "node:test";
import { targetingCsv } from "../../src/utils/scripts/prospectTargeting.ts";
import type {
  TargetingCatalog,
  TargetingGroup,
  TargetingRow,
} from "../../src/utils/types/prospectTargeting.types.ts";
const catalog: TargetingCatalog = {
  fields: [
    {
      field: "effectif",
      label: "Taille",
      group: "Effectif",
      type: "workforce",
      operators: ["range"],
    },
    {
      field: "departement",
      label: "Départements",
      group: "Géographie",
      type: "list",
      operators: ["in", "not_in"],
    },
  ],
  categories: [],
};
test("l’export protège les formules tableur et échappe séparateurs et guillemets", () => {
  const row: TargetingRow = {
    id_prospect: 1,
    applied: false,
    snapshot: {
      raison_sociale: '=CMD("x")',
      code_postal: "06000",
      ville: "Nice",
      activite: null,
      telephone: "0100000000",
      source: null,
      workforce: { min: null, max: null, known: false, origine: "historique" },
    },
  };
  const csv = targetingCsv([row]);
  assert.ok(csv.includes(`"'=CMD(""x"")"`));
  assert.ok(csv.includes('"06000"'));
});

test("le parcours guidé conserve le sens des anciennes combinaisons et applique les exclusions à toutes les sélections", async () => {
  const {
    decodeGuidedTargeting,
    encodeGuidedTargeting,
    describeGuidedTargeting,
  } = await import("../../src/utils/scripts/prospectTargetingGuided.ts");
  const original: TargetingGroup = {
    logic: "and",
    rules: [
      {
        logic: "or",
        rules: [
          { field: "departement", operator: "in", value: ["75"] },
          { field: "departement", operator: "in", value: ["83"] },
        ],
      },
      {
        field: "effectif",
        operator: "range",
        value: { min: 20, max: null, include_unknown: true },
      },
      { field: "code_postal", operator: "not_in", value: ["17000"] },
    ],
  };
  const decoded = decodeGuidedTargeting(original);
  assert.ok(decoded);
  assert.equal(decoded.profiles.length, 2);
  assert.equal(decoded.exclusions.length, 1);
  assert.ok(decoded.profiles.every((profile) => profile.length === 2));
  const encoded = encodeGuidedTargeting(decoded);
  assert.deepEqual(decodeGuidedTargeting(encoded), decoded);
  assert.match(
    describeGuidedTargeting(decoded, catalog),
    /Une fiche peut appartenir à l’une ou l’autre/,
  );
  assert.doesNotMatch(
    describeGuidedTargeting(decoded, catalog),
    /\bET\b|\bOU\b/,
  );
});
test("une sélection alternative vide n’élargit jamais la recherche", async () => {
  const { encodeGuidedTargeting } =
    await import("../../src/utils/scripts/prospectTargetingGuided.ts");
  const selected = { field: "departement", operator: "in", value: ["75"] };
  assert.deepEqual(
    encodeGuidedTargeting({ profiles: [[selected], []], exclusions: [] }),
    { logic: "and", rules: [selected] },
  );
});
test("un ancien ciblage trop complexe reste intact au lieu d’être simplifié arbitrairement", async () => {
  const { decodeGuidedTargeting } =
    await import("../../src/utils/scripts/prospectTargetingGuided.ts");
  const original: TargetingGroup = {
    logic: "or",
    rules: Array.from({ length: 13 }, (_, n) => ({
      field: "id_prospect",
      operator: "eq",
      value: n + 1,
    })),
  };
  const before = JSON.stringify(original);
  assert.equal(decodeGuidedTargeting(original), null);
  assert.equal(JSON.stringify(original), before);
});

test("une liste vide et des bornes incohérentes doivent être complétées avant analyse", async () => {
  const { incompleteTargetingChoice } =
    await import("../../src/utils/scripts/prospectTargetingGuided.ts");
  assert.equal(
    incompleteTargetingChoice(
      { field: "departement", operator: "in", value: [] },
      catalog,
    ),
    true,
  );
  assert.equal(
    incompleteTargetingChoice(
      { field: "departement", operator: "in", value: ["06"] },
      catalog,
    ),
    false,
  );
  assert.equal(
    incompleteTargetingChoice(
      {
        field: "effectif",
        operator: "range",
        value: { min: 30, max: 20, include_unknown: true },
      },
      catalog,
    ),
    true,
  );
  assert.equal(
    incompleteTargetingChoice(
      {
        field: "effectif",
        operator: "range",
        value: { min: 20, max: null, include_unknown: true },
      },
      catalog,
    ),
    false,
  );
  assert.equal(
    incompleteTargetingChoice(
      { field: "departement", operator: "missing" },
      catalog,
    ),
    false,
  );
});

test("une alternative sans restriction conserve le sens d’un ancien ciblage avec exclusions communes", async () => {
  const { decodeGuidedTargeting, encodeGuidedTargeting } =
    await import("../../src/utils/scripts/prospectTargetingGuided.ts");
  const exclusion = { field: "departement", operator: "not_in", value: ["06"] };
  const decoded = decodeGuidedTargeting({
    logic: "or",
    rules: [
      { logic: "and", rules: [exclusion] },
      {
        logic: "and",
        rules: [
          exclusion,
          { field: "departement", operator: "in", value: ["75"] },
        ],
      },
    ],
  });
  assert.ok(decoded);
  assert.deepEqual(encodeGuidedTargeting(decoded), {
    logic: "and",
    rules: [exclusion],
  });
});

test("les recherches de listes dédupliquent les appels, réessaient les échecs et bornent leur cache", async () => {
  const { createTargetingOptionsLoader } =
    await import("../../src/utils/scripts/prospectTargeting.ts");
  let calls = 0;
  const load = createTargetingOptionsLoader(
    async (_campaign, _field, search) => {
      calls++;
      if (search === "erreur") throw new Error("liste indisponible");
      return [{ value: search, label: search }];
    },
    2,
  );
  const first = load(17, "activite", "école");
  assert.equal(load(17, "activite", "école"), first);
  await first;
  assert.equal(calls, 1);
  await assert.rejects(load(17, "activite", "erreur"));
  await assert.rejects(load(17, "activite", "erreur"));
  assert.equal(calls, 3);
  await load(17, "activite", "commerce");
  await load(17, "activite", "artisanat");
  await load(17, "activite", "école");
  assert.equal(calls, 6);
  await load(18, "activite", "école");
  assert.equal(calls, 7);
});

test("les valeurs choisies dans une liste conservent les espaces présents en base", async () => {
  const { selectedTargetingValues } =
    await import("../../src/utils/scripts/prospectTargeting.ts");
  assert.deepEqual(
    selectedTargetingValues([
      { value: " source importée ", label: "Source importée" },
      { value: " source importée ", label: "Doublon" },
    ]),
    [" source importée "],
  );
});
