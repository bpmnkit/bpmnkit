# Migrate to Camunda user tasks — Decide on your migration path

Camunda user tasks require migration of the user tasks in both your diagrams and the task API.

With this in mind, you can migrate at your own pace. If you should migrate now or later, and what is required to migrate depends on your current setup and future plans.

### Task type differences

To make an informed decision, you should understand the differences between both task types and the new capabilities of Camunda user tasks. Refer to this table for important high-level differences between the two task types:

    
        
        
            Camunda user tasks
            Recommended for new and existing projects
        
        
            Job worker-based user tasks
            Existing implementation
        
    
    
        Implementation location
        
            Zeebe
            Does not require Tasklist to run
        
        Tasklist
    
    
        Compatible versions
        8.5 +
        8.0 +
    
    
        Supports Tasklist UI
        Yes
        Yes
    
    
        API
    
    
        Supports Orchestration Cluster REST API
        
            Yes
            Full support
        
        No
    
    
        Supports Tasklist API (deprecated)
        
            Partially
            Queries, GET tasks, forms, variables
            ℹ  You must use Zeebe and Tasklist APIs to manage Camunda user tasks
        
        
            Yes
            Full support
        
    
    
        Supports job workers
        No
        Yes
    
    
        Supports task lifecycle events
        
            Yes
            Full lifecycle events including custom actions
        
        
            No
            Basic only: created/completed/canceled
        
    
    
        Supports task listeners
        
            Yes
        
        No
    
    
        Extras
    
    
        Custom actions/outcomes
        
            Yes
            Custom actions can be defined on any operation excluding unassign (DELETE assignment, send update beforehand)
        
        No
    
    
        Supports task reports in Optimize
        Yes
        No
    
    
        Recommendations
        
            Recommended for existing and new projects when you run Tasklist.
            Migrate existing projects and task applications/clients to this task type when you require one of the features above, or the following use cases:
            
                
                    Implement a full task lifecycle
                    React on any change/events in tasks, such as assignments, escalations, due date updates, or any custom actions
                    Send notifications
                    Track task or team performance
                    Build an audit log on task events
                    Enrich tasks with business data
                
            
        
        
            You can continue to use this task type on existing projects when you have a custom task application running on it and do not require any of the above features.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-user-tasks
