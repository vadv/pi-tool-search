import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import toolSearchExtension from "../extensions/index.ts";

test("tool_search refreshes the catalog for tools registered after turn_start", async () => {
  const home = mkdtempSync(join(tmpdir(), "pi-tool-search-late-"));
  const previousHome = process.env.PI_CODING_AGENT_DIR;
  process.env.PI_CODING_AGENT_DIR = home;
  try {
    mkdirSync(home, { recursive: true });
    writeFileSync(join(home, "settings.json"), JSON.stringify({ toolSearch: { deferredTools: ["browser_*"] } }));
    const tools = [{ name: "read", description: "Read a file" }];
    const handlers = new Map();
    let searchTool;
    let active = [];
    const pi = {
      on(name, fn) { handlers.set(name, fn); },
      getAllTools: () => tools,
      setActiveTools: (names) => { active = names; },
      registerTool: (definition) => { searchTool = definition; },
      sendMessage() {},
    };
    toolSearchExtension(pi);
    const ui = { setStatus() {}, notify() {} };
    await handlers.get("session_start")({}, { ui });
    await handlers.get("turn_start")({}, { ui });
    tools.push({ name: "browser_new_page", description: "Open a browser page" });
    const result = await searchTool.execute("call-1", { names: ["browser_new_page"] }, undefined, undefined, { isIdle: () => false });
    assert.deepEqual(result.details.unknown, []);
    assert.deepEqual(result.details.enabled, ["browser_new_page"]);
    assert.ok(active.includes("browser_new_page"));
  } finally {
    if (previousHome === undefined) delete process.env.PI_CODING_AGENT_DIR;
    else process.env.PI_CODING_AGENT_DIR = previousHome;
    rmSync(home, { recursive: true, force: true });
  }
});
