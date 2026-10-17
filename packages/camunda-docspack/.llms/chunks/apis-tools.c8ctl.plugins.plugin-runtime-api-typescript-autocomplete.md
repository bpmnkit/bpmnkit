# Extend c8ctl with plugins — Plugin runtime API — TypeScript autocomplete

For TypeScript autocomplete in your plugin, import the runtime type:

```typescript
import type { C8ctlPluginRuntime } from "@camunda8/cli/runtime";

const c8ctl = globalThis.c8ctl as C8ctlPluginRuntime;
const tenantId = c8ctl.resolveTenantId();
const logger = c8ctl.getLogger();
logger.info(`Tenant: ${tenantId}`);
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/plugins
