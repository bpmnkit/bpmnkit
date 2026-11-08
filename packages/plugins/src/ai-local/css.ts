import { injectChromeStyles } from "@bpmnkit/editor"

const STYLE_ID = "ai-local-styles"

export function injectAiLocalStyles(): void {
	injectChromeStyles()
	const existing = document.getElementById(STYLE_ID)
	const style = existing instanceof HTMLStyleElement ? existing : document.createElement("style")
	if (!existing) {
		style.id = STYLE_ID
		document.head.appendChild(style)
	}
	style.textContent = `
.ai-local-panel {
  display: flex; flex-direction: column; gap: 10px;
  width: 100%; height: 100%; box-sizing: border-box; padding: 12px 14px;
  background: var(--bpmnkit-chrome-ground);
  color: var(--bpmnkit-chrome-ink);
  font-family: var(--bpmnkit-chrome-font);
  font-size: 13px;
  overflow-y: auto;
}
.ai-local-title { font-weight: 600; font-size: 14px; }
.ai-local-input {
  min-height: 120px; resize: vertical; box-sizing: border-box; width: 100%;
  padding: 8px 10px;
  background: var(--bpmnkit-chrome-ground-2);
  border: 1px solid var(--bpmnkit-chrome-line);
  color: var(--bpmnkit-chrome-ink);
  font-family: inherit; font-size: 13px; line-height: 1.5;
}
.ai-local-input:focus { outline: 1px solid var(--bpmnkit-chrome-accent); }
.ai-local-run {
  align-self: flex-start; padding: 6px 14px; cursor: pointer;
  background: var(--bpmnkit-chrome-accent-subtle);
  border: 1px solid var(--bpmnkit-chrome-accent);
  color: var(--bpmnkit-chrome-ink);
  font-family: var(--bpmnkit-chrome-mono); font-size: 12px;
}
.ai-local-run:disabled { opacity: 0.5; cursor: not-allowed; }
.ai-local-status {
  min-height: 1.4em; font-size: 11.5px;
  border-top: 1px solid var(--bpmnkit-chrome-line-soft);
  padding-top: 8px;
}
.ai-local-status-err { color: var(--bpmnkit-danger, #dc2626); }
.ai-local-notes {
  margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 3px;
  font-size: 12px; line-height: 1.4;
}
.ai-local-notes:empty { display: none; }
`
}
