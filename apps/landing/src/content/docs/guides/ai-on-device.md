---
title: On-device generation in Chrome
description: Describe a process in the web editor and let Chrome's built-in AI (Gemini Nano) draw it on your own device.
sidebar:
  order: 9
---

The public web editor can turn a short description into a new diagram using Chrome's built-in
model, Gemini Nano, through the Prompt API. The model runs on your device: no account, no server,
and nothing you type leaves your machine.

The model never writes BPMN XML. It writes BPMN Kit's line-based process text, which
`parseProcessText` repairs and the editor draws while the text streams in.

## What it does

While the Prompt API is an origin trial, the feature is opt-in: open the editor at
[`/editor?ai=on-device`](/editor?ai=on-device). Without that parameter the editor does not load it.

- A **Generate** button and a **Generate** dock tab appear in the editor. Where the browser has no
  on-device model, neither appears and nothing is logged.
- Type a description (up to 2,000 characters) and press Generate. A **new tab** opens, named from the
  `# Process name` line, and its diagram grows as lines arrive. Your open diagrams are never changed.
- When the run ends, the panel lists the parser's problems and fixes. The tab holds a valid,
  laid-out diagram.
- **Stop** aborts the run and keeps what was drawn. Switching to another tab during a run also stops it,
  so no frame lands in the wrong diagram.

Limits: English only, and generate only. There is no editing of an existing diagram and no chat.

## Requirements

- Desktop Chrome: Windows 10/11, macOS 13+, Linux, or a ChromeOS Chromebook Plus.
- More than 4 GB of VRAM, 16 GB of RAM and at least 22 GB of free disk space.
- A one-time model download, which needs an unmetered network.
- Web pages need the Prompt API origin trial (Chrome 148). Extensions and local flags do not.

## Enable it locally

1. Open `chrome://flags` and set **Prompt API for Gemini Nano** (`#prompt-api-for-gemini-nano`) to Enabled.
2. Restart Chrome.
3. Optional: open `chrome://on-device-internals` to check whether the model is available on this device.
4. Open the editor at `/editor?ai=on-device`.

The first Generate downloads the model once; the panel shows the progress. If Chrome cannot prepare
the model (for example, no disk space), the panel says why.

## Messages

| Case | Message |
|---|---|
| Description too long | "Description too long for the on-device model — shorten it." Nothing is sent. |
| Model could not be prepared | "Chrome couldn't prepare the on-device model: reason" |
| Context overflow mid-run | "The diagram outgrew the model's context — try a smaller process." The partial tab is kept. |
| Stream error | "Generation failed: reason". The partial tab is kept. |
| Prose instead of a diagram | "The model didn't return a diagram — try rephrasing." No tab opens. |

## Embed it

```typescript
import { createAiLocalPlugin } from "@bpmnkit/plugins/ai-local";

const aiLocal = createAiLocalPlugin({
  // First streamed frame: open a new tab.
  openDiagram: (xml, name) => {
    generatedTabId = openTab({ type: "bpmn", xml, name });
  },
  // Later frames and the final result: redraw that tab. Guard on the active
  // tab so a frame never lands in a diagram the user switched to.
  updateDiagram: (defs) => {
    if (getActiveTabId() !== generatedTabId) return;
    editor.loadDefinitions(defs);
    hud.hideOnboarding(); // loadDefinitions does not lift the onboarding overlay
  },
  container: dock.generatePane, // optional; defaults to document.body
  onOpen: () => dock.switchTab("generate"), // optional; runs when the button is clicked
});

// `ready` is true when the model is available or can be downloaded.
if (await aiLocal.ready) {
  dock.setGenerateTabVisible(true);
}

// The button stays hidden until `ready` resolves true; the HUD places it.
const hud = initEditorHud(editor, { generateButton: aiLocal.button });

// Call stop() when the user switches tabs mid-run.
aiLocal.stop();
```

`ready` resolves `true` for the `available`, `downloadable` and `downloading` states, and `false`
otherwise. To serve the feature on your own site, register the origin for the Prompt API origin trial
and add the token in an `origin-trial` meta tag.

## Manual test checklist

- Generate three different descriptions; each opens a new tab with a valid diagram.
- Press Stop mid-run; the partial diagram stays and the status reads "Stopped".
- Switch tabs mid-run; the run stops and no frame lands in the other tab.
- Close the generated tab mid-run; nothing breaks.
- Paste a 2,000-character description; it is accepted or gives the "too long" message.
