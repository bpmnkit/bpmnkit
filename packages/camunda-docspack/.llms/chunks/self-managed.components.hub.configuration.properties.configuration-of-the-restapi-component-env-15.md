# Property reference — Configuration of the `restapi` component — env

| Property                                  | Description                                                                     | Example value | Default value |
| ----------------------------------------- | ------------------------------------------------------------------------------- | ------------- | ------------- |
| `SERVER_TOMCAT_MAXPARTCOUNT`              | [optional]Maximum number of parts in `multipart/form-data` requests.       | `5000`        | `5000`        |
| `SPRING_SERVLET_MULTIPART_MAXREQUESTSIZE` | [optional]Maximum request size for `multipart/form-data` requests.         | `20MB`        | `20MB`        |
| `SPRING_SERVLET_MULTIPART_MAXFILESIZE`    | [optional]Maximum size of a single file in `multipart/form-data` requests. | `10MB`        | `4MB`         |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
