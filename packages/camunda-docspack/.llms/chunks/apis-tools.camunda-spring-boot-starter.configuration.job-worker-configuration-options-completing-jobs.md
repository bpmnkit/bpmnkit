# Configuration — Job worker configuration options — Completing jobs

#### Auto-completing jobs

By default, the `autoComplete` attribute is set to `true` for any job worker.

In this case, the Spring integration will handle job completion for you:

```java
@JobWorker
public void processOrder() {
  // do whatever you need to do
  // no need to call client.newCompleteCommand()...
}
```

**Note**
The code within the handler method needs to be synchronously executed, as the completion will be triggered right after the method has finished.

##### Returning results

When using `autoComplete` you can return:

- a `Map<String, Object>` containing the process variables to set as result of the job
- a `String` containing a valid JSON object
- an `InputStream` streaming a valid JSON object
- an `Object` that will be serialized to a JSON object

```java
@JobWorker
public Map<String, Object> processOrder() {
  // some work
  if (successful) {
    // some data is returned to be stored as process variable
    return variablesMap;
  } else {
    // problem shall be indicated to the process:
    throw new BpmnError("DOESNT_WORK", "This does not work because...");
  }
}
```

##### Documents as job results

If you want to send a document as job result, you can do this by making a `DocumentContext` part of the response.

It can be part of a `Map<String, Object>`:

```java
@JobWorker
public Map<String, Object> sendDocumentAsResult() {
  String resultDocumentContent = documentService.loadResult();
  Map<String, Object> result = new HashMap<>();
  result.put("resultDocument", DocumentContext.result()
          .addDocument(
              "result.json", b -> b.content(resultDocumentContent).contentType("application/json"))
          .build());
  return result;
}
```

It can also be part of an `Object`:

```java
public record DocumentResult(DocumentContext responseDocument) {}

@JobWorker
public DocumentResult sendDocumentAsResult() {
  String resultDocumentContent = documentService.loadResult();
  DocumentContext responseDocument = DocumentContext.result()
          .addDocument(
              "result.json", b -> b.content(resultDocumentContent).contentType("application/json"))
          .build());
  return new DocumentResult(responseDocument);
}
```

##### Completing ad-hoc sub-process jobs with a result

When your job worker handles an [ad-hoc sub-process](https://docs.camunda.io/docs/next/reference/glossary#ad-hoc-sub-process) job, you can return an `AdHocSubProcessResultFunction` to specify which element to activate within the sub-process. The starter automatically applies the result when you complete the job.

Return a lambda that calls `activateElement` with the target element ID:

```java
@JobWorker(type = "myAdHocSubprocessJob")
public AdHocSubProcessResultFunction handleAdHocSubprocess() {
  return r -> r.activateElement("myElementId");
}
```

To also submit process variables with the result, use the `AdHocSubProcessResultFunction.withVariables` factory method:

```java
@JobWorker(type = "myAdHocSubprocessJob")
public AdHocSubProcessResultFunction handleAdHocSubprocess() {
  Map<String, Object> variables = Map.of("decision", "approved");
  return AdHocSubProcessResultFunction.withVariables(variables,
      r -> r.activateElement("approvalTask"));
}
```

##### Completing user task listener jobs with a result

When your job worker handles a user task listener job, you can return a `UserTaskResultFunction` to control the outcome of the listener. The starter automatically applies the result when you complete the job.

Return a lambda that configures the result, for example to correct the assignee:

```java
@JobWorker(type = "io.camunda:userTaskListener:complete")
public UserTaskResultFunction handleUserTaskListener() {
  return r -> r.correctAssignee("newAssignee");
}
```

#### Programmatically completing jobs

Your job worker code can also complete the job itself. This gives you more control over when you want to complete the job (for example, allowing you to move the completion to reactive callbacks):

```java
@JobWorker(autoComplete = false)
public void processOrder(final JobClient client, final ActivatedJob job) {
  // do whatever you need to do
  client.newCompleteCommand(job.getKey())
     .send()
     .exceptionally(throwable -> { throw new RuntimeException("Could not complete job " + job, throwable); });
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
