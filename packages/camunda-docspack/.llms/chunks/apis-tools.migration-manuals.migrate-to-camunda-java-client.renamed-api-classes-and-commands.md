# Migrate to the Camunda Java Client — Renamed API classes and commands

The following API classes have been changed in the Camunda Java Client:

| Old                             | New                               |
| :------------------------------ | :-------------------------------- |
| `ZeebeClientBuilder`            | `CamundaClientBuilder`            |
| `ZeebeClientClouldBuilderStep1` | `CamundaClientClouldBuilderStep1` |
| `ZeebeClientConfiguration`      | `CamundaClientConfiguration`      |
| `ZeebeFuture`                   | `CamundaFuture`                   |

The following commands have been renamed in the Camunda Java Client:

| Old                            | New                            |
| :----------------------------- | :----------------------------- |
| `newClockPinCommand()`         | `newPinClockCommand()`         |
| `newClockResetCommand()`       | `newResetClockCommand()`       |
| `newUserCreateCommand()`       | `newCreateUserCommand()`       |
| `newUserTaskAssignCommand()`   | `newAssignUserTaskCommand()`   |
| `newUserTaskCompleteCommand()` | `newCompleteUserTaskCommand()` |
| `newUserTaskUnassignCommand()` | `newUnassignUserTaskCommand()` |
| `newUserTaskUpdateCommand()`   | `newUpdateUserTaskCommand()`   |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-java-client
