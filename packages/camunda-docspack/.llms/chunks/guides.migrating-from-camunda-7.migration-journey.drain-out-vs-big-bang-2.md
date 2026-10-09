# Migration journey — Drain out vs big bang (2)

**Migrating your solution landscape step-by-step**

If you run multiple process solutions, you best migrate them one by one.

You can also drive this idea one step further. If you have complex solutions with multiple BPMN models, call activities, and further dependencies, even migrating those solutions in one go might be overwhelming. In this case, you could apply a microservices mindset and adjust your call activities to be service calls to other components. This way, you could migrate that solution process by process. This is not a general recommendation, just illustrating possibilities to reduce the migration scope.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
