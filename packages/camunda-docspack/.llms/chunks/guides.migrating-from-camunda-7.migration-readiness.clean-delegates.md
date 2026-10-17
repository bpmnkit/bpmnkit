# Migration-ready solutions — Clean delegates

Given that Java delegates and the workflow engine are embedded as a library, projects can do dirty hacks in their code. Casting to implementation classes? No problem. Using a ThreadLocal or trusting a specific transaction manager implementation? Yeah, possible. Calling complex Spring beans hidden behind a simple Java Unified Expression Language (JUEL) expression? Well, you guessed it — doable!

Those hacks are the real showstoppers for migration, as they cannot be migrated to Camunda 8. In fact, [Camunda 8 increased isolation intentionally](https://blog.bernd-ruecker.com/moving-from-embedded-to-remote-workflow-engines-8472992cc371).

Concentrate on what a Java delegate is intended to do:

1. Read variables from the process and potentially manipulate or transform that data to be used by your business logic.
2. Delegate to business logic — this is where Java delegates got their name from. In a perfect world, you would simply issue a call to your business code in another Spring bean or remote service.
3. Transform the results of that business logic into variables you write into the process.

The following is an example of a good Java delegate:

```java
@Component
public class CreateCustomerInCrmJavaDelegate implements JavaDelegate {

    @Autowired
    private CrmFacade crmFacade;

    public void execute(DelegateExecution execution) throws Exception {
        // Data Input Mapping
        CustomerData customerData = (CustomerData) execution.getVariable("customerData");

        // Delegate to business logic
        String customerId = crmFacade.createCustomer(customerData);

        // Data Output Mapping
        execution.setVariable("customerId", customerId);
    }
}
```

Never cast to Camunda implementation classes, use any ThreadLocal object, or influence the transaction manager in any way. Java delegates should always be stateless and not store any data in their fields.

You can migrate such delegates according to our [code conversion patterns](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion#code-conversion-patterns), for example using [OpenRewrite recipes](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion#refactoring-recipes-using-openrewrite).

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-readiness
