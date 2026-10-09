# Camunda Spring Boot Starter — Get started

### Step 1: Add the dependency

Add the Camunda Spring Boot Starter to your project:

**Maven:**

```xml
<dependency>
  <groupId>io.camunda</groupId>
  <artifactId>camunda-spring-boot-starter</artifactId>
  <version>8.9.x</version>
</dependency>
```

### Step 2: Enable the Java Compiler `-parameters` flag (optional)

If you want to use parameter names for process variables without specifying annotation values, enable the Java compiler flag `-parameters`.

**Maven:**

```xml
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-compiler-plugin</artifactId>
      <configuration>
        <compilerArgs>
          <arg>-parameters</arg>
        </compilerArgs>
      </configuration>
    </plugin>
  </plugins>
</build>
```

If you are using Gradle:

```xml
tasks.withType(JavaCompile) {
    options.compilerArgs << '-parameters'
}
```

If you are using IntelliJ:

```agsl
Settings > Build, Execution, Deployment > Compiler > Java Compiler
```

### Step 3a: Configure the Orchestration Cluster connection for Self-Managed

Set up your connection and authentication in `application.yaml` as shown below. Choose the mode and authentication method for your environment.

Choose the authentication method and gRPC/REST address for your environment:

### no-auth

By default, no authentication will be used.

```yaml
camunda:
  client:
    mode: self-managed
    auth:
      method: none
    grpc-address: https://my-grpc-address
    rest-address: https://my-rest-address
```

### basic-auth

To activate basic authentication:

```yaml
camunda:
  client:
    mode: self-managed
    auth:
      method: basic
      username: <your username>
      password: <your password>
    grpc-address: https://my-grpc-address
    rest-address: https://my-rest-address
```

### oidc

If you set up a [Self-Managed cluster with OIDC](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index), you must configure the accompanying client credentials:

```yaml
camunda:
  client:
    mode: self-managed
    auth:
      method: oidc
      client-id: <your client id>
      client-secret: <your client secret>
      issuer-url: http://localhost:18080/auth/realms/camunda-platform
      audience: <your client id of Orchestration Cluster or configured audience>
      scope: <your client id of Orchestration Cluster or configured audience>
    grpc-address: https://my-grpc-address
    rest-address: https://my-rest-address
```

**Note**
Ensure all addresses use absolute URI format: `scheme://host(:port)`.

**Notes for Microsoft Entra ID**

- Use `scope: CLIENT_ID_OC + "/.default"` instead of `scope: CLIENT_ID_OC`.
- The `issuer-url` is typically in the format:

```
https://login.microsoftonline.com/<Microsoft Entra tenant ID>/v2.0
```

**Note: Audience validation**
If you have [configured the audiences property for the Orchestration Cluster (`camunda.security.authentication.oidc.audiences`)](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camunda.security.authentication.oidc), the Orchestration Cluster will validate the audience claim in the token against the configured audiences.

Make sure your token includes the correct audience from the Orchestration Cluster configuration, or add your audience to the configuration. Often this is the client ID you used when setting up the Orchestration Cluster.

### Step 3b: Configure the Orchestration Cluster connection for SaaS

Set up your connection and authentication in `application.yaml` as shown below:

```yaml
camunda:
  client:
    mode: saas
    auth:
      client-id: <your client id>
      client-secret: <your client secret>
    cloud:
      cluster-id: <your cluster id>
      region: <your region>
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started
