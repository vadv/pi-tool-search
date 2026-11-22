import assert from "node:assert/strict";
import test from "node:test";
import { isDeferredTool, matchesToolPattern } from "../extensions/deferred.ts";

test("matches exact tool names", () => {
	assert.equal(matchesToolPattern("web_search", "web_search"), true);
	assert.equal(matchesToolPattern("web_search_extra", "web_search"), false);
});

test("matches wildcards without treating other regex characters specially", () => {
	assert.equal(matchesToolPattern("browser_take_screenshot", "browser_*"), true);
	assert.equal(matchesToolPattern("browser", "browser_*"), false);
	assert.equal(matchesToolPattern("tool.name", "tool.name"), true);
	assert.equal(matchesToolPattern("toolxname", "tool.name"), false);
});

test("defers only configured tools and supports an explicit always-enabled override", () => {
	const deferred = ["browser_*", "web_search", "subagent"];
	const alwaysEnabled = new Set(["browser_status"]);
	const activeByDefault = (name) =>
		!isDeferredTool(name, deferred) || alwaysEnabled.has(name);

	assert.equal(activeByDefault("read"), true);
	assert.equal(activeByDefault("hindsight_search_knowledge_pages"), true);
	assert.equal(activeByDefault("bg_run"), true);
	assert.equal(activeByDefault("browser_take_snapshot"), false);
	assert.equal(activeByDefault("browser_status"), true);
	assert.equal(activeByDefault("web_search"), false);
	assert.equal(activeByDefault("subagent"), false);
});

test("empty deferred list preserves upstream default-mode decision", () => {
	assert.equal(isDeferredTool("browser_take_snapshot", []), false);
});
