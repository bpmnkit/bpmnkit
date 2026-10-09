# Using the SDK — Parallel async reads

```php
function parallel_async_reads(CamundaAsyncClient $client): void
{
    // Requests are issued before either promise is awaited.
    $topologyPromise = $client->getTopology();
    $definitionsPromise = $client->searchProcessDefinitions();

    $topology = $topologyPromise->wait();
    $definitions = $definitionsPromise->wait();

    if ($topology instanceof TopologyResponse) {
        printf("Connected to %d broker(s).\n", count($topology->getBrokers()));
    }
    if ($definitions instanceof ProcessDefinitionSearchQueryResult) {
        printf("Found %d process definitions.\n", count($definitions->getItems()));
    }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/php-sdk/using-the-sdk
