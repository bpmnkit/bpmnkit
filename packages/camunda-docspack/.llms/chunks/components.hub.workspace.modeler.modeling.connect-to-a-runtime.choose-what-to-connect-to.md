# Connect to a runtime — Choose what to connect to

The **Runtime** selector lists the [environments](https://docs.camunda.io/docs/next/components/hub/index#workspaces-and-environments) assigned to your workspace, and its title is **Connect to an environment**.

On Self-Managed, two Physical Tenants of the same cluster are separate environments, so they are separate connections. The selector shows the name of the environment, not the name of the cluster.


## Change the runtime connection

**Runtime** shows **Not connected** until you choose a runtime or deploy the diagram. After a successful deployment, it shows the environment you deployed to, unless you've already chosen a runtime for this diagram. To connect:

1. Open a BPMN diagram.
1. At the bottom of the modeling interface, next to **Check problems against**, click **Runtime**.

   

1. Select an environment from the list. Each entry shows its status icon, stage, and version, plus a badge if it needs your attention.

   

1. If the runtime offers more than one logical tenant, choose one. See [choose a logical tenant](#choose-a-logical-tenant).

The selector closes, and **Runtime** shows the name, stage, and status of the connected runtime.

**Note**
Your choice, including **Work offline**, takes precedence over your deployments: deploying the diagram doesn't change the runtime you chose. The choice applies only to the current diagram in the current browser session. It isn't saved. When you reload the page or open another diagram, choose the runtime again.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/connect-to-a-runtime
