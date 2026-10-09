# MCP Client connector — Runtime configuration — Camunda 8 Run

1. Download and extract the latest [Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run) release (at
   least version 8.8.0-alpha6).
2. Before starting Camunda 8 Run, create a config file (for example `mcp-clients.yml`) in the same directory as
   `connectors-application.properties` and add the MCP Client configuration as shown above. Adapt the configuration as
   needed.
3. Edit `connectors-application.properties` and add the following line to include your custom config file:
   ```properties
   spring.config.import=file:./mcp-client.yml
   ```
4. [Start Camunda 8 Run](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/install-start#install-and-start-camunda-8-run).
5. While starting up, you can follow `logs/connectors.log`. If configured correctly, you should see log messages for the
   initialization of the configured MCP clients and the registration of the MCP Client connector:
   ```log
   [...] Creating MCP client with ID 'filesystem'
   [...] Creating MCP client with ID 'time'
   [...] Starting job worker: JobWorkerValue{type='io.camunda.agenticai:mcpclient:xxx', name='MCP Client', ...}
   ```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-connector
