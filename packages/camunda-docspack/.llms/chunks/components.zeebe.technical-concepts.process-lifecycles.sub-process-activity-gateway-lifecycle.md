# Process lifecycles — (Sub-)Process/Activity/Gateway lifecycle

![activity lifecycle](assets/activity-lifecycle.png)


## Event lifecycle

![event lifecycle](assets/event-lifecycle.png)


## Sequence flow lifecycle

![sequence flow lifecycle](assets/pass-through-lifecycle.png)


## Example

![order process](assets/process.png)

Given the above process, a successful execution yields the following records in the commit log:

    
        Intent
        Element ID
        Element type
    
    
        ELEMENT_ACTIVATING
        order-process
        process
    
    
        ELEMENT_ACTIVATED
        order-process
        process
    
    
        ELEMENT_ACTIVATING
        order-placed
        start event
    
    
        ELEMENT_ACTIVATED
        order-placed
        start event
    
    
        ELEMENT_COMPLETING
        order-placed
        start event
    
    
        ELEMENT_COMPLETED
        order-placed
        start event
    
    
        SEQUENCE_FLOW_TAKEN
        to-collect-money
        sequence flow
    
    
        ELEMENT_ACTIVATING
        collect-money
        task
    
    
        ELEMENT_ACTIVATED
        collect-money
        task
    
    
        ELEMENT_COMPLETING
        collect-money
        task
    
    
        ELEMENT_COMPLETED
        collect-money
        task
    
    
        SEQUENCE_FLOW_TAKEN
        to-fetch-items
        sequence flow
    
    
        ...
        ...
        ...
    
    
        SEQUENCE_FLOW_TAKEN
        to-order-delivered
        sequence flow
    
    
        ELEMENT_ACTIVATING
        order-delivered
        end event
    
    
        ELEMENT_ACTIVATED
        order-delivered
        end event
    
    
        ELEMENT_COMPLETING
        order-delivered
        end event
    
    
        ELEMENT_COMPLETED
        order-delivered
        end event
    
    
        ELEMENT_COMPLETING
        order-process
        process
    
    
        ELEMENT_COMPLETED
        order-process
        process

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/process-lifecycles
