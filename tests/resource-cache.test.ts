import assert from "node:assert/strict";
import test from "node:test";
import {
  cacheResource,
  clearResources,
  readResource,
  resourceGeneration,
} from "../lib/api/resource-cache.ts";
test("resource cache cannot be repopulated by a request from a cleared session", () => {
  clearResources();
  const before = resourceGeneration();
  cacheResource("old-user:org", { private: "old" }, before);
  clearResources();
  cacheResource("old-user:org", { private: "late" }, before);
  assert.equal(readResource("old-user:org"), undefined);
});
test("user and workspace keys stay isolated", () => {
  clearResources();
  cacheResource("user-a:org-a:jobs", { jobs: ["a"] }, resourceGeneration());
  cacheResource("user-b:org-b:jobs", { jobs: ["b"] }, resourceGeneration());
  assert.deepEqual(readResource("user-a:org-a:jobs")?.data, { jobs: ["a"] });
  assert.equal(readResource("user-a:org-b:jobs"), undefined);
});
test("resource cache stays bounded", () => {
  clearResources();
  for (let i = 0; i < 101; i++)
    cacheResource(String(i), {}, resourceGeneration());
  assert.equal(readResource("0"), undefined);
  assert.ok(readResource("100"));
});
