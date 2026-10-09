# Get familiar with Operate — Navigate to a called process instance

When a call activity in the diagram calls another process, double-click the call activity element to jump directly to the called process instance.

Double-click navigation only works when the process instance has called exactly one process instance in total. If it has called more than one — for example, through multiple call activities, or a call activity that ran more than once — double-clicking does nothing.

For a reliable way to find a called process instance, take the following steps:

1. Click the call activity element to select it.
2. Open the **Details** tab.
3. In the row labeled **Called Process Instance**, click the link — shown as the called process's name and instance key — to navigate to that instance.

If the call activity has called more than one process instance, the **Details** tab shows a **View all** link instead of a single link. This link filters the **Processes** page by the whole process instance, so it shows every instance it has called, including from other call activities — not only the one you selected.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/basic-operate-navigation
