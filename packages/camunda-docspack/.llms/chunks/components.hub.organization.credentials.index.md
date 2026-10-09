# Manage credentials

Create a reusable credential in Camunda Hub, then select it wherever an element template needs authentication or connection configuration, instead of repeating the settings in every diagram.

A credential is reusable configuration for a job worker, connector, or other element template, so you don't repeat the same authentication and connection settings on every task.


## About credentials

- A credential lets you define and manage reusable configuration for job workers, connectors, and other element templates, instead of entering the same settings every time one asks for them.
- Credentials are generally usable infrastructure, available in any Camunda 8 distribution, including standalone ones that run without Hub. Camunda Hub adds an organization-wide, federated view and central management across your clusters, which is what the rest of this page covers.
- A credential type is defined alongside an element template, through an embedded [configuration template](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-metadata#embedding-configurations-configurationtemplates). If you build custom connectors or job workers and want to define your own credential type, see [Create a credential template](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/credential-templates).
- A credential is stored as a cluster variable in each environment you deploy it to, which makes it available by name to any job worker or connector that references it there.

A credential is selected as a whole: an element template never renders or edits a credential's fields. It writes a reference to the chosen credential into the diagram, and the engine resolves that reference at runtime, passing the credential's values, including any secrets, to the job worker or connector.

Learn more:

- [Using credentials](https://docs.camunda.io/docs/next/components/connectors/use-connectors/index#using-credentials): how a connector task uses a credential.
- [Configuration input type](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties#configuration-input-type): how an element template declares the `Configuration` property that renders the credential chooser.
- [Configure credentials in the modeling interface](https://docs.camunda.io/docs/next/components/hub/organization/credentials/modeling-interface): how to choose, create, edit, or upgrade a credential from the properties panel.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
