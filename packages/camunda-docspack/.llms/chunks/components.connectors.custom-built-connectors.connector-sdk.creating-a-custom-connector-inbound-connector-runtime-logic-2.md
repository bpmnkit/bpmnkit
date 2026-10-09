# Connector SDK — Creating a custom connector — Inbound connector runtime logic (2)

The Jakarta Bean Validation API comes with a long list of
[supported constraints](https://jakarta.ee/specifications/bean-validation/2.0/bean-validation_2.0.html#builtinconstraints).
It also allows to
[validate entire object graphs](https://jakarta.ee/specifications/bean-validation/2.0/bean-validation_2.0.html#constraintdeclarationvalidationprocess-validationroutine-graphvalidation)
using the `@Valid` annotation. Thus, the `authentication` object will also be validated.

```java
package io.camunda.connector;

import javax.validation.constraints.NotEmpty;

public class Authentication {

  @NotEmpty private String user;

  @NotEmpty @Pattern(regexp = "^xobx") private String token;
}
```

Using this approach, you can validate your whole input data structure with one initial call from
the central connector function.

#### Secrets

Connectors that require confidential information to connect to external systems need to be able
to manage those securely. As described in the
[guide for creating secrets](https://docs.camunda.io/docs/next/components/saas/clusters/manage-secrets), secrets can be
controlled in a secure location and referenced in a connector's properties using a placeholder
pattern `{{secrets.*}}`. To make this mechanism as robust as possible, secret handling comes with
the connector SDK out of the box. That way, all connectors can use the same standard way of
handling secrets in input data.

`{{secrets.*}}` is the legacy syntax, resolved by the connector runtime. The recommended `camunda.secrets.<name>` syntax is resolved by the Orchestration Cluster before the job reaches the connector, so your connector receives the value already in place. See [Migrate to `camunda.secrets.<name>`](https://docs.camunda.io/docs/next/components/connectors/use-connectors/migrate-secrets) for how the two syntaxes differ and how to migrate.

The SDK allows replacing secrets in input data as late as possible to avoid passing them around
in the environments that handle connector invocation. We do not pass secrets into the
Connector function in clear text but only as placeholders that you can replace from
within the connector function.

Secrets are replaced automatically in the connector input when you use the variable binding or properties access methods of the `InboundConnectorContext`. You will always receive inputs with secrets replaced.

The Runtime automatically replaces secrets in String fields or in container types. Using the
placeholder pattern `{{secrets.*}}` in a String field will replace the placeholder with the secret
value. Using the placeholder pattern in a container type will replace the placeholder in all
String fields of the container type.

---
Source: https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk
