# Data handling — Inspecting variables

The **Variables** panel helps you explore the variables in your process. Use it to understand which variables are visible in a given scope, where they are written, and what values they hold.

1. Open a BPMN diagram in Camunda Hub or Desktop Modeler.
2. On the right side of the modeling interface, open the **Variables** panel.

**Tip**
If the **Variables** panel is hidden in Desktop Modeler, click **Window > Toggle Variables Panel**.

### Selecting elements

The list of variables shown in the panel depends on the element or elements you have selected on the canvas. When you select one or more elements, the panel displays all variables in the scope of those elements, including variables from parent scopes (for example, a sub-process scope or the process scope).

If no element is selected, the panel shows variables at the process level.

### Filtering variables

Use the search bar at the top of the panel to filter the displayed list of variables by name.

To show only the variables written by the selected elements, enable the **Written by selection** toggle.

### Variable details

Expand a variable to see its details:

- **Written by** — lists all elements in the diagram that write to this variable.
- **Value** — shows the value of the variable, if it can be determined from the diagram.

---
Source: https://docs.camunda.io/docs/next/components/modeler/data-handling
