# Migrate to Camunda Process Test — Choose your runtime

Next, choose how you want to run CPT, considering your environment. CPT can be used in two modes:

- CPT with Testcontainers (as equivalent to ZPT with Testcontainers)
- CPT with remote engine (as equivalent to ZPT's embedded runtime)

### ZPT with Testcontainers

If you use ZPT with Testcontainers (
`artifactId: zeebe-process-test-extension-testcontainer` or `spring-boot-starter-camunda-test-testcontainer`), then you can
use CPT's default [Testcontainers runtime](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#testcontainers-runtime) without
additional changes.

### ZPT's embedded runtime

If you use ZPT’s embedded runtime (`artifactId: zeebe-process-test-extension` or `spring-boot-starter-camunda-test`),
switch to CPT’s [remote runtime](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#remote-runtime). Choose this option only if you
cannot install a Docker-API compatible container runtime (e.g., Docker on Linux or Docker Desktop).

In this mode, CPT connects to a remote runtime, such as a local Camunda 8 Run running on your machine.
Prepare your remote runtime:

1. **Install Camunda 8 Run**  
   Follow the [installation guide](https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/install-start#install-and-start-camunda-8-run) on your machine.

2. **Enable the management clock endpoint**  
   See [prerequisites](https://docs.camunda.io/docs/next/apis-tools/testing/configuration#prerequisites-1):
   - Create an `application.yaml` file in the root `/c8run` directory.
   - Add:
     ```yaml
     zeebe.clock.controlled: true
     ```

3. **Start Camunda 8 Run**.

4. **Switch CPT’s runtime mode** to `remote` in your project configuration.

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    runtime-mode: remote
```

In your `/camunda-container-runtime.properties` file:

```
runtimeMode=remote
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-process-test
