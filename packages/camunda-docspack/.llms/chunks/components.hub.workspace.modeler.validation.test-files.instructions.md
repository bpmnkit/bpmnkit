# Test files — Instructions

Each instruction has a `type` property that identifies the action or assertion, plus additional properties depending on the type. Resources such as process instances, elements, user tasks, jobs, and messages are referenced through **selectors**.

The sections below show the instructions most commonly used in Test cases. For the complete list of instructions, selectors, and the full schema reference, see [JSON test cases](https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases).

### Create process instance

Creates a new process instance from a process definition.

```json
{
  "type": "CREATE_PROCESS_INSTANCE",
  "processDefinitionSelector": {
    "processDefinitionId": "order-process"
  },
  "variables": {
    "orderId": "ORD-001",
    "priority": "high"
  }
}
```

To start a process via a message start event, use [`PUBLISH_MESSAGE`](#publish-message). To start a process via a signal start event, use [`BROADCAST_SIGNAL`](#broadcast-signal).

### Complete job

Completes a service task job during process execution.

```json
{
  "type": "COMPLETE_JOB",
  "jobSelector": {
    "elementId": "processPayment"
  },
  "variables": {
    "paymentResult": "success",
    "transactionId": "TXN-123"
  }
}
```

### Broadcast signal

Broadcasts a signal that can be caught by signal start events, signal intermediate catch events, or signal boundary events.

```json
{
  "type": "BROADCAST_SIGNAL",
  "signalName": "ApprovalReceived",
  "variables": {
    "approved": true,
    "approver": "manager@company.com"
  }
}
```

### Complete user task

Completes a user task with optional form data or variables.

```json
{
  "type": "COMPLETE_USER_TASK",
  "userTaskSelector": {
    "elementId": "reviewOrder"
  },
  "variables": {
    "reviewComment": "Order looks good",
    "approved": true
  }
}
```

### Publish message

Publishes a message that can be caught by message start events, message intermediate catch events, or message boundary events.

```json
{
  "type": "PUBLISH_MESSAGE",
  "name": "PaymentConfirmed",
  "correlationKey": "order-12345",
  "variables": {
    "paymentAmount": 99.99,
    "paymentMethod": "credit_card"
  },
  "timeToLive": 300000,
  "messageId": "payment-msg-001"
}
```

### Throw BPMN error from job

Simulates a job failure by throwing a BPMN error during service task execution.

```json
{
  "type": "THROW_BPMN_ERROR_FROM_JOB",
  "jobSelector": {
    "elementId": "processPayment"
  },
  "errorCode": "PAYMENT_FAILED",
  "errorMessage": "Insufficient funds in customer account"
}
```

### Update variables

Updates process variables during test execution.

```json
{
  "type": "UPDATE_VARIABLES",
  "processInstanceSelector": {
    "processDefinitionId": "order-process"
  },
  "variables": {
    "customerId": "12345",
    "amount": 100.5
  }
}
```

### Resolve incident

Resolves an incident that was created due to a job failure or another process issue.

```json
{
  "type": "RESOLVE_INCIDENT",
  "incidentSelector": {
    "elementId": "processPayment"
  }
}
```

### Assert variables

Checks that one or more process or local variables have expected values. Supports Test mode's [variable assertions](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process#variable-assertions).

```json
{
  "type": "ASSERT_VARIABLES",
  "processInstanceSelector": {
    "processDefinitionId": "order-process"
  },
  "variables": {
    "orderStatus": "confirmed"
  }
}
```

### Assert an element instance (path)

Checks that a specific element reached an expected state. Supports Test mode's [element (path) assertions](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process#element-path-assertions).

```json
{
  "type": "ASSERT_ELEMENT_INSTANCE",
  "processInstanceSelector": {
    "processDefinitionId": "order-process"
  },
  "elementSelector": {
    "elementId": "shipOrder"
  },
  "state": "IS_COMPLETED"
}
```

### Assert a process instance

Checks the overall state of the process instance. Supports Test mode's [process instance assertions](https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process#process-instance-assertions).

```json
{
  "type": "ASSERT_PROCESS_INSTANCE",
  "processInstanceSelector": {
    "processDefinitionId": "order-process"
  },
  "state": "IS_COMPLETED"
}
```

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-files
