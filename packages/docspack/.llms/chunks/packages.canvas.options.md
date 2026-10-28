# @bpmnkit/canvas — Options

```typescript
type CanvasOptions = {
  container: HTMLElement;
  theme?: "dark" | "light";
  plugins?: CanvasPlugin[];
};
```


## API

| Method | Description |
|---|---|
| `canvas.load(xml, options?)` | Load and render a BPMN XML string |
| `canvas.loadDefinitions(defs, options?)` | Render an already parsed `BpmnDefinitions` |
| `canvas.fitView(padding?)` | Fit the diagram to the container |
| `canvas.setTheme(theme)` | Switch between dark and light theme |
| `canvas.on(event, handler)` | Subscribe to canvas events; returns the unsubscribe function |
| `canvas.destroy()` | Clean up the canvas and remove from DOM |

---
Source: https://bpmnkit.com/docs/packages/canvas
