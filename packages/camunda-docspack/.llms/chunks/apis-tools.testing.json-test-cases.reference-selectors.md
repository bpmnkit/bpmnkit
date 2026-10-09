# JSON test cases — Reference: Selectors

Selectors are used to identify specific resources in your process tests. Each selector must contain at least one of the specified properties.

### Decision Definition Selector

A selector to identify a decision definition.

  
    Property
    Description
    Type
    Required
  
  
    decisionDefinitionId
    ID of the decision definition
    string
    Yes
  

Example:

```json
{
  "decisionDefinitionId": "ChooseRocket"
}
```

### Decision Selector

A selector to identify a decision. The selector must contain at least one of the following properties:

  
    Property
    Description
    Type
    Required
  
  
    decisionDefinitionId
    ID of the decision definition
    string
    No
  
  
    decisionDefinitionName
    Name of the decision definition
    string
    No
  

Example:

```json
{
  "decisionDefinitionId": "ChooseRocket"
}
```

### Element Selector

A selector to identify a BPMN element. The selector must contain at least one of the following properties:

  
    Property
    Description
    Type
    Required
  
  
    elementId
    ID of the BPMN element
    string
    No
  
  
    elementName
    Name of the BPMN element
    string
    No
  

Example:

```json
{
  "elementId": "LaunchRocket"
}
```

### Incident Selector

A selector to identify an incident. The selector must contain at least one of the following properties:

  
    Property
    Description
    Type
    Required
  
  
    elementId
    ID of the BPMN element where the incident occurred
    string
    No
  
  
    processDefinitionId
    Process definition ID of the incident
    string
    No
  

Example:

```json
{
  "elementId": "LaunchRocket"
}
```

### Job Selector

A selector to identify a job. The selector must contain at least one of the following properties:

  
    Property
    Description
    Type
    Required
  
  
    jobType
    Type of the job
    string
    No
  
  
    elementId
    ID of the BPMN element
    string
    No
  
  
    processDefinitionId
    Process definition ID of the job
    string
    No
  

Example:

```json
{
  "jobType": "analyze-moon-samples"
}
```

### Message Selector

A selector to identify a message.

  
    Property
    Description
    Type
    Required
  
  
    messageName
    Name of the message
    string
    Yes
  
  
    correlationKey
    Correlation key of the message
    string
    No
  

Example:

```json
{
  "messageName": "AstronautReady"
}
```

### Process Definition Selector

A selector to identify a process definition.

  
    Property
    Description
    Type
    Required
  
  
    processDefinitionId
    ID of the process definition
    string
    Yes
  

Example:

```json
{
  "processDefinitionId": "MoonExplorationProcess"
}
```

### Process Instance Selector

A selector to identify a process instance.

  
    Property
    Description
    Type
    Required
  
  
    processDefinitionId
    Process definition ID of the process instance
    string
    Yes
  

```json
{
  "processDefinitionId": "MoonExplorationProcess"
}
```

### User Task Selector

A selector to identify a user task. The selector must contain at least one of the following properties:

  
    Property
    Description
    Type
    Required
  
  
    elementId
    ID of the BPMN element
    string
    No
  
  
    taskName
    Name of the user task
    string
    No
  
  
    processDefinitionId
    Process definition ID of the user task
    string
    No
  

Example:

```json
{
  "elementId": "ReviewMissionPlan"
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
