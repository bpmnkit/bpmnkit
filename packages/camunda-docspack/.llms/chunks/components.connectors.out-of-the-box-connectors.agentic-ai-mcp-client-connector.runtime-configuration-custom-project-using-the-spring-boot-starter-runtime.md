# MCP Client connector — Runtime configuration — Custom project using the Spring Boot starter runtime

1. Create a new Spring Boot project.
2. Add the [Camunda Connector Spring Boot starter](https://docs.camunda.io/docs/next/components/connectors/custom-built-connectors/connector-sdk#spring-boot-starter-runtime) and the Agentic AI dependencies to your `pom.xml`:

   ```xml
   <project>
       <!-- .... -->

       <properties>
           <version.connectors>8.8.0</version.connectors>
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

3. Configure the SDK to connect to your cluster, according to [the Camunda SDK documentation](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started#configuring-the-camunda-8-connection).
4. In your application configuration file (e.g., `application.yml`), add the MCP client configuration as shown above.
5. If you only want to run the MCP Client connector (for example, because you're connecting the runtime to SaaS), disable the other Agentic AI connectors provided by the `connector-agentic-ai` dependency:

   ```yaml
   camunda:
     connector:
       agenticai:
         aiagent:
           enabled: false
         ad-hoc-tools-schema-resolver:
           enabled: false
         mcp:
           remote-client:
             enabled: false
   ```

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/agentic-ai-mcp-client-connector
