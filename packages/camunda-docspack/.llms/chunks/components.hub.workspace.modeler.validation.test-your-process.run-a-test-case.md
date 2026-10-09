# Test your process — Run a test case

![Process instance view during a test run](../img/test-instance.png)

Click the **Start test** button to start the test.

If you defined a test segment with an end boundary, the instance terminates automatically after the end element completes — elements after it are not activated and do not appear in the instance history.

The **Instance History** panel tracks the path taken throughout the diagram.

The **Variables** panel tracks the data collected. Global variables are shown by default. To view local variables, select the corresponding task or event. Variables can be edited or added here, and Test mode supports JSON format to represent complex data.

Test mode executes all logic of the process and its linked files, such as FEEL, forms, DMN tables, and outbound connectors.

Actions in Test mode can be initiated through Operate, Tasklist, or external APIs. For example, you can complete a user task via Tasklist, finish a service task using an external job worker, or cancel/modify your instance through Operate, with all changes reflected in Test mode.

In SaaS, view your process instance in Operate by selecting the **Process Instance Key** in the header.

![Viewing a process instance in Operate from Test mode](../img/test-view-process-instance.png)

You have a few options to mock an external system:

- In **Implement** mode, hard-code an example payload in the task or event's **Example data** section in the properties panel on the right side of the screen.
- When completing a task or event, use the secondary action to complete it with variables.
- When filling forms or setting variables from Test mode, you can also save the variables to the BPMN file as example data to reuse them in future sessions.
- Use service task placeholders instead of connectors

Test mode automatically uses example data from the BPMN file for many events and task types.
If you want to use different data, you can override the example data by opening the secondary action menu on an element.
The new data set will take precedent over the example data from the BPMN file for future Test mode sessions.

Incidents are raised in Test mode just like in Operate. Use the variables and incident messages to debug the process instance.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
