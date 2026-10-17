# Use credentials — What you can do in the chooser

What the chooser offers depends on whether Desktop Modeler is connected to Camunda, and on your permissions there. Desktop Modeler checks your permissions once per connection.

| Situation                                                                                    | Available actions                                                                                                       |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| No connection                                                                                | Select a credential that is already referenced in the diagram. You cannot browse, create, edit, or upgrade credentials. |
| Connected, with permission to create credentials                                             | Select a credential, or create a new one.                                                                               |
| Connected, with permission to update credentials, and the selected credential is compatible  | Select a credential, or edit the selected one.                                                                          |
| Connected, with permission to update credentials, and the selected credential is out of date | Select a credential, or upgrade the selected one.                                                                       |
| Connected, without permission to create or update credentials                                | Select a credential only.                                                                                               |

A connector declares the minimum credential version it needs. A newer credential always satisfies an older requirement, so upgrading is only needed when a credential is older than the connector requires.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/credentials
