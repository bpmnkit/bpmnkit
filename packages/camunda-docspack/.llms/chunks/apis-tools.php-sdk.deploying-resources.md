# Deploying resources

# Deploying resources

**Caution: Technical Preview**
The PHP SDK is a **technical preview**. Its API surface may still evolve and changes may not follow semantic versioning. Pin an exact version if you need stability.

Pass a readable filesystem path for every BPMN, DMN, or Form resource. Anchor
paths with `__DIR__` so deployment is independent of the shell's current
working directory. The repository includes [runnable deployment
resources](https://github.com/camunda/orchestration-cluster-api-php/tree/main/examples/resources/); replace those paths with your application's
models.

```php
function readme_deploy_resources(): void
{
    $client = CamundaClient::fromEnvironment();

    $result = $client->deployResourcesFromFiles(
        __DIR__ . '/resources/order-process.bpmn',
        __DIR__ . '/resources/pricing.dmn',
    );
    // $result is a DeploymentResult (or ProblemDetail on a handled error).
}
```

`deployResourcesFromFiles()` returns a `DeploymentResult` on success and a
`ProblemDetail` for a handled API error. It throws a `ConfigurationException`
when a local resource path cannot be read.

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/deploying-resources
