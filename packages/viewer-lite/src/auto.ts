import { boot, parseBpmnLite, render } from "./index.js"

// IIFE entry: `BpmnLite` global plus auto-boot once the document is parsed.
;(globalThis as { BpmnLite?: unknown }).BpmnLite = { render, boot, parseBpmnLite }
// No document under Node or SSR: importing the bundle there must not throw.
if (typeof document !== "undefined") {
	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => boot())
	else boot()
}
