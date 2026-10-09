# Deployment configuration — Gateway and Broker configuration

The `maxMessageSize` default value is 4MB for raw Zeebe deployments (10MB for Helm). You can configure this setting in the:

- [Gateway config](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway#zeebegatewaynetwork)
- [Broker config](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker#zeebebrokernetwork)

If you deploy with Helm, the chart defaults to 10MB via `global.config.requestBodySize`, applying
this value to the Zeebe Gateway and broker message size, the REST multipart file and request size, and the Tomcat HTTP
form post size on the Zeebe Gateway. Change `global.config.requestBodySize` only if you need a
value other than 10MB.

If you expose the REST API through Ingress, you must also explicitly set
`global.ingress.annotations.nginx.ingress.kubernetes.io/proxy-body-size` to the same value.
This annotation is not propagated automatically from `requestBodySize`.

This setting aligns the HTTP, multipart, Tomcat, Gateway, and Broker transport limits. Deployments
can still be rejected by Zeebe's internal record batch processing if the deployed resources and
follow-up records exceed the engine batch limit. This engine-level rejection returns an HTTP 500
response, not HTTP 413.

Multipart requests include metadata and boundary overhead in addition to the uploaded file content.
Set these limits slightly above the largest file you expect users or Connectors to upload.

If you are not using Helm and increase this value, you must also adjust the configuration for the deployment REST endpoint to match.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/orchestration-cluster-api-rest-deployment-configuration
