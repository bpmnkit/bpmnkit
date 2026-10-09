# Get started with RPA — Automate execution

Once you are happy with your script and have tested it locally, you can start automating it with Camunda.

### Link RPA task to BPMN

1. **Deploy the RPA file**:
   1. If you have not already, [set up client connection credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) in Camunda Hub.
   2. Assign the **RPA role** to the client in the [Orchestration Cluster Admin (formerly Orchestration Cluster Identity)](https://docs.camunda.io/docs/next/components/admin/role#assign-client-to-a-role).
   3. Deploy your RPA script file by clicking on the rocket (🚀) icon in Desktop Modeler or the **Deploy** button in Camunda Hub
   4. For Desktop Modeler, note the ID of your RPA script. You will need this in the next step.

2. **Add RPA to your process**:
   1. Open an existing BPMN file or create a new one.
   2. Add the RPA script to your process:
      - **Camunda Hub**: Search for the RPA script by name directly in the **Append element** menu. No script ID is required.
      - **Desktop Modeler**: Add a new task and change the type to **Run RPA Script**.
        

   3. **Desktop Modeler only**: Configure the task with the script ID from the previous step. Add any input mappings required for your script to work.
      

3. **Deploy and run the process**:
   1. Deploy the BPMN model with the configured RPA task by clicking on the rocket (🚀) icon in Desktop Modeler, or use the **Deploy** button in Camunda Hub.
   2. Start an instance of your process.

Once your RPA script and model are deployed, you can also use the **Test** functionality in Camunda Hub.

### Connect worker to Zeebe

The last step is to configure the RPA worker to pick up the jobs from Camunda.

1. **Create credentials for the worker**:
   1. Create the necessary worker [credentials](https://docs.camunda.io/docs/next/components/saas/clusters/manage-api-clients#create-a-client) in Camunda Hub. Give your new client the `Zeebe` and `Secrets` scopes.
   2. Add the generated credentials to your `application.properties` in the same directory as your RPA worker executable.

2. **Restart the worker**: If your worker is still running, restart it to apply the new credentials. The RPA worker should now be connected and ready to execute scripts from Zeebe.

---
Source: https://docs.camunda.io/docs/next/components/rpa/getting-started
