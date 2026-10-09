# Configuration variables — Component configuration

Identity supports component configuration using preset values. To configure a
component for use within Identity, set two variables:

| Environment variable                  | Description                                     | Default value |
| :------------------------------------ | :---------------------------------------------- | :------------ |
| `KEYCLOAK_INIT_<COMPONENT>_SECRET`    | The secret used for authentication flows.       | No default    |
| `KEYCLOAK_INIT_<COMPONENT>_ROOT_URL`  | The root URL of where the component is hosted.  | No default    |
| `KEYCLOAK_INIT_<COMPONENT>_CLIENT_ID` | The client to create and use for the component. | `<COMPONENT>` |

**Note**
Identity supports the following values for the `<COMPONENT>` placeholder: `OPERATE`, `OPTIMIZE`, `TASKLIST`,
and `WEBMODELER`.

For the `WEBMODELER` value, only the `KEYCLOAK_INIT_<COMPONENT>_ROOT_URL` variable is required to be set.

For the `KEYCLOAK_INIT_<COMPONENT>_CLIENT_ID` value, the default is the component name in lowercase except
for `WEBMODELER`, which is`web-modeler`.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/miscellaneous/configuration-variables
