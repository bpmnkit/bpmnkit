# Template properties — Setting the input type: `type` — Configuration input type

The `Configuration` type renders a chooser for a reusable, host-provided configuration selected by reference. It locks to a single [configuration template](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#embedding-configurations-configurationtemplates), so only compatible configurations are offered.

A configuration is stored on the cluster as a cluster variable that is created with metadata identifying its kind (for example `CREDENTIAL`), its configuration template, and its version. This metadata lets the chooser find compatible configurations and lock to a single template. Selection and resolution happen in two phases:

- **Design time (selection)**: The modeler queries the connected cluster for configurations whose metadata matches the property's `configurationTemplate` (and `configurationTemplateVersion` floor), then serializes a FEEL reference to the chosen one into the model, for example `=camunda.vars.env.myConnection`.
- **Runtime (resolution)**: The engine resolves that FEEL reference against the live cluster variable and injects the configuration's value — the fields defined by its configuration template — into the bound variable (`connection` in the example below). Because it resolves live, changes to a configuration's values take effect on subsequent executions without redeployment.

A configuration's field values can be plain literals or secret references (`camunda.secrets.*`) that the engine resolves at runtime, so secrets are never stored in the model.

**Note**
Configurations are the mechanism that powers [Camunda credentials](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index): a credential is a configuration whose template `kind` is `CREDENTIAL`. Selecting one requires cluster access from the modeler at design time, consistent with existing connector templates. To define a credential type of your own, see [create a credential template](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/credential-templates).

It supports the following config-specific keys:

- `configurationTemplate : String`: The `id` of the compatible configuration template.
- `configurationTemplateVersion : Integer`: Optional. The minimum configuration template version a chosen configuration must satisfy (a floor). Omit for no minimum.

The `Configuration` type does not introduce a new binding. It reuses the standard [`zeebe:input`](#input-mapping-zeebeinput) (outbound) or [`zeebe:property`](#extension-properties-zeebeproperty) (inbound) bindings. When a configuration is chosen, the modeler writes a FEEL reference to the selected configuration plus two modeler-only display-metadata attributes that are ignored at runtime:

- `modelerConfigurationTemplate`: The bound configuration template `id`.
- `modelerConfigurationName`: The chosen configuration's display name.

```xml
<zeebe:input source="=camunda.vars.env.basic_auth_testing_yedois"
             target="connection"
             modelerConfigurationTemplate="io.camunda.examples:connection:1"
             modelerConfigurationName="Basic Auth (Testing)" />
```

The resulting configuration chooser looks like this:

![properties panel configuration chooser](./img/field-configuration.png)

For a complete example, refer to the [example template](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-example).

---
Source: https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties
