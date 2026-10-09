# Modeling with DMN — Literal expressions

![New DMN Literal Expression](assets/desktop-modeler-dmn/literal-expression.png)

You can also edit literal expressions. Just as with decision tables, in the decision requirement diagram view, click the blue icon to _drill-down_ into the literal expression view and start editing.


## Business knowledge models

**Caution**
Viewing the result of BKM evaluation is currently not supported in Operate.

A _business knowledge model_ (BKM) is a reusable function containing a piece of decision logic. Typically, a BKM instantiates business logic that is required in multiple decisions, such as a common computation. For example, an amortization formula might be used in different loan application processes.

You can make BKM elements executable using literal expressions written in FEEL, in almost the same way you would create a decision using a literal expression. A BKM literal expression can optionally accept parameters to be used as inputs to the FEEL expression, and it returns a single result whose name is the same as the BKM element name. Once you’ve created a BKM, it appears in autosuggestions when you’re using literal expressions to create decision logic.

Currently, you can only reuse BKMs within the same decision.

To create an executable BKM:

1. Add a BKM element to the canvas.
2. Name the BKM element. This name will be used for the result variable.
3. On the context menu, select **Change type > Literal expression**.
4. Click the blue literal expression icon (**{}**) on the BKM element.
5. Add parameters by hovering over the **()** and clicking the edit button. All changes to the BKM are saved automatically.
6. Enter a FEEL expression in the expression box.
7. Select a type for the result.

---
Source: https://docs.camunda.io/docs/next/components/modeler/dmn/dmn
