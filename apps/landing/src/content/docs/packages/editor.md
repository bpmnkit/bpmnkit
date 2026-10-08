---
title: "@bpmnkit/editor"
description: Full BPMN editor — canvas, properties panel, AI bridge, and storage.
sidebar:
  order: 5
---

## Overview

`@bpmnkit/editor` bundles everything needed to embed a full-featured BPMN editor
into any web application:

- **Canvas** — SVG viewer with pan/zoom
- **Properties panel** — edit element properties inline
- **AI bridge** — chat panel connected to a local AI server
- **Storage** — auto-save to IndexedDB with project/file management
- **HUD** — toolbar with undo/redo, zoom, optimize, and AI buttons
- **Side dock** — collapsible right panel (properties + AI tabs)

## Installation

```sh
pnpm add @bpmnkit/editor
```

## Basic Setup

```typescript
import { BpmnEditor, initEditorHud } from "@bpmnkit/editor";

// Create the editor
const editor = new BpmnEditor({
  container: document.getElementById("editor"),
  theme: "dark",
  persistTheme: true,   // read/write "bpmn-theme" in localStorage
});

// Initialize the HUD (toolbar overlay)
const hud = initEditorHud(editor);

// Load a diagram
await editor.loadXML(bpmnXml);
```

## With Side Dock

The side dock provides a collapsible properties + AI panel:

```typescript
import { BpmnEditor, initEditorHud, createSideDock } from "@bpmnkit/editor";

const editor = new BpmnEditor({
  container: document.getElementById("editor"),
});

const dock = createSideDock();
document.body.appendChild(dock.el);

const hud = initEditorHud(editor, {
  aiButton: dock.aiPane.button,
});
```

## HUD Options

```typescript
type HudOptions = {
  optimizeButton?: HTMLElement;   // inject an external "Optimize" button
  aiButton?: HTMLElement;         // inject an external "AI" button
};
```

## EditorOptions

```typescript
type EditorOptions = {
  container: HTMLElement;
  theme?: "dark" | "light";
  persistTheme?: boolean;         // auto-save theme to localStorage
  plugins?: CanvasPlugin[];
};
```

## SideDock API

```typescript
type SideDock = {
  el: HTMLElement;
  propertiesPane: HTMLElement;
  aiPane: { button: HTMLElement; el: HTMLElement };
  switchTab(tab: "properties" | "ai"): void;
  expand(): void;
  collapse(): void;
  collapsed: boolean;
  showPanel(): void;
  hidePanel(): void;
  setDiagramInfo(processName: string, fileName: string): void;
};
```

## Applying a change script

`applyProcessDelta` applies a change script (`parseProcessDelta` from `@bpmnkit/core`) to a
diagram someone drew, without laying it out again. It goes through the same modelling functions
a person's edit does, so only what the change touches moves:

- a new node is placed beside the node it follows, below anything in its way;
- new nodes written between two connected nodes (`a > new > b`) replace the flow `a > b`, keep
  its condition or default, and sit in the gap — the shapes right of it move along if the gap is
  too narrow, and pools and lanes widen with them;
- a new node joins the lane it is drawn in;
- removing a node with one way in and one way out joins its neighbours, unless the script
  connected them itself;
- a retyped node keeps its centre, extensions and flows.

```typescript
import { parseProcessDelta, writeProcessText } from "@bpmnkit/core";
import { applyProcessDelta } from "@bpmnkit/editor/headless";

const { text, aliases } = writeProcessText(defs);
const result = applyProcessDelta(defs, parseProcessDelta(modelOutput), { aliases });
// result.definitions, created, changed, removed, addressed, fixes, problems
```

It never throws on the script and never mutates `defs`. Ids that name nothing, kinds that
cannot be created and attributes the Zeebe schema forbids are reported in `problems` and left
out. Like the editor's other modelling functions, it acts on the first process. Pass
`ids: createIdFactory(seed)` for a result that replays identically.

A script's `with` lines configure connectors, on existing nodes or ones the script adds. They
need the connector catalog, which this package does not carry. Pass `applyConnectorLines` from
`@bpmnkit/core/connectors` as `applyConnectors`. Required inputs the lines left out come back as
`result.questions`.

```typescript
import { applyConnectorLines, connectorLineFor } from "@bpmnkit/core/connectors";

const { text, aliases } = writeProcessText(defs, { connectorLine: connectorLineFor });
const result = applyProcessDelta(defs, parseProcessDelta(modelOutput), {
  aliases,
  applyConnectors: applyConnectorLines,
});
```

## Full Editor with All Plugins

The landing page editor uses the `createStorageTabsBridge` plugin which wires together
tabs, storage, AI, and command palette in one call:

```typescript
import { createStorageTabsBridge } from "@bpmnkit/canvas-plugin-storage-tabs-bridge";
import { BpmnEditor, initEditorHud, createSideDock } from "@bpmnkit/editor";

const editor = new BpmnEditor({ container });
const dock = createSideDock();

const bridge = createStorageTabsBridge({
  mainMenu: menuPlugin,
  resolver: fileResolver,
  enableFileImport: true,
  getExamples: (tabsApi) => [
    {
      label: "Approval Flow",
      load: () => tabsApi.openTab({ xml: approvalFlowXml }),
    },
  ],
});

document.body.appendChild(dock.el);
const hud = initEditorHud(editor, { aiButton: dock.aiPane.button });
```

## Internationalisation

The editor and its first-party panels ship in ten languages. English is built in; the
other nine are separate entry points, so a bundle carries only the languages it imports.

| Language | Import |
|---|---|
| German | `@bpmnkit/editor/locales/de` |
| Spanish | `@bpmnkit/editor/locales/es` |
| French | `@bpmnkit/editor/locales/fr` |
| Italian | `@bpmnkit/editor/locales/it` |
| Dutch | `@bpmnkit/editor/locales/nl` |
| Polish | `@bpmnkit/editor/locales/pl` |
| Portuguese (Brazil) | `@bpmnkit/editor/locales/pt-BR` |
| Japanese | `@bpmnkit/editor/locales/ja` |
| Chinese (Simplified) | `@bpmnkit/editor/locales/zh-CN` |

`createTranslate(locale)` turns a locale into the `translate` hook. Pass the same hook to
the editor, the side dock and every plugin you mount:

```typescript
import { BpmnEditor, createSideDock, createTranslate, initEditorHud } from "@bpmnkit/editor";
import { de } from "@bpmnkit/editor/locales/de";
import { createConfigPanelPlugin } from "@bpmnkit/plugins/config-panel";
import { createConfigPanelBpmnPlugin } from "@bpmnkit/plugins/config-panel-bpmn";

const translate = createTranslate(de);
const dock = createSideDock({ translate });
const configPanel = createConfigPanelPlugin({ getDefinitions, applyChange, translate });
const configPanelBpmn = createConfigPanelBpmnPlugin(configPanel, { translate });
const editor = new BpmnEditor({ container, translate, plugins: [configPanel, configPanelBpmn] });
initEditorHud(editor); // the HUD reads the editor's hook
```

These plugins take a `translate` option: `config-panel`, `config-panel-bpmn`,
`command-palette`, `command-palette-editor` (third argument), `main-menu`, `history`,
`process-runner`, `tabs` and `storage-tabs-bridge`. The properties panel translates schema
labels, hints, placeholders and option labels when it draws them, so strings from a
connector template you add pass through unchanged.

**Pick the language at runtime.** `AVAILABLE_LOCALES` lists every language with its own
name, and `matchLocale(navigator.languages, codes)` picks the best match for the browser.
Load the chosen locale with a dynamic `import()`, so each language is its own chunk.
The strings are fixed when the UI is built — to switch language, rebuild the editor or
reload the page. The main menu has a ready-made Language section:

```typescript
createMainMenuPlugin({
  translate,
  language: {
    current: "de",
    options: AVAILABLE_LOCALES,
    onSelect(code) {
      localStorage.setItem("editor-locale", code);
      location.reload();
    },
  },
});
```

Set `lang` on the page (or on the editor's container) to the locale's code. Screen readers
use it, and Japanese and Chinese use it to choose the correct form of shared Han characters.
The `--bpmnkit-ds-font-*` tokens in `@bpmnkit/ui` add CJK fallback fonts under `:lang(ja)`
and `:lang(zh)`.

**Keys and plurals.** A key is the English text the UI asks for, such as `"Undo (Ctrl+Z)"` or
`"{count} elements selected"`. A key that a locale does not have falls back to English.
Placeholders in braces must stay the same in every translation. A message can also be a
plural object — `createTranslate` selects its form with `Intl.PluralRules` from `count`:

```typescript
const pl: Locale = {
  code: "pl",
  name: "Polski",
  messages: {
    "{count} elements selected": {
      one: "Zaznaczono {count} element",
      few: "Zaznaczono {count} elementy",
      many: "Zaznaczono {count} elementów",
      other: "Zaznaczono {count} elementu",
    },
  },
};
```

**Your own translation.** A `Translate` is only a function, so you can wrap a shipped
locale to override some strings, or supply a language that is not shipped:

```typescript
const base = createTranslate(de);
const translate: Translate = (key, vars) =>
  key === "Deploy" ? "Deployen" : base(key, vars);
```

The shipped translations are machine-assisted and checked against the BPMN terminology
that Camunda Modeler uses. Corrections are welcome — see "Improving a translation" in
`CONTRIBUTING.md`.
