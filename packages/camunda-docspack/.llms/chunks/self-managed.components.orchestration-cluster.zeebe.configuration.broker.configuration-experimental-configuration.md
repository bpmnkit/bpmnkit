# Broker configuration — Configuration — Experimental configuration

See the experimental section of the [defaults.yaml](https://github.com/camunda/camunda/blob/main/dist/src/main/config/defaults.yaml).

Be aware that all configurations which are part of the experimental section are subject to change and can be dropped at any time.

#### zeebe.broker.experimental.engine.caches

| Field                        | Description                                                                                                                                                                                                                                                                                                                                        | Example value |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| groupNameCacheCapacity       | Maximum number of group names held in the in-memory name-to-ID cache used during candidate group resolution. This setting can also be overridden using the environment variable `ZEEBE_BROKER_EXPERIMENTAL_ENGINE_CACHES_GROUPNAMECACHECAPACITY`.                                                                                                  | 1000          |
| candidateGroupNameResolution | If true, the Zeebe engine attempts to resolve user task candidate group names to group IDs at task creation. Set to false to disable this resolution and pass candidate group values through unchanged. This setting can also be overridden using the environment variable `ZEEBE_BROKER_EXPERIMENTAL_ENGINE_CACHES_CANDIDATEGROUPNAMERESOLUTION`. | true          |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
