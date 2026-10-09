# Broker configuration — Configuration — camunda.system

| Field            | Description                                                                                                                                                                                                                                                                                                                                                                                                                            | Example Value |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| cpu-thread-count | Controls the number of non-blocking CPU threads to be used. WARNING: You should never specify a value that is larger than the number of physical cores available. Good practice is to leave 1-2 cores for io threads and the operating system. For example, when running Zeebe on a machine with 4 cores, a good value would be 2. This setting can also be overridden using the environment variable `CAMUNDA_SYSTEM_CPUTHREADCOUNT`. | 2             |
| io-thread-count  | Controls the number of io threads to be used. These threads are used for workloads that write data to disk. While writing, these threads are blocked, which means that they yield the CPU. This setting can also be overridden using the environment variable `CAMUNDA_SYSTEM_IOTHREADCOUNT`.                                                                                                                                          | 2             |

#### YAML snippet

```yaml
camunda:
  system:
    cpu-thread-count: 2
    io-thread-count: 2
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
