# Overview — Connector runtime

The connector runtime environment can be installed using the supported [deployment options](https://docs.camunda.io/docs/next/self-managed/setup/overview#deployment-options).

Currently, we support an installation of connectors with [Docker](https://docs.camunda.io/docs/next/self-managed/deployment/docker/docker#connectors),
[Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose), [Helm charts](https://docs.camunda.io/docs/next/self-managed/setup/overview), and the [manual setup](https://docs.camunda.io/docs/next/self-managed/deployment/manual/install#connectors-1).


## Connector templates

For using connectors in the Web or Desktop Modeler, you need to [provide connector templates](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-templates#providing-and-using-connector-templates).

For the [out-of-the-box connectors](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/available-connectors-overview) provided by Camunda,
the Connectors release provides a set of all connector templates related to one [release version](https://github.com/camunda/connectors/releases).
If you use the [Docker Compose](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/docker-compose) installation, you can thus fetch all connector templates that match the versions of the connectors used in the backend.

Alternatively, you can fetch the JSON templates from the respective connector's releases in the respective connectors folder in the [repository](https://github.com/camunda/connectors)
at `connectors/{connector name}/element-templates`.

**Note: Match the template version to your Camunda version**

The [Camunda Marketplace](https://marketplace.camunda.com/en-US/home) only distributes the **latest** version of each connector element template. If your Self-Managed cluster runs an older Camunda 8 version, the latest template may not be compatible with it.

Each element template declares the Camunda versions it supports in its [`engines.camunda`](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata) field as a semantic version range, for example:

```json
"engines": {
  "camunda": "^8.10"
}
```

To find a compatible template, choose the highest template version whose `engines.camunda` range includes your Camunda version, rather than looking for an exact match. Templates are available from two places:

- The [Connectors release](https://github.com/camunda/connectors/releases) matching your Camunda version publishes a `connectors-bundle-templates-{version}` archive containing the bundled connectors' templates, with versioned files named `{template name}-{version}.json`.
- Connectors that keep a version history also store superseded templates in `element-templates/versioned/` alongside the current one in the [connectors repository](https://github.com/camunda/connectors). Not every connector has this directory.

Import the version-matched file instead of the Marketplace version.

You can use the connector templates as provided or modify them to your needs as described in our [Connector templates guide](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-templates).

Review our [Connectors Awesome List](https://github.com/camunda-community-hub/camunda-8-connectors/tree/main) to find more connectors.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/overview
