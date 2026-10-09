# Migration-ready solutions — Simple expressions and FEEL

[Camunda 8 uses FEEL as its expression language](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel). There are big advantages to this decision. Not only are the expression languages between BPMN and DMN harmonized, but also the language is really powerful for typical expressions. One of my favorite examples is the following onboarding demo we regularly show. A decision table will hand back a list of possible risks, whereas every risk has a severity indicator (yellow, red) and a description.

![An onboarding demo DMN diagram](https://camunda.com/wp-content/uploads/2022/05/Migrating-to-Camunda-Platform-8-image-1-1024x367.png)

The result of this decision will be used in the process to make a routing decision:

![A BPMN diagram showing the routing decision](https://camunda.com/wp-content/uploads/2022/05/Migrate-to-Camunda-Platform-8-25052022-image-2-1024x481.png)

To unwrap the DMN result in Camunda 7, you could write some Java code and attach that to a listener when leaving the DMN task (this is already an anti-pattern for migration as you will read next). The code is not very readable:

```java
@Component
public class MapDmnResult implements ExecutionListener {

  @Override
  public void notify(DelegateExecution execution) throws Exception {
    List<String> risks = new ArrayList<String>();
    Set<String> riskLevels = new HashSet<String>();

    Object oDMNresult = execution.getVariable("riskDMNresult");
    for (Object oResult : (List<?>) oDMNresult) {
      Map<?, ?> result = (Map<?, ?>) oResult;
      risks.add(result.containsKey("risk") ? (String) result.get("risk") : "");
      if (result.get("riskLevel") != null) {
        riskLevels.add(((String) result.get("riskLevel")).toLowerCase());
      }
    }

    String accumulatedRiskLevel = "green";
    if (riskLevels.contains("rot") || riskLevels.contains("red")) {
      accumulatedRiskLevel = "red";
    } else if (riskLevels.contains("gelb") || riskLevels.contains("yellow")) {
      accumulatedRiskLevel = "yellow";
    }

    execution.setVariable("risks", Variables.objectValue(risks).serializationDataFormat(SerializationDataFormats.JSON).create());
    execution.setVariable("riskLevel", accumulatedRiskLevel);
  }
}
```

With FEEL, you can evaluate that data structure directly and have an expression on the "red" path:

```
= some risk in riskLevels satisfies risk = "red"
```

Additionally, you can even hook in FEEL as the scripting language in Camunda 7 (as explained in [Scripting with DMN inside BPMN](https://camunda.com/blog/2018/07/dmn-scripting/) or [User Task Assignment based on a DMN Decision Table](https://camunda.com/blog/2020/05/camunda-bpm-user-task-assignment-based-on-a-dmn-decision-table/)).

However, more commonly you will keep using JUEL in Camunda 7. If you write simple expressions, they can be migrated automatically, as you can see in [the test case](https://github.com/camunda-community-hub/camunda-7-to-8-migration-analyzer/blob/main/core/src/test/java/org/camunda/community/migration/converter/ExpressionTransformerTest.java) of the migration community extension. You should avoid more complex expressions if possible.

Very often, a good workaround to achieve this is to adjust the output mapping of your Java delegate to prepare data in a form that allows for easy expressions.

Avoid hooking in Java code during an expression evaluation. The above listener to process the DMN result was one example of this, but a more diabolic example could be the following expression in Camunda 7:

```java
// DON'T DO THIS:
#{ dmnResultChecker.check( riskDMNresult ) }
```

Now, the `dmnResultChecker` is a Spring bean that can contain arbitrary Java logic, possibly even querying some remote service to query whether we currently accept yellow risks or not. Such code cannot be executed within Camunda 8 FEEL expressions, and the logic needs to be moved elsewhere.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-readiness
