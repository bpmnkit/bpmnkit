# Troubleshooting — I cannot connect to an orchestration cluster {#i-cannot-connect-to-zeebe}

You try to connect (i.e., to deploy) to a remote orchestration cluster, and Desktop Modeler tells you it "Cannot connect to Camunda 8."

**Tip**
If you run against a Camunda 8 SaaS free-trial cluster, ensure it is [not paused](https://docs.camunda.io/docs/next/components/saas/clusters#auto-pause).

To resolve this issue, check if you can connect to Zeebe through another client, for example, community-supported [`zbctl`](https://github.com/camunda-community-hub/zeebe-client-go/blob/main/cmd/zbctl/zbctl.md). If that works, [further debug your Zeebe connection](#debug-zeebe-connection-issues). If that does not work, resolve the [general connection issue](#resolve-a-general-zeebe-connection-issue) first.

Additionally, if authorizations are enabled, ensure that your [client](https://docs.camunda.io/docs/next/components/admin/client) credentials have the required permissions. These differ from [user](https://docs.camunda.io/docs/next/components/admin/user) credentials and are evaluated separately.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/troubleshooting
