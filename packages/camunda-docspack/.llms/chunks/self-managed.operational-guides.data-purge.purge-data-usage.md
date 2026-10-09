# Camunda data purge — Purge data — Usage

The purge operation is a cluster-wide, asynchronous operation. Since it is asynchronous, you first launch it by sending a `POST` request to `/actuator/cluster/purge`, and then monitor by polling the topology via `/actuator/cluster` until it is finished.

**Warning**
In a cluster running multiple [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index), a request without a `physicalTenant` parameter purges **every** Physical Tenant, not just the default one. This is the opposite of how unscoped requests behave on the REST `/v2/...` API, where an omitted tenant prefix resolves to the default tenant only. Add `?physicalTenant={physicalTenantId}` to purge a single tenant and leave the others untouched.

**Note**
This example relies on the [curl](https://curl.se/) and [jq](https://jqlang.org/) utilities.

```sh
changeId=$(curl -sL -X POST 'http://localhost:9600/actuator/cluster/purge' | jq '.changeId')
lastChangeId=-1
while [ ! $changeId -eq $lastChangeId ]; do
  lastChangeId=$(curl -sL 'http://localhost:9600/actuator/cluster' | jq '.lastChange.id')
  [ $changeId -ge $lastChangeId ] && break
  echo "Awaiting last change ID ${lastChangeId} to be equal to purge change ID ${changeId}"
  sleep 1
done
```

**Note**
This example relies on code generated from [this OpenAPI spec](https://github.com/camunda/camunda/blob/main/dist/src/main/resources/api/cluster/cluster-api.yaml),
bundled with the distribution.

```java
final String baseURL = "http://localhost:9600/actuator/cluster";
final URL monitorURI = URI.create(baseURL).toURL();
final URI purgeURI = URI.create(baseURL + "/purge");
final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
try (final HttpClient client = HttpClient.newHttpClient()) {
  final HttpRequest purgeRequest =
      HttpRequest.newBuilder().uri(purgeURI).POST(HttpRequest.BodyPublishers.noBody()).build();

  final HttpResponse<InputStream> purgeResponse =
      client.send(purgeRequest, BodyHandlers.ofInputStream());
  final PlannedOperationsResponse purgePlan =
      objectMapper.readValue(purgeResponse.body(), PlannedOperationsResponse.class);

  final long purgeChangeId = purgePlan.getChangeId();
  long lastChangeId = -1;
  while (purgeChangeId != lastChangeId) {
    final GetTopologyResponse topology =
        objectMapper.readValue(monitorURI, GetTopologyResponse.class);
    lastChangeId = topology.getLastChange().getId();
    if (lastChangeId >= purgeChangeId) {
      break;
    }

    System.out.println(
        "Waiting until the last change ID "
            + lastChangeId
            + " is equal to the purge change ID "
            + purgeChangeId);
    Thread.sleep(1_000);
  }
}
```

To know if your purge operation is finished, compare the change ID returned by launching it with the last change ID from the topology request. When the last change ID is greater than or equal to your purge operation's change ID, then purging is finished.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/data-purge
