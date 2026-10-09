# Configuration — Test cleanup settings {#test-cleanup-settings}

After each test, CPT resets the Camunda runtime clock and deletes all runtime data by default. You can disable either behavior to inspect the process state after a test run.

**Info**
Disabling clock reset or data deletion means state from one test can affect subsequent tests.

In your `application.yml` (or `application.properties`):

```yaml
camunda:
  process-test:
    # Keep the Camunda runtime clock as-is after each test
    clock-reset-enabled: false
    # Skip runtime data deletion after each test
    data-deletion-mode: none
```

In your `/camunda-container-runtime.properties` file:

```properties
# Keep the Camunda runtime clock as-is after each test
clockResetEnabled=false
# Skip runtime data deletion after each test
dataDeletionMode=NONE
```

### Property reference

| Property              | Type              | Default         | Description                                                                                                                                          |
| --------------------- | ----------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `clock-reset-enabled` | `boolean`         | `true`          | When `true`, resets the Camunda runtime clock after each test. Set to `false` to keep the clock at its current value for post-run inspection.        |
| `data-deletion-mode`  | `string` (`enum`) | `CLUSTER_PURGE` | Controls how CPT deletes runtime data after each test. `CLUSTER_PURGE` (default) purges the full cluster state. `NONE` skips data deletion entirely. |

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/configuration
