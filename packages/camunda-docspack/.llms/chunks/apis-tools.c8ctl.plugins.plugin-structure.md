# Extend c8ctl with plugins — Plugin structure

A plugin is a regular Node.js module with a `c8ctl-plugin.js` (or `c8ctl-plugin.ts`) file in the root directory. The file must export a `commands` object and optionally a `metadata` object.

### Minimal example

```typescript
// c8ctl-plugin.ts
export const metadata = {
  name: "my-plugin",
  description: "My custom c8ctl plugin",
  commands: {
    analyze: {
      description: "Analyze BPMN processes for best practices",
    },
    optimize: {
      description: "Optimize process definitions",
    },
  },
};

export const commands = {
  analyze: async (args: string[]) => {
    console.log("Analyzing...", args);
  },
  optimize: async (args: string[]) => {
    console.log("Optimizing...");
  },
};
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
