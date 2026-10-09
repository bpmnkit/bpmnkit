# Configuration — HTTP proxy configuration

You can configure connectors to route HTTP requests through a proxy server. See [HTTP proxy configuration](https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration) for details.


## Truststore

If your connector runtime needs to connect to external systems over HTTPS, you might need to provide a custom truststore.

To configure the truststore, use the following environment variables:

- `JAVAX_NET_SSL_TRUSTSTORE`: Path to the truststore file (e.g., `/path/to/truststore.jks`)
- `JAVAX_NET_SSL_TRUSTSTOREPASSWORD`: Password for the truststore


## Configure the App Integrations connection

The [App Integrations connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/app-integrations) sends messages to Microsoft Teams and Slack through your organization's Camunda app integrations. The runtime holds the connection, so no process model carries an endpoint or a credential.

Configure this only if you have installed app integrations, as described in [Install app integrations](https://docs.camunda.io/docs/next/components/camunda-integrations/app-integrations/installation). Until the runtime is configured, every App Integrations job fails with `APP_INTEGRATIONS_NOT_CONFIGURED` and raises an incident.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
