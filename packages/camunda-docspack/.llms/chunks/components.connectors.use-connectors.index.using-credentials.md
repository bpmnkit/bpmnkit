# How to use connectors — Using credentials

Some connectors let you select a [credential](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index) instead of entering authentication and connection settings directly on the task. Create the credential once, then select it on any connector task that supports it. Learn how to select or create one in the [Camunda Hub modeling interface](https://docs.camunda.io/docs/next/components/hub/organization/credentials/modeling-interface) or in [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/credentials).


## Using secrets

**Warning**
`secrets.*` is a deprecated syntax. Instead, use `{{secrets.*}}`

You can use sensitive information in your connectors without exposing it in your BPMN processes by using a [legacy secret reference](https://docs.camunda.io/docs/next/reference/glossary#secret-reference-legacy).
Use Camunda Hub to [create and manage secrets](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-secrets).

You can reference a secret like `MY_API_KEY` with `{{secrets.MY_API_KEY}}` in any connector field in the properties
panel. Secrets resolve in every field, not only in a specific subset of fields.

The [secret filter](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#secret-filter) applies to both
outbound and inbound connectors. In practice, this means a secret in a connector field only resolves at runtime if
that same secret was already referenced in that same field at modeling time, in the deployed BPMN.

Secrets are not variables and must be wrapped in double quotes as follows when used in a FEEL expression:

```feel
= { myHeader: "{{secrets.MY_API_KEY}}"}
```

Using the secrets placeholder syntax, you can use secrets in any part of a text, like in the following FEEL expression:

```feel
= "https://" + baseUrl + "/{{secrets.TENANT_ID}}/accounting"
```

This example assumes there is a process variable `baseUrl` and a configured secret `TENANT_ID`.

The engine will resolve the `baseUrl` variable and pass on the secrets placeholder to the connector. Assuming the
`baseUrl` variable resolves to `my.company.domain`,
the connector receives the input `"https://my.company.domain/{{secrets.TENANT_ID}}/accounting"`. The connector then
replaces the secrets placeholder upon execution.

For further details on how secrets are implemented in connectors, consult
our [Connector SDK documentation](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk#secrets).

**Warning**
`secrets.*` is a reserved syntax. Don't use this for other purposes than referencing your secrets in connector fields.
Using this in other areas can lead to unexpected results and incidents.

---
Source: https://docs.camunda.io/docs/next/components/connectors/use-connectors/index
