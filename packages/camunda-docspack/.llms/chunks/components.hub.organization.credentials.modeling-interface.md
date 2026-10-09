# Configure credentials in the modeling interface

Select, create, edit, and upgrade a credential from the properties panel in the Camunda Hub modeling interface.

Select an existing [credential](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index) on a connector task in the Camunda Hub modeling interface, or create a new one without leaving the properties panel.

**Note**
This page covers credentials that authenticate connector tasks, such as an AWS Credential. It is unrelated to the [client credentials](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/run-or-publish-your-process#missing-client-credentials) required to deploy or run a process, which authenticate Camunda Hub against your cluster.


## Select a credential

Connectors that support credentials show a credential field in the properties panel, such as **AWS Credential**. Select the field to open the credential chooser, which lists the credentials deployed to the environment you're [connected to](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/connect-to-a-runtime) that match the credential type the connector needs. On a Self-Managed cluster with several environments, the chooser also lists credentials deployed only to another environment on that cluster; those don't resolve at runtime in the environment you are connected to.

Selecting a credential stores only a reference to it in your diagram. The credential's values stay in the environment they were deployed to.

If no credential matches, the chooser tells you so by name, for example `Cannot find AWS Credential with name AWS_PROD`. This usually means the credential doesn't exist in the connected environment, or it was created for a different credential type.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/modeling-interface
