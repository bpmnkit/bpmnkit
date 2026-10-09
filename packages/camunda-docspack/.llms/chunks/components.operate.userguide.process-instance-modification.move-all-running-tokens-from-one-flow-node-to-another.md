# Modify a process instance — Move all running tokens from one flow node to another

The move operation is equivalent to the combination of **Cancel** and **Add** modifications. The modifications described previously can also be achieved with one single move modification.

1. Select the flow node you want to move the running tokens from.
2. Click **Move instance**.
3. Select the flow node you want to move the running tokens to.

View the pending modification reflected in the **Instance History** panel.


## Add variable to new scopes

During the modification mode, if there are new scopes generated it will be possible to add variables to these new scopes by following these steps:

1. Select the new scope from the **Instance History** panel you want to add a variable to.
2. Click **Add Variable** from the **Variables** panel.
3. Fill out the **Name** and **Value** fields for the variable you want to add.
4. Once you blur out of the field (click anywhere on the screen other than the last edited variable field), assuming the fields have the valid values, the new variable will be added to the [pending modifications](#view-summary-of-pending-modifications).

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/process-instance-modification
