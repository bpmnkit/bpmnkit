# Using the SDK

# Using the SDK

**Caution: Technical Preview**
The PHP SDK is a **technical preview**. Its API surface may still evolve and changes may not follow semantic versioning. Pin an exact version if you need stability.

The SDK provides two clients with matching surfaces:

- **`CamundaClient`** — synchronous. Every method blocks until the response arrives. Use it in scripts, CLI tools, and traditional request/response applications.
- **`CamundaAsyncClient`** — asynchronous. Every operation returns a Guzzle `PromiseInterface`. Use it when you want to issue concurrent requests.

```php
function readme_sync_client(): void
{
    $client = CamundaClient::fromEnvironment();

    $result = $client->deployResourcesFromFiles('order-process.bpmn');
    // ...
}
```

```php
function readme_async_client(): void
{
    $client = CamundaAsyncClient::fromEnvironment();

    $client->deployResourcesFromFilesAsync('order-process.bpmn')
        ->then(static function ($result): void {
            // handle the DeploymentResult once the request resolves
        })
        ->wait();
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/using-the-sdk
