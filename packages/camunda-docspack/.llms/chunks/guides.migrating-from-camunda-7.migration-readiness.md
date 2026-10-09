# Migration-ready solutions

Learn how to build Camunda 7 solutions that are easy to migrate.

To implement Camunda 7 process solutions that can be easily migrated, follow these rules and development practices.


## Overview

These practices might also inform a refactoring step to prepare your existing Camunda 7 solution for migration:

- Implement what we call **Clean Delegates** - concentrate on reading and writing process variables, plus business logic delegation. Data transformations will be mostly done as part of your delegate (and especially not as listeners, as mentioned below). Separate your actual business logic from the delegates and all Camunda APIs. Avoid accessing the BPMN model and invoking Camunda APIs within your delegates.
- Use **primitive variable types or JSON** payloads only (no XML or serialized Java objects).
- Use **simple expressions** or plug-in **FEEL**. FEEL is the only supported expression language in Camunda 8. JSONPath is also relatively easy to translate to FEEL. Avoid using special variables in expressions, for example `execution` or `task`.
- Use your own user interface for task forms or Camunda Forms; the other form mechanisms are not supported out of the box in Camunda 8.

- **Don’t** rely on an **ACID transaction manager** spanning multiple steps or resources.
- **Don’t expose Camunda APIs** (REST or Java) to other services or frontend applications.
- **Don’t call Spring beans in expressions** (for example to leverage Java code to do data transformations).
- **Avoid** using any **implementation classes** from Camunda; generally, those with `\*.impl.\*` in their package name.
- **Avoid** using **process engine plugins**.
- **Avoid** using **Cockpit plugins**.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-readiness
