# Process applications — Editor support for process applications

When you open a file in Modeler, the system implicitly determines whether it belongs to a process application. It does so by checking for the presence of a `.process-application` file in the same folder or a parent folder. Within a process application, Modeler offers improved navigation and assistance.

### Indicating context

Process applications are opened and closed "implicitly": A blue item in the status bar indicates whether a diagram belongs to a process application and makes all related diagrams available for navigation.

When files from more than one process application are open, they are grouped visually.

### Creating a process application

Create a process application by creating a `.process-application` file in the root of your project. Alternatively, create it via Modeler UI by taking the following steps:

1. Click **File > New Process Application...**.
2. Choose a folder.
3. Click **Select folder**.

A `.process-application` file will be created in the selected folder, and the folder will now be recognized by Modeler as the applications project root. Any file within the folder or its subfolders will be treated as part of the process application.

### Linking resources

Any file within a process application can be linked as a resource. Linking a resource can be achieved in several ways:

- Using the append feature
- Using the replace feature
- Using the create feature
- Manually by setting the process, decision, or form ID in the properties panel

### Deploying a process application

Process applications can be deployed using the [deploy feature](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/deploy-diagram). When deploying a process application, all files that are part of the process application will be deployed.

### Starting a process instance

**Note**
Before starting a process instance, all process application files will be deployed to reflect the state of the process application.

You can start an instance for any process in a process application using the [start instance feature](https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/start-instance).

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/process-applications
