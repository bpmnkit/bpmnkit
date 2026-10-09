# Configuration

# Configuration

**Caution: Technical Preview**
The PHP SDK is a **technical preview**. Its API surface may still evolve and changes may not follow semantic versioning. Pin an exact version if you need stability.


## Zero-config from the environment

The client reads the standard `CAMUNDA_*` environment variables and auto-detects the authentication strategy (`NONE`, `BASIC`, or `OAUTH`).

```php
function readme_zero_config(): void
{
    // Reads CAMUNDA_REST_ADDRESS and auto-detects the auth strategy from the
    // ambient environment (NONE / BASIC / OAUTH).
    $client = CamundaClient::fromEnvironment();
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/configuration
