# Configuration — Job worker configuration options — Define job worker function parameters

The method signature you use to define job worker functions determines what data is available in your worker. For fetching process variables, use [`@Variable`](#using-variable-recommended) or [`@VariablesAsType`](#using-variablesastype) — both are covered in the [variable fetching section](#control-variable-fetching) above.

Unless stated otherwise, all specified methods for fetching variables will be combined into a single list of variables to retrieve.

#### `JobClient` parameter

The `JobClient` is also part of the native `JobHandler` functional interface:

```java
@JobWorker
public void processOrder(final JobClient jobClient) {
  // ...
}
```

#### `ActivatedJob` parameter

The `ActivatedJob` is also part of the native `JobHandler` functional interface.

This will **prevent** the implicit variable fetching detection as you can retrieve variables in a programmatic way now:

```java
@JobWorker
public void processOrder(final ActivatedJob job) {
  String orderId = (String) job.getVariablesAsMap().get("orderId");
  // ...
}
```

**Note**
Only explicit variable fetching will be effective when using the `ActivatedJob` as a parameter.

#### Using `@Document`

You can inject a `DocumentContext` by using the `@Document` annotation:

```java
@JobWorker
public void processDocument(@Document DocumentContext doc) {
  List<DocumentEntry> documents = doc.getDocuments();
  // do what you need to do with the document entries
}
```

Each `DocumentEntry` grants you access to the `DocumentReferenceResponse` that contains the reference data to the document and the `DocumentLinkResponse` that contains a link to the document.

On top, you can directly retrieve the document content as `InputStream` or `byte[]`.

#### Using `@CustomHeaders`

You can use the `@CustomHeaders` annotation for a `Map<String, String>` parameter to retrieve [custom headers](https://docs.camunda.io/docs/next/components/concepts/job-workers) for a job:

```java
@JobWorker
public void processOrder(@CustomHeaders Map<String, String> headers) {
  // do whatever you need to do
}
```

**Note**
This will not have any effect on the variable fetching behavior.

#### Using `@ProcessInstanceKey`, `@ElementInstanceKey`, `@JobKey`, `@ProcessDefinitionKey` and `@RootProcessInstanceKey`

You can use the `@ProcessInstanceKey`, `@ElementInstanceKey`, `@JobKey`, `@ProcessDefinitionKey` and `@RootProcessInstanceKey` annotation for a `String`, `long` or `Long` parameter to retrieve the according key for a job:

```java
@JobWorker
public void processOrder(
  @ProcessInstanceKey String processInstanceKey,
  @ElementInstanceKey long elementInstanceKey,
  @JobKey Long jobKey,
  @ProcessDefinitionKey String processDefinitionKey,
  @RootProcessInstanceKey long rootProcessInstanceKey) {
  // do whatever you need to do
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/configuration
