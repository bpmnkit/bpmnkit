# Migration-ready solutions — Use primitive variable types or JSON

Camunda 7 provides flexible ways to add data to your process. For example, you could add Java objects that would be serialized as byte code. Java byte code is brittle and also tied to the Java runtime environment.

Another possibility is transforming those objects on the fly to JSON or XML using Camunda Spin. It turned out this was black magic and led to regular problems, which is why Camunda 8 does not offer this any more. Instead, you should perform any transformation within your code before communicating with the Camunda API. Camunda 8 only takes JSON as a payload, which automatically includes primitive values.

In the following Java delegate example, you can see Spin and Jackson were used in the delegate for JSON to Java mapping:

```java
@Component
public class CreateCustomerInCrmJavaDelegate implements JavaDelegate {

    @Autowired
    private ObjectMapper objectMapper;
    //...

    public void execute(DelegateExecution execution) throws Exception {
        // Data Input Mapping
        JsonNode customerDataJson = ((JacksonJsonNode) execution.getVariable("customerData")).unwrap();
        CustomerData customerData = objectMapper.treeToValue(customerDataJson, CustomerData.class);
        // ...
    }
}
```

This way, you have full control over what is happening, and such code is also easily migratable. The overall complexity is even lower, as Jackson is quite well known to Java people — a kind of de-facto standard with a lot of best practices and recipes available.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-readiness
