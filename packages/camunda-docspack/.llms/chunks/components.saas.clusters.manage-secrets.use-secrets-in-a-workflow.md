# Manage connector secrets — Use secrets in a workflow

Secrets are used inside connector tasks in your BPMN model. Add a connector task, then reference the secret key with a [legacy secret reference](https://docs.camunda.io/docs/next/reference/glossary#secret-reference-legacy) in a field that supports secrets.

Example for a plain text field (for example, an authorization header value):

```txt
Bearer {{secrets.MY_API_KEY}}
```

Example for a FEEL expression (note the double quotes around the placeholder):

```feel
= { myHeader: "{{secrets.MY_API_KEY}}" }
```

For more details on where secrets are supported, see the [Connectors guide](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#using-secrets).

Now you can reference your secret in any connector as described in the [Connectors guide](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#using-secrets).

To reuse a complete set of authentication and connection settings, rather than a single value, see [credentials](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index). A credential's sensitive fields reference secrets you create here.

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets
