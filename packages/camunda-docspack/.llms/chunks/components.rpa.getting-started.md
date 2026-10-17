# Get started with RPA

Learn how to create, test, and automate RPA scripts.

Use the RPA worker and either Camunda Hub or Desktop Modeler to create, test, and automate RPA scripts.


## About the RPA worker

The RPA worker is available on all major platforms (Windows, Linux, and macOS). This lets you automate applications on their native platforms, which is typically Windows. For console applications or browser automation, you can use a lightweight distribution such as this [Docker image](https://docs.camunda.io/docs/next/self-managed/deployment/docker).


## Create your first script

Get started with RPA by creating your first RPA script. With Camunda Hub and Desktop Modeler, you can edit and test your scripts.

You can get started developing and testing your scripts locally without a Camunda connection using [Desktop Modeler](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/index) if you already have a Camunda instance available.

### Using Desktop Modeler

1. **Download Desktop Modeler**: [Download the latest version of Desktop Modeler](https://camunda.com/download/modeler/).
2. **Open the RPA script editor**: Open Desktop Modeler and navigate to the RPA script editor under **Testing**. If you don't see the bottom panel, click **Window > Toggle Bottom Panel**.
   

3. **Write your RPA script using Robot Framework**: Use the editor to create your first RPA script. Scripts use the [Robot Framework](https://robotframework.org/) syntax.

#### Test your script

Once you have written your script, you can test it on a local RPA worker.

1. **Start the RPA worker**:
   1. Download the latest version of the [RPA worker](https://github.com/camunda/rpa-worker/releases).
   2. Unpack the `rpa-worker_*.zip` file. The zip archive contains the worker executable and an example configuration file.
   3. Start the worker by running the executable.

2. **Check Desktop Modeler**: Ensure the RPA worker is connected to Desktop Modeler. The worker should automatically connect. If not, click on the connection status to display additional configuration options.

3. **Test the script**:
   1. Click the test tube (🧪) icon in the footer of Desktop Modeler to open the run dialog. Add any variables required by the process in JSON format. Once you start the execution, the execution tab will open.
   2. Review the execution log and the variables created during the script execution within Modeler.

      

### Using Camunda Hub

1. In Camunda Hub, open a workspace.
2. In the workspace, open a project.
3. Use the **Create new** menu, and select **RPA script**.
4. **Write your RPA script using Robot Framework**: Use the editor to create your first RPA script. Scripts use the [Robot Framework](https://robotframework.org/) syntax.
   
5. In a BPMN diagram, you'll now find your new RPA script in the **Append element** menu.

#### Test your script

Once you have written your script, you can test it on a local RPA worker.

1. **Start the RPA worker**:
   1. Download the latest version of the [RPA worker](https://github.com/camunda/rpa-worker/releases).
   2. Unpack the `rpa-worker_*.zip` file. The zip archive contains the worker executable and an example configuration file.
   3. Configure the RPA worker to connect to your Camunda instance.
   4. Start the worker by running the executable.

2. **Test the script**:
   1. Select the **Test** tab in the **Details** pane. Add any variables required by the process in JSON format. Once you start the execution, the **Results** section shows the execution output and variables.
   2. Review the execution log and the variables created during the script execution within Modeler.

---
Source: https://docs.camunda.io/docs/next/components/rpa/getting-started
