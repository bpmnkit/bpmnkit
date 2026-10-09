# Fix problems in your diagram

This feature assists you in debugging and fixing errors in your processes.

The **Problems** panel is at the bottom of the modeling interface. Use it to debug and fix errors in your processes.


## Design time errors

Based on a set of lint rules, Camunda Hub continuously validates implementation properties for a process diagram while the user is modeling. The validation errors are added to the panel at the bottom of Camunda Hub. Expand the panel to view the errors by clicking the **Problems** header. The panel is collapsed by default and the latest state (expanded or collapsed) is remembered for the next time you open Camunda Hub.

**Note**
An error is shown if any process ID, decision ID, or form ID exceeds the supported length for the target environment. To avoid backend-specific deployment problems, keep those IDs short and consistent with the limits of the cluster you plan to deploy to.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/modeling/fix-problems-in-your-diagram
