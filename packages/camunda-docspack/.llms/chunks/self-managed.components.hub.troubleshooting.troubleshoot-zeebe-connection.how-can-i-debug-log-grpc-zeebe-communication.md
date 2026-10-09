# Troubleshoot Zeebe connection issues — How can I debug log gRPC / Zeebe communication?

You can also start `modeler-restapi` with gRPC debug logging turned on to get detailed [logging
output](https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/logging) on communication to Zeebe:

```shell
LOGGING_LEVEL_IO_GRPC=TRACE
LOGGING_LEVEL_IO_CAMUNDA_MODELER=DEBUG
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-zeebe-connection
