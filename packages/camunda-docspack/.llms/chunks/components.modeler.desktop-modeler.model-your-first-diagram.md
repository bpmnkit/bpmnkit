# Model your first diagram

Learn how to model your first diagram using Desktop Modeler and BPMN.

After starting [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index), you can model your first BPMN diagram. Follow the steps below:

1. Create a [BPMN](https://docs.camunda.io/docs/next/components/modeler/bpmn/bpmn) diagram by selecting **BPMN diagram**:

![empty application](./img/empty.png)

The BPMN diagram opens with a start event. [Events](https://docs.camunda.io/docs/next/components/modeler/bpmn/events) in BPMN represent things that happen. A process can react to events and emit events, for example:

![new diagram](./img/new-diagram.png)

1. The basic elements of BPMN processes are [tasks](https://docs.camunda.io/docs/next/components/modeler/bpmn/tasks), or atomic units of work composed to create a meaningful result. Click on the start event and select the rectangular task element. This creates a task directly following the start event, connected by an arrow. Next, double-click the task and type in a name for the element. For example, `My Service Task`.

1. Click on the task and select the dark circle in the top left. This attaches an end event directly to the task. On the left side of the screen you will find the element palette, where you can also drag and drop elements onto the canvas.

![elements](./img/elements.png)

Above, you can see that elements that support different types can be reconfigured by clicking on the corresponding icon. In this case, the task can be converted to a [service task](https://docs.camunda.io/docs/next/components/modeler/bpmn/service-tasks/service-tasks), for example, by clicking on the element and selecting the **Change element** menu icon.

![task configuration](img/element-configuration.png)

You can also [orchestrate human tasks](https://docs.camunda.io/docs/next/guides/getting-started-orchestrate-human-tasks). Review the [complete list of supported BPMN elements](https://docs.camunda.io/docs/next/components/modeler/bpmn/bpmn-coverage)

1. Open the properties panel by selecting the light gray arrow on the right side of the page halfway down the canvas. Here, you can edit the properties of the currently selected element:

![properties panel](img/properties-panel.png)

For example, you might name your element and give it an ID under the **General** section.

1. Save the diagram using **File > Save**, **File > Save As**, or the keyboard shortcut (`Cmd + S` on macOS or `Ctrl + S` on Windows and Linux). Desktop Modeler saves the file to the location you choose on your local file system; it does not store diagrams in a separate internal workspace. To find the file again, reopen it from that folder or from the recent files list on the Desktop Modeler start screen.

1. Once you finish modeling and configuring your diagram, you can deploy it to [Camunda](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/connect-to-camunda-8).

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/model-your-first-diagram
