# Property reference — Configuration of the `restapi` component — env (2)

You can still define new clusters in your configuration, though it's not required. When you do, Camunda Hub automatically registers them with all [available settings](#clusters) and full management functionality in the interface.

**Note**
With dynamic cluster management enabled, don't call the create or update cluster registration endpoint manually—only let your cluster configuration do it. The endpoint doesn't yet support creating clusters with all configurable settings.

#### Hide add members button

Hide the **Add members** button on the workspace **Members** page (which is displayed by default):

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
