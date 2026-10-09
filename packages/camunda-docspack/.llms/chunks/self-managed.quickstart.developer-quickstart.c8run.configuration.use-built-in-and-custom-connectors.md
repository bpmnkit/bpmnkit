# Configure Camunda 8 Run — Use built-in and custom connectors

Camunda 8 Run includes Connectors for local development.

For custom connectors:

1. Place the connector JAR in the appropriate `custom_connectors` directory:

   ```bash
   # macOS/Linux
   c8run/custom_connectors/your-connector.jar

   # Windows
   c8run\custom_connectors\your-connector.jar
   ```

2. Ensure the corresponding element template is available in a valid Desktop Modeler search path.
3. Restart Camunda 8 Run after adding or updating connectors.
4. Check `c8run/logs/connectors.log` if the connector fails to load.

For connector secrets, add the value to the local secret store and reference it with `camunda.secrets.<name>`. See [manage local secrets](#manage-local-secrets).

For connector development and packaging details, see [Connector SDK](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration
