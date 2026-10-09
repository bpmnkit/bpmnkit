# Extend c8ctl with plugins — Plugin runtime API — Use the SDK client from a plugin

```typescript
import type { C8ctlPluginRuntime } from "@camunda8/cli/runtime";

const c8ctl = globalThis.c8ctl as C8ctlPluginRuntime;

export const commands = {
  "list-active": async (args: string[]) => {
    const client = c8ctl.createClient();
    const logger = c8ctl.getLogger();
    // Use the client to query the Orchestration Cluster API
    logger.info("Client ready");
  },
};
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
