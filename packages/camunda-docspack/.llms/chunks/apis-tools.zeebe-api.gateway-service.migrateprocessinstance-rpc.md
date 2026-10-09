# Zeebe API RPCs — `MigrateProcessInstance` RPC

Migrates a process instance to a new process definition. The command can contain multiple mapping instructions
to define mapping between the active process instance's elements and target process definition elements.

Use the command to upgrade a process instance to a new version of a process or to a different process definition.
E.g. keep your running instances up-to-date with the latest process improvements.

### Input: `MigrateProcessInstanceRequest`

```protobuf
message MigrateProcessInstanceRequest {
  // key of the process instance to migrate
  int64 processInstanceKey = 1;
  // the migration plan that defines target process and element mappings
  MigrationPlan migrationPlan = 2;

  message MigrationPlan {
    // the key of process definition to migrate the process instance to
    int64 targetProcessDefinitionKey = 1;
    // the mapping instructions describe how to map elements from the source process definition to the target process definition
    repeated MappingInstruction mappingInstructions = 2;
  }

  message MappingInstruction {
    // the element ID to migrate from
    string sourceElementId = 1;
    // the element ID to migrate into
    string targetElementId = 2;
  }
}
```

### Output: `MigrateProcessInstanceResponse`

```protobuf
message MigrateProcessInstanceResponse {
}
```

### Errors

#### GRPC_STATUS_NOT_FOUND

Returned if:

- No process instance exists with the given key, or it is not active
- No process definition exists with the given target definition key
- No process instance exists with the given key for the tenants the user is authorized to work with.

#### GRPC_STATUS_INVALID_ARGUMENT

Returned if:

- A `sourceElementId` does not refer to an element in the process instance's process definition
- A `targetElementId` does not refer to an element in the target process definition
- A `sourceElementId` is mapped by multiple mapping instructions.
  For example, the engine cannot determine how to migrate a process instance when the instructions are: [A->B, A->C].

#### GRPC_STATUS_FAILED_PRECONDITION

Returned if:

- Not all active elements in the given process instance are mapped to the elements in the target process definition
- A mapping instruction changes the type of an element or event
- A mapping instruction changes the implementation of a task
- A mapping instruction refers to an unsupported element (i.e. some elements will be supported later on)
- A mapping instruction refers to element in unsupported scenarios.
  (i.e. migrating active elements with event subscriptions will be supported later on)
- A mapping instruction detaches a boundary event from an active element
- Multiple mapping instructions refer to the same catch event
- A mapping instruction changes a parallel multi-instance body to a sequential multi-instance body or vice versa

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api/gateway-service
