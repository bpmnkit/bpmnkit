# Customize the AI Agent connector — Extend the AI Agent connector — Prerequisites

This guide assumes you are starting from a fresh Spring Boot project and intend to run a customized AI Agent connector in a self-managed or hybrid environment.

1. Create a new Spring Boot project.
2. Add the [Camunda Connector Spring Boot Starter](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk#spring-boot-starter-runtime) and the Agentic AI dependencies to your `pom.xml`:

   ```xml
   <project>
       <!-- .... -->

       <properties>
           <!-- use the desired connectors version -->
           <version.connectors>8.10.0</version.connectors>
       </properties>

       <dependencies>
           <!-- .... -->

           <dependency>
               <groupId>io.camunda.connector</groupId>
               <artifactId>spring-boot-starter-camunda-connectors</artifactId>
               <version>${version.connectors}</version>
           </dependency>
           <dependency>
               <groupId>io.camunda.connector</groupId>
               <artifactId>connector-agentic-ai</artifactId>
               <version>${version.connectors}</version>
           </dependency>

           <!-- .... -->
       </dependencies>

       <!-- .... -->
   </project>
   ```

3. Configure the SDK to connect to your cluster according
   to [the Camunda SDK documentation](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started#configuring-the-camunda-8-connection).
4. To only run the AI Agent Client connector, disable the other agentic AI connectors provided by the `connector-agentic-ai` dependency in your `application.yml`:

   ```yaml
   camunda:
     connector:
       agenticai:
         ad-hoc-tools-schema-resolver:
           enabled: false
         mcp:
           remote-client:
             enabled: false
         a2a:
           client:
             outbound:
               enabled: false
             polling:
               enabled: false
             webhook:
               enabled: false
   ```

5. If the default AI Agent connector is already connected to your engine (for example, if you are connecting to SaaS), you can override the registered AI Agent connector job worker type by setting one of the following type environment variables to a custom value (such as `my-ai-agent`) when starting your application.
   This allows you to use your custom connector in combination with an [element template configured](https://docs.camunda.io/docs/next/components/connectors/use-connectors-in-hybrid-mode) for the `my-ai-agent` job worker type.

| Variable                             | Description                                                                                            |
| :----------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `CONNECTOR_AI_AGENT_JOB_WORKER_TYPE` | Overrides the type of the [AI Agent Sub-process](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-subprocess) job worker.       |
| `CONNECTOR_AI_AGENT_TYPE`            | Overrides the type of the [AI Agent Task](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-task) outbound connector job worker. |

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-aiagent-customization
