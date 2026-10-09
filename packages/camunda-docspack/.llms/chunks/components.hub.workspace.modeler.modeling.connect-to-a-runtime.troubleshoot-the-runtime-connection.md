# Connect to a runtime — Troubleshoot the runtime connection

### No environments assigned to this workspace

**What you see**: The selector shows **No environments assigned to this workspace**.

**Why it happens**: No environment is assigned to the workspace of the diagram yet.

**How to fix it**: Ask a workspace or organization admin to assign an environment to the workspace. Use the **Manage workspace environments** link at the bottom of the selector if you have permission.

### Unable to check environment availability

**What you see**: The selector shows **Unable to check environment availability**.

**Why it happens**: Camunda Hub couldn't load the environments of your workspace, or you no longer have access to them.

**How to fix it**: Wait a few minutes and open the selector again. If the error persists, check with your admin that you still have access to the workspace environments.

### Incorrect username or password

**What you see**: The **Enter environment credentials** dialog shows **Incorrect username or password.**

**Why it happens**: The runtime rejected the credentials.

**How to fix it**: Enter the correct username and password for the runtime.

### Couldn't verify these credentials

**What you see**: The **Enter environment credentials** dialog shows **Couldn't verify these credentials. Try again.**

**Why it happens**: Camunda Hub couldn't reach the runtime to check the credentials.

**How to fix it**: Click **Connect** again. If the error persists, check that the runtime is running and reachable from Camunda Hub.

### These credentials can't access this cluster's logical tenants

**What you see**: The **Enter environment credentials** dialog shows **These credentials can't access this cluster's logical tenants.**

**Why it happens**: The credentials are valid, but the user isn't authorized to read tenants on the runtime. Camunda Hub reads the tenants to decide which [logical tenant](#choose-a-logical-tenant) to connect to.

**How to fix it**: Grant the user permission to read tenants in [Orchestration Cluster Admin](https://docs.camunda.io/docs/next/components/admin/admin-introduction), or use credentials of a user who already has it. Entering the same credentials again doesn't help.

### Needs a logical tenant

**What you see**: The connected runtime shows **Needs a logical tenant**.

**Why it happens**: You can access several tenants on the runtime, but not `<default>`, so Camunda Hub can't choose one for you.

**How to fix it**: Open the selector, click the **Logical tenant** chip of the runtime, and choose a tenant.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/connect-to-a-runtime
