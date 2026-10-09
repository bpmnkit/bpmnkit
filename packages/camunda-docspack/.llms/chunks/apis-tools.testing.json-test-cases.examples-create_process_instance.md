# JSON test cases — Examples — CREATE_PROCESS_INSTANCE

An instruction to create a new process instance.

  
    Property
    Description
    Type
    Required
    Default
  
  
    type
    Instruction type, must be "CREATE_PROCESS_INSTANCE"
    string
    Yes
    
  
  
    processDefinitionSelector
    The selector to identify the process definition to create the process instance for.
    ProcessDefinitionSelector
    Yes
    
  
  
    variables
    The variables to create the process instance with.
    object
    No
    
  
  
    startInstructions
    The instructions to execute when starting the process instance.
    array of StartInstruction
    No
    
  
  
    runtimeInstructions
    The instructions to affect the runtime behavior of the process instance.
    array of RuntimeInstruction
    No
    
  

#### Start Instruction

An instruction to execute when starting a process instance.

  
    Property
    Description
    Type
    Required
  
  
    elementId
    The ID of the element to start the process instance at.
    string
    Yes
  

#### Runtime Instruction

An instruction to affect the runtime behavior of a process instance.

  
    Property
    Description
    Type
    Required
  
  
    type
    The type of the runtime instruction. Currently supports "TERMINATE_PROCESS_INSTANCE".
    string
    Yes
  
  
    afterElementId
    The ID of the element after which to terminate the process instance. Required when type is "TERMINATE_PROCESS_INSTANCE".
    string
    Yes
  

Example:

```json
{
  "type": "CREATE_PROCESS_INSTANCE",
  "processDefinitionSelector": {
    "processDefinitionId": "MoonExplorationProcess"
  },
  "variables": {
    "missionName": "Artemis-Zee",
    "destination": "Moon",
    "astronautCount": 4
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
