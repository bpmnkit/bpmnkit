# Migrate to Camunda user tasks — How Tasklist API (V1) compares to Orchestration Cluster REST API (V2)

**Note**
The Tasklist REST API is [deprecated with the 8.8 release and will be deleted with the 8.10 release](https://docs.camunda.io/docs/next/reference/announcements-release-notes/880/880-announcements#deprecated-operate-and-tasklist-v1-rest-apis).

The following table provides a breakdown of which operations are supported in which API, and for which user tasks.

    
        Operation
        Tasklist API
        Orchestration Cluster REST API
    
    
        Query tasks
        ✔ All types
        ✔ Camunda user tasks
    
    
        Get task
        ✔ All types
        ✔ Camunda user tasks
    
    
        Retrieve task variables
        ✔ All types
        ✔ Camunda user tasks
    
    
        Get task form
        ✔ All types
        ✔ Camunda user tasks
    
    
        Change task assignment
        ✔ Job worker-based tasks
        ✔ Camunda user tasks
    
    
        Complete task
        ✔ Job worker-based tasks
        ✔ Camunda user tasks
    
    
        Update task
        Not supported
        ✔ Camunda user tasks
    
    
        Safe and retrieve draft variables
        ✔ Job worker-based tasks
        Not supported
    

The following table outlines the respective endpoints. Click the endpoints to follow to the API documentation and inspect the differences in the request and response objects.

    
        Operation
        Tasklist API
        Orchestration Cluster REST API
    
    
        Query user tasks
        
            POST /tasks/search
        
        
            
                POST /user-tasks/search
            
        
    
    
        Get user task
        
            GET /tasks/:taskId
        
        
            
                GET /user-tasks/:userTaskKey
            
        
    
    
        Retrieve task variables
        
            GET /variables/:variableId
        
        
            
                POST /tasks/:taskId/variables/search
            
        
    
    
        Get task form
        
            GET /forms/:formId
        
        
            
                GET /user-tasks/:userTaskKey/form
            
        
    
    
        Assign a task
        
            PATCH /tasks/:taskId/assign
        
        
            
                POST /user-tasks/:userTaskKey/assignment
            
        
    
    
        Unassign a task
        
            PATCH /tasks/:taskId/unassign
        
        
            
                DELETE /user-tasks/:userTaskKey/assignee
            
        
    
    
        Complete task
        
            PATCH /tasks/:taskId/complete
        
        
            
                POST /user-tasks/:userTaskKey/completion
            
        
    
    
        Update task
        Not supported
        
            
                PATCH /user-tasks/:userTaskKey
            
        
    
    
        Save and retrieve draft variables
        
            POST /tasks/:taskId/variables
        
        -
    

### Zeebe Java client

Use the Zeebe Java client when you are building your task application in Java. The client assists with managing authentication and request/response objects.

### API differences

<!-- TODO two cards to link to boh API docs, once available -->

Refer to the dedicated sections and API explorers to learn details about the APIs.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-user-tasks
