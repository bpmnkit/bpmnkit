# Manage credentials — Terminology

| Term            | Meaning                                                                                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Credential      | The reusable object you create and then select on an element template field, such as a connector task or a job worker's configuration.                                                                                                                     |
| Credential type | The shape of a credential, such as **AWS Credential**, **REST Authentication**, or **JDBC Connection**. A credential type defines which fields a credential of that type has.                                                                              |
| Environment     | The target a credential is deployed to. On Camunda 8 SaaS an environment is the cluster; on Self-Managed 8.10 and later, a cluster can hold one environment for each Physical Tenant.                                                                      |
| Configuration   | The element template property type that renders the credential chooser. A credential is a configuration whose kind is `CREDENTIAL`. See [Configuration input type](https://docs.camunda.io/docs/next/components/modeler/element-templates/template-properties#configuration-input-type). |

---
Source: https://docs.camunda.io/docs/next/components/hub/organization/credentials/index
