# Run your first Spring Boot, Node.js, Python, or C# project with Camunda 8 — Example project

The example project, located in the `camunda-8-get-started/2-order-process-with-service-workers` directory, contains a BPMN process model that represents a simple e-commerce flow with three service tasks.

![Example business process](./img/getting-started-guide-example-process.png)

The service tasks in the process are executed by [job workers](https://docs.camunda.io/docs/next/reference/glossary#job-worker). The `java`, `nodejs`, `python`, and `csharp` directories inside `2-order-process-with-service-workers` contain code for job workers that correspond to this process model.


## Instructions

  
    Unzip the Camunda 8 starter package.
  

  
    Start Camunda 8 Run by changing into the directory and running the command:
    

### maclinux

    ```bash
./camunda-start.sh
```

### windows

```bash
.\camunda-start.bat
```

  

  
    Open the Desktop Modeler application from the starter package.
  

  
    In Desktop Modeler, click File > Open File
  

  
  Select `camunda-8-get-started/2-order-process-with-service-workers/bpmn/order-process.bpmn`
  

  
    Click the "Rocket" icon to connect to your Camunda 8 Run instance and deploy the model.
    You can use the pre-configured `c8run (local)` connection.
  

  
    Click the “Play” icon on the bottom toolbar of Desktop Modeler to deploy and start an instance of the process model.

    You do not need to set any variables for the process.

    Optionally, you can set a value for the item variable by pasting in:
    {`{"item": "special widget"}`}

    ![Start a new process instance in Desktop Modeler](./img/get-started-example-start-process.png)

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-example
