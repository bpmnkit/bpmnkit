# Decision requirements graph — Decision requirements graph name

![Decision Requirements Graph Name](assets/decision-requirements-graph/drg-name.png)

The name describes the DRG. It is set as the `name` attribute on the `definitions` element.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             id="dinnerDecisions"
             name="Dinner Decisions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <!-- ... -->
</definitions>
```


## Decision requirements graph id

![Decision Requirements Graph Id](assets/decision-requirements-graph/drg-id.png)

The ID is the technical identifier of the DRG. It is set in the `id` attribute on the `definitions` element.

Each DRG should have an unique ID when it is deployed to Camunda.

```xml

<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             id="dinnerDecisions"
             name="Dinner Decisions"
             namespace="http://camunda.org/schema/1.0/dmn">
    <!-- ... -->
</definitions>
```

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/decision-requirements-graph
