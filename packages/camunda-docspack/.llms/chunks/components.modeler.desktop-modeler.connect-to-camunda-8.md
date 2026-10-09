# Connect to Camunda 8

Set up a connection from Desktop Modeler to Camunda.

To deploy diagrams, start process instances, or test tasks, you must first connect Desktop Modeler to Camunda. Follow the steps below to connect to **Camunda 8 SaaS**. To connect to a local installation, visit the [Camunda 8 Self-Managed guide](https://docs.camunda.io/docs/next/self-managed/components/modeler/desktop-modeler/connect-to-self-managed).

1. Click the connection selector. For new installations, this will show **No connection**. If you have previously selected a connection, it will show the name of that connection.

   ![No connection button in status bar](./img/connection-selector-offline.png)

2. To add a new connection, open the settings. You can either click **Manage connections**, or open the settings directly (Cmd/Ctrl + ,).

   ![Showing a connection selection popup](./img/connection-selector-offline-open.png)

   By default, a local c8run connection is already set up. If you have previously used Desktop Modeler to deploy diagrams, those connections will also be available under **Unnamed Connection**.

3. Click **Add connection**.

   ![Connection manager showing add button](./img/connection-manager-add.png)

4. Enter a name, the connection URL, and the connection credentials (client ID and client secret) for your [API client](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients). Optionally enter the tenant ID.

   ![Connection manager with new connection information filled in](./img/connection-manager-new-connection-loading.png)

**Caution**
   When connecting to a tenant, the API client must be assigned to it through [Orchestration Cluster Admin](https://docs.camunda.io/docs/next/components/admin/admin-introduction).

   Desktop Modeler automatically validates the connection.
   If you have issues connecting, see the [troubleshooting page](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/troubleshooting#debug-zeebe-connection-issues).

   ![Connection manager showing connection error](./img/connection-manager-new-connection-error.png)

   If the connection is established successfully, you can go back to the connection selection, where your new connection is now available.

   ![Connection manager showing connection success](./img/connection-manager-new-connection-success.png)

5. Select the connection you just created to use it for [deployment](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/deploy-diagram), [starting a new process instance](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/start-instance), or [task testing](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/task-testing).

   ![New connection selected in connection manager](./img/connection-selector-new-connection.png)
**Note**
   As a next step, [deploy your diagram](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/deploy-diagram).

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/connect-to-camunda-8
