# Test your process — Get started with Test mode — 3. Configure test case

Start and end elements for the segment are auto-selected. Some processes have no selectable end element — for example, when the process starts with a message or signal event, or has no end event — in which case the test run completes naturally. Click the edit icon to pick a different element.

#### Start boundary

The start boundary defaults to the process start event. To change it:

1. In the **Configure test case** step, click the start row.
2. Search for an element by name, or click an activatable element directly on the canvas. The selected element is highlighted with a **Start** label on the diagram.

Elements before the start boundary are not activated and do not appear in the instance history.

The same element type restrictions apply as for [**Add token** modifications](#modifications-limitations). Clicking a non-activatable element in picking mode has no effect.

**Publish message** and **Broadcast signal** elements don't support segment boundaries. If you select either as the start boundary, you can't select an end boundary, and the process runs until it reaches the end node naturally reached from that selected start event.

#### End boundary

The end boundary is optional and defaults to the first end event. Click **Start** without changing it to accept the default, or change it:

1. In the **Configure test case** step, click the end row.
2. Search for an element by name, or click an activatable element directly on the canvas. The selected element is highlighted with an **End** label on the diagram.
3. To clear the end boundary, click the **x** icon on the **End** label on the canvas, or search for the same element again and deselect it from the results.

When an end boundary is set, the process instance terminates after that element completes. Elements after it are not activated and do not appear in the instance history.

#### Canvas click interaction

Once both boundaries are set, clicking the canvas resets the start boundary and clears the end boundary. To change only one boundary, click its row in the panel first, then click the new element on the canvas.

Click the selected start event to configure how the process should start — the panel shows various options depending on its Start event type:

- **None start event**: A JSON editor pre-filled with example data from the BPMN definition. Click **Start** to begin the process with the current variables, or **Start with Form** if the start event has a linked form.
- **Message start event**: A **Message name** field pre-filled from the BPMN definition. Click the icon next to the field to open a **Configure Message** modal where you can set the correlation key, TTL, and message ID.
- **Signal start event**: A **Signal name** dropdown pre-filled with the signal from the BPMN definition.

To prefill example data, define it in the **Example data** section of the start event in **Implement** mode. See [data handling](https://docs.camunda.io/docs/next/components/modeler/data-handling) for details.

**Note**
Test mode will only consider the first executable process ID in the BPMN file.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
