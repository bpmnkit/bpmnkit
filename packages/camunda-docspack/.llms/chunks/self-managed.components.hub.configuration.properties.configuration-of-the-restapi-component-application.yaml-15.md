# Property reference — Configuration of the `restapi` component — application.yaml

| Property                                    | Description                                                                     | Example value | Default value |
| ------------------------------------------- | ------------------------------------------------------------------------------- | ------------- | ------------- |
| `server.tomcat.max-part-count`              | [optional]Maximum number of parts in `multipart/form-data` requests.       | `5000`        | `5000`        |
| `spring.servlet.multipart.max-request-size` | [optional]Maximum request size for `multipart/form-data` requests.         | `20MB`        | `20MB`        |
| `spring.servlet.multipart.max-file-size`    | [optional]Maximum size of a single file in `multipart/form-data` requests. | `10MB`        | `4MB`         |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
