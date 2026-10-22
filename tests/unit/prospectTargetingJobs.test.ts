import assert from "node:assert/strict";
import { mock, test } from "node:test";
const calls: { method: string; url: string; config?: Record<string, unknown> }[] = [];
let reply: unknown;
let polled: unknown;
let networkFailures = 0;
mock.module(new URL("../../src/API/APICalls.ts", import.meta.url).href, {
  namedExports: {
    postRequest: async (url: string, _body: unknown, config?: Record<string, unknown>) => {
      calls.push({ method: "POST", url, config });
      return { data: { success: true, data: reply } };
    },
    getRequest: async (url: string, config?: Record<string, unknown>) => {
      calls.push({ method: "GET", url, config });
      if (networkFailures > 0) { networkFailures -= 1; throw new Error("network interruption"); }
      return { data: { success: true, data: polled } };
    },
    putRequest: async () => ({}), deleteRequest: async () => ({}),
  },
});
const service = await import("../../src/API/services/prospectTargeting.service.ts");
test("confirmation submits a quick request and polls instead of keeping an HTTP request open", async () => {
  calls.length = 0;
  const result = { id: "operation", action: "inject", affected: 1000, skipped: 0, cancelled_reminders: 0 };
  reply = { id: "job", kind: "execute", status: "queued", result: null, error: null };
  polled = { id: "job", kind: "execute", status: "completed", result, error: null };
  assert.deepEqual(await service.executeTargeting(17, "operation"), result);
  assert.deepEqual(calls.map(({ method, url }) => [method, url]), [
    ["POST", "/campagnes/17/targeting/operations/operation/jobs/execute"],
    ["GET", "/campagnes/17/targeting/jobs/job"],
  ]);
  assert.equal(calls[0].config?.timeout, 15000);
  assert.equal(calls[1].config?.timeout, 10000);
});
test("a database budget failure is shown as a controlled operation error", async () => {
  calls.length = 0;
  reply = { id: "job", kind: "execute", status: "failed", result: null, error: { message: "Précisez les filtres.", statusCode: 422 } };
  await assert.rejects(service.executeTargeting(17, "operation"), /Précisez les filtres/);
  assert.equal(calls.length, 1);
});
test("a transient polling failure never submits the injection again", async () => {
  calls.length = 0;
  networkFailures = 1;
  const result = { id: "operation", action: "inject", affected: 1, skipped: 0, cancelled_reminders: 0 };
  reply = { id: "job", kind: "execute", status: "queued", result: null, error: null };
  polled = { id: "job", kind: "execute", status: "completed", result, error: null };
  assert.deepEqual(await service.executeTargeting(17, "operation"), result);
  assert.equal(calls.filter((call) => call.method === "POST").length, 1);
  assert.equal(calls.filter((call) => call.method === "GET").length, 2);
});
