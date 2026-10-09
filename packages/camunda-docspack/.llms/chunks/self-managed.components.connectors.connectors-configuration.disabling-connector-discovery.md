# Configuration — Disabling connector discovery

**Warning**
We do not guarantee that all the Camunda provided connectors will be discovered via SPI.
If you want to have a connector runtime without out-of-the-box connectors, we recommend building a custom runtime with only the connectors you want to use.

To disable the discovery of connectors via SPI or environment variables as explained [in this section](#manual-discovery-of-connectors),
set the following environment variables: `CONNECTOR_INBOUND_DISCOVERY_DISABLED` and `CONNECTOR_OUTBOUND_DISCOVERY_DISABLED`.

Note that this does not prevent the registration of connectors via Spring Beans or
other mechanisms.


## Secrets

Providing values for [legacy secret references](https://docs.camunda.io/docs/next/reference/glossary#secret-reference-legacy) to the runtime environment can be achieved in different ways, depending on your setup. To move to the recommended `camunda.secrets.<name>` syntax, resolved by the Orchestration Cluster from a configured secret store, see [Migrate to `camunda.secrets.<name>`](https://docs.camunda.io/docs/next/components/connectors/use-connectors/migrate-secrets).

Starting with Camunda 8.9, the environment-based secret provider applies the prefix `SECRET_` by default when resolving secrets. Only environment variables that start with this prefix are available as connector secrets.

This improves security by preventing all environment variables from being exposed as connector secrets. Existing secrets that do not use the configured prefix will no longer resolve until you update either the environment variables or the prefix configuration.

#### Configure a custom prefix

To use a custom prefix, configure it via the Java property or environment variable and name your secrets accordingly:

```bash
export CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_PREFIX='SUPER_SECRETS_'
export SUPER_SECRETS_MY_SECRET='foo'   # Resolved via {{ secrets.MY_SECRET }}
```

#### Restore the previous behavior (unsafe)

To restore the previous behavior where all environment variables can be used as connector secrets, set the prefix to an empty value:

```
camunda.connector.secret-provider.environment.prefix=
```

**Warning**
When no prefix is configured, the connector runtime logs a warning that this mode is unsafe because all environment variables are exposed as connector secrets. Camunda does not recommend this mode for production environments.

The following environment variables can be used to configure the default secret provider:

| Name                                                       | Description                                                                                                                                                       | Default value |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_ENABLED`     | Whether the default secret provider is enabled.                                                                                                                   | `true`        |
| `CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_PREFIX`      | Prefix applied to the secret name before lookup. Only environment variables starting with this prefix are available as secrets. Set to empty to disable (unsafe). | `SECRET_`     |
| `CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_TENANTAWARE` | Whether the secret provider should be tenant-aware.                                                                                                               | `false`       |

If the secret provider is set to be tenant-aware, the secret format will change to `${prefix}${tenantId}_${secretName}`:

Example with empty prefix:

```bash
export CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_TENANTAWARE=true
export tenant1_MY_SECRET='foo' # This will be resolved by using {{ secrets.MY_SECRET }} from tenant1
```

Example with prefix set:

```bash
export CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_TENANTAWARE=true
export CAMUNDA_CONNECTOR_SECRETPROVIDER_ENVIRONMENT_PREFIX='SUPER_SECRETS_'
export SUPER_SECRETS_tenant1_MY_SECRET='foo' # This will be resolved by using {{ secrets.MY_SECRET }} from tenant1
```

Connector secrets can be used in Helm charts, for example by referencing a [Kubernetes secret](https://kubernetes.io/docs/concepts/configuration/secret/):

```yaml
connectors:
  envFrom:
    - secretRef:
        name: camunda-connector-secrets
```

```
apiVersion: v1
kind: Secret
metadata:
  name: camunda-connector-secrets
stringData:
  MY_SECRET: foo
```

Review the documentation on [managing secrets in Helm charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management) for additional details.

To inject secrets into the [Docker images of the runtime](https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker#connectors), they must be available in the environment of the Docker container.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
