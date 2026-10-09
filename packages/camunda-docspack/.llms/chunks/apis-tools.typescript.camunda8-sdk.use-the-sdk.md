# TypeScript SDK — Use the SDK

1. Create a file `index.ts` in your IDE.
2. Import the SDK:

   ```typescript
   import { Camunda8 } from "@camunda8/sdk";
   import path from "path"; // we'll use this later

   const clientFactory = new Camunda8();
   ```

3. Get an Orchestration API client. This is used to deploy process models and start process instances:

   ```typescript
   const camunda = clientFactory.getOrchestrationClusterApiClient();
   ```

---
Source: https://docs.camunda.io/docs/next/apis-tools/typescript/camunda8-sdk
