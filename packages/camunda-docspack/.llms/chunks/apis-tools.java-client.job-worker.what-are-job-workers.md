# Job worker — What are job workers?

A job worker is a service that:

- **Polls for jobs** of a specific type from the Camunda cluster
- **Executes your business logic** when jobs are activated
- **Reports job completion or failure** back to the cluster
- **Handles retries and error scenarios** automatically

When you model a service task in your BPMN process and assign it a job type (e.g., `send-email`, `process-payment`), job workers subscribe to these job types and process them as they become available.


## Key benefits

- **Decoupled architecture**: Workers run independently from the process engine
- **Scalable processing**: Add more workers to handle increased load
- **Fault tolerance**: Built-in retry mechanisms and error handling
- **Language flexibility**: Implement workers in any language with a Camunda client

---
Source: https://docs.camunda.io/docs/next/apis-tools/java-client/job-worker
