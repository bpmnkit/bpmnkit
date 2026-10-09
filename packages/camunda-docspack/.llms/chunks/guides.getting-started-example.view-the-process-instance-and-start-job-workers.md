# Run your first Spring Boot, Node.js, Python, or C# project with Camunda 8 — View the process instance and start job workers

A [process instance](https://docs.camunda.io/docs/next/reference/glossary#process-instance) is now running in the engine.

You can view the process instance in **Operate**, the visual operations tool:

1. Navigate to: [http://localhost:8080/operate](http://localhost:8080/operate)
2. Login with the credentials: `demo` / `demo`.

There you will see an active process instance.

**Note**
Data needs to sync to Operate, so the process instance may not be visible immediately.

Additionally, when the workers are running, process instances will be completed immediately and further process instances will not appear as active.

![Active process instance visible in Operate](./img/get-started-operate-screenshot.png)

Next, start the job workers to allow them to perform the work for the service tasks. The workers are configured to connect to the locally-running engine and retrieve available work for the process instance.

### javaspring

Change into the Spring SDK directory:

```bash
cd camunda-8-get-started/2-order-process-with-service-workers/java
```

      
      
        Start the workers with the command:

```bash
mvn spring-boot:run
```

      
      
        You can stop the application via Ctrl+C.
      
    

  

  
### nodejs

    
      
        Change into the Node.js SDK directory:
```bash
cd camunda-8-get-started/2-order-process-with-service-workers/nodejs
```
      
      
        Install dependencies with the command:
```bash
npm i
```
      
      
        Start the workers with the command:
```bash
npm start
```
      
      
        You can stop the application via Ctrl+C.
      
    
  

  
### python

    
      
        Change into the Python SDK directory:
```bash
cd camunda-8-get-started/2-order-process-with-service-workers/python
```
      
      
        Create a virtual environment and install dependencies:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
      
      
        Start the workers with the command:
```bash
python main.py
```
      
      
        You can stop the application via Ctrl+C.
      
    
  

  
### csharp

    
      
        Change into the C# SDK directory:
```bash
cd camunda-8-get-started/2-order-process-with-service-workers/csharp
```
      
      
        Start the workers with the command:
```bash
dotnet run
```
      
      
        You can stop the application via Ctrl+C.
      
    
  
   

The workers start, connect to the engine, and request work. You will see the workers processing the jobs for the process instance.

---
Source: https://docs.camunda.io/docs/next/guides/getting-started-example
