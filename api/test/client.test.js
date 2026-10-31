import { test } from "node:test";
import assert from "node:assert/strict";
import { MyLearnQ, MyLearnQAuthError, decodeDevalue, challengePhase } from "../src/index.js";

test("decodeDevalue: objecten, arrays en verwijzingen", () => {
  // { a: 1, list: [ "x", { b: true } ], same: <zelfde object als list[1]> }
  const arr = [{ a: 1, list: 2, same: 4 }, 1, [3, 4], "x", { b: 5 }, true];
  const v = decodeDevalue(arr);
  assert.equal(v.a, 1);
  assert.deepEqual(v.list[1], { b: true });
  assert.equal(v.same, v.list[1]);
});

test("decodeDevalue: speciale waarden en types", () => {
  const arr = [{ u: -1, n: -3, inf: -4, d: 1, s: 2, m: 3, nul: 4 }, ["Date", "2026-10-31T10:00:00.000Z"], ["Set", 5, 6], ["Map", 5, 6], null, "k", 7];
  const v = decodeDevalue(arr);
  assert.equal(v.u, undefined);
  assert.ok(Number.isNaN(v.n));
  assert.equal(v.inf, Infinity);
  assert.ok(v.d instanceof Date);
  assert.deepEqual([...v.s], ["k", 7]);
  assert.equal(v.m.get("k"), 7);
  assert.equal(v.nul, null);
});

test("challengePhase", () => {
  assert.equal(challengePhase({ startPreparationDate: "2026-09-01", preparationProgress: 40 }).key, "preparation");
  assert.equal(challengePhase({ startExecutionDate: "2026-09-10", executionProgress: 20 }).progress, 20);
  assert.equal(challengePhase({ startExecutionDate: "x", startEvaluationDate: "y" }).key, "evaluation");
  assert.equal(challengePhase({ endChallengeDate: "2026-10-08" }).key, "done");
  assert.equal(challengePhase({ startExecutionDate: "" }).key, "preparation");
});

function fakeFetch(routes) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    const body = routes[new URL(url).pathname];
    if (!body) return new Response("nope", { status: 404 });
    return new Response(typeof body === "string" ? body : JSON.stringify(body), { status: 200 });
  };
  fn.calls = calls;
  return fn;
}

const rootNode = { type: "data", data: [{ session: 1, dbUser: 2, supabaseEnv: 1 }, "geheim", { userId: 3, name: 4 }, 7, "Test, Leerling"] };

test("route voegt nodes samen en verwijdert geheimen", async () => {
  const fetch = fakeFetch({
    "/student/__data.json": { type: "data", nodes: [rootNode, null, { type: "data", data: [{ hello: 1 }, "wereld"] }] }
  });
  const c = new MyLearnQ({ fetch, cookie: "a=b" });
  const d = await c.route("/student");
  assert.equal(d.session, undefined);
  assert.equal(d.supabaseEnv, undefined);
  assert.equal(d.hello, "wereld");
  assert.equal(d.dbUser.userId, 7);
  assert.equal(fetch.calls[0].init.headers.cookie, "a=b");
});

test("challenges gebruikt het id van me() en rekent fases uit", async () => {
  const fetch = fakeFetch({
    "/student/__data.json": { type: "data", nodes: [rootNode] },
    "/challenges/7/__data.json": JSON.stringify({ type: "data", nodes: [rootNode, { type: "data", data: [{ challenges: 1, maxOpenChallenges: 6 }, [2, 3], { title: 4, endChallengeDate: 5 }, { title: 4, startExecutionDate: 5 }, "T", "2026-10-01", 6] }] }) + "\n"
  });
  const c = new MyLearnQ({ fetch });
  const r = await c.challenges();
  assert.equal(r.challenges.length, 2);
  assert.equal(r.completed.length, 1);
  assert.equal(r.active[0].phase.key, "execution");
  assert.equal(r.maxOpen, 6);
});

test("redirect naar inloggen geeft MyLearnQAuthError", async () => {
  const fetch = fakeFetch({ "/student/__data.json": { type: "redirect", location: "/login" } });
  const c = new MyLearnQ({ fetch });
  await assert.rejects(() => c.me(), MyLearnQAuthError);
});
