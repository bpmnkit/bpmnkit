# Configure credentials in the modeling interface — What you can do in the chooser

What the chooser offers depends on whether you can edit the diagram, that is, whether you have edit access to the project.

| Situation                                                            | Available actions                                 |
| -------------------------------------------------------------------- | ------------------------------------------------- |
| You can edit the diagram                                             | Select a credential, or create a new one.         |
| You can edit the diagram, and the selected credential is compatible  | Select a credential, or edit the selected one.    |
| You can edit the diagram, and the selected credential is out of date | Select a credential, or upgrade the selected one. |
| You cannot edit the diagram                                          | Select a credential only.                         |

This only controls what the chooser offers. On the [**Credentials** page](https://docs.camunda.io/docs/next/components/hub/organization/credentials/index#permissions), any member of your organization who has access to Camunda Hub can manage credentials, and the cluster's own authorizations apply whenever Hub writes a credential to it.

The chooser is unavailable while you aren't connected to an environment, while you work offline, while the connected environment is paused, or when it runs a Camunda version before 8.10. The field tells you which of these applies.

A connector declares the minimum credential version it needs. A newer credential always satisfies an older requirement, so upgrading is only needed when a credential is older than the connector requires.

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/modeling-interface
