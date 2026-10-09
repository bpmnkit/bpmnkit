# Connect to a runtime — Choose what to connect to — Choose a logical tenant

If the runtime has [multi-tenancy](https://docs.camunda.io/docs/next/components/concepts/multi-tenancy) enabled and you can access more than one tenant, the runtime shows a **Logical tenant** chip.

- Camunda Hub selects the `<default>` tenant automatically if you can access it, or your only tenant if you can access exactly one.
- Otherwise, the list of tenants opens when you select the runtime. Choose the tenant to connect to.

To switch tenants later, click the **Logical tenant** chip next to the runtime and choose another tenant. The tenant ID is shown next to each tenant name, since tenant names aren't unique.

If no tenant can be selected automatically and you haven't chosen one, the runtime shows a **Needs a logical tenant** badge, and **Runtime** shows a warning icon.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/connect-to-a-runtime
