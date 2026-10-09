# Access control

Grant users access to work with Admin.

If authorization control is enabled for your Orchestration Cluster, users require the following authorizations to work with Admin.

**Note**
If you already have another administration user, they can assign these [in the Admin UI](https://docs.camunda.io/docs/next/components/admin/components/admin/authorization#create-an-authorization-in-admin). See [the introduction to authorizations](https://docs.camunda.io/docs/next/components/admin/components/concepts/access-control/authorizations#available-resources) for a list of all available authorizations.


## Mandatory authorizations

The following mandatory authorizations are required to work with Admin:

| Authorization type     | Resource type | Resource ID                                                                  | Permission |
| :--------------------- | :------------ | :--------------------------------------------------------------------------- | :--------- |
| Admin component access | `Component`   | `admin` or `identity` (deprecated) or `*` (for access to all web components) | `ACCESS`   |

---
Source: https://docs.camunda.io/docs/next/components/admin/access-control
