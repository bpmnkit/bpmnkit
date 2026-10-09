# Test your process — Re-test a process

To re-test a process, rewind to an earlier element by clicking on the **Rewind** button on a previously completed element.

**Note**
You can also return to the definition view by clicking **View all** on the top banner, or start a new process instance by clicking on the **Restart process** button on the start event.

### Rewind a process

After completing part of your process, you can **rewind** to a previous element to test a different path. Test mode will start a new instance and retest your actions up to, but not including, the selected previous task.

![Rewinding a process in Test mode](../img/test-rewind.png)

Test mode's rewind operation currently does not support the following elements:

- Call activities
- Timer events

#### Additional limitations

- If you completed an unsupported element before rewinding, you will rewind farther than expected.
- Test mode rewinds to an element, not to an element instance. For example, if you wanted to rewind your process to a sequential multi-instance service task which ran five times, it will rewind your process to the first instance of that service task.
- Test mode rewinds processes by initiating a new instance and executing each element. However, if any element behaves differently from the previous execution, such as a connector returning a different result, the rewind may fail.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/validation/test-your-process
