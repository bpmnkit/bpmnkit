# Process definition data deletion

Configure Optimize to process asynchronous process definition data deletion requests.

Optimize processes [process definition data deletion](https://docs.camunda.io/docs/next/apis-tools/optimize-api/delete-process-definition-data) requests asynchronously, using a persisted job registry and a background dispatcher.


## Job registry dispatcher

The dispatcher polls the job registry for queued deletion requests and executes them in the background.

The dispatcher is disabled by default. Enable it on only one Optimize instance per cluster. Enabling it on more than one instance can lead to race conditions, such as the same job running more than once.

See the [job registry dispatcher settings](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#job-registry-dispatcher) for the available configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/process-definition-deletion
