# Zeebe API RPCs — `CreateProcessInstance` RPC

Creates and starts an instance of the specified process. The process definition to use
to create the instance can be specified either using its unique key (as returned by
DeployProcess), or using the BPMN process ID and a version. Pass -1 as the version to
use the latest deployed version.

**Note**
Only processes with none start events can be started through this command.

**Note**
Start and runtime instructions have the
same [limitations as process instance modification](https://docs.camunda.io/docs/next/components/concepts/process-instance-modification#limitations),
e.g., it is not possible to start at a sequence flow or terminate a process instance when a sequence
flow completes.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
