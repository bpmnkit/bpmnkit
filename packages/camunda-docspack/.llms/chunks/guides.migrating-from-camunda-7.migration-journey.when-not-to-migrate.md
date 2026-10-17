# Migration journey — When not to migrate?

You might wonder if there are cases where migration doesn't make sense? Camunda basically sees two scenarios here:

- Your solution is in legacy mode and will approach its own end of life before Camunda ends support.
- Your solution relies on an architecture that is not possible with Camunda 8. For example, software vendors that embedded Camunda 7 as a Java library into their own build, relying on shipping exactly one self-contained Java application. Refer to [conceptual differences](https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/conceptual-differences) for technical details. Most often, you could still migrate those scenarios if you rearchitect the solution.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-journey
