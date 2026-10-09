# Asana connector — Authentication

In the **Authentication** section, provide a **Personal access token**. [Read more on how to obtain it](https://developers.asana.com/docs/personal-access-token).


## Select operation to execute

### Tasks

#### Get tasks from a project

- **Asana API:** [Get tasks from a project](https://developers.asana.com/reference/gettasksforproject).
- **Project ID:** Globally unique identifier for the project.

#### Get a task by ID

- **Asana API:** [Get a task](https://developers.asana.com/reference/gettask).
- **Task ID:** The task to operate on.

#### Create a task

- **Asana API:** [Create a task](https://developers.asana.com/reference/createtask).
- **Task name:** The name of the task.
- **Project ID:** Globally unique identifier for the project.
- **Parent task ID:** Globally unique identifier for the parent task.
- **Notes:** Free-form textual information associated with the task (i.e. its description).

#### Delete a task

- **Asana API:** [Delete a task](https://developers.asana.com/reference/deletetask).
- **Task ID:** The task to operate on.

### Projects

#### Get projects

- **Asana API:** [Get multiple projects](https://developers.asana.com/reference/getprojects).
- **Workspace ID:** The workspace or organization to filter projects on.
- **Team ID:** The team to filter projects on.

#### Get a project by ID

- **Asana API:** [Get a project](https://developers.asana.com/reference/getproject).
- **Project ID:** Globally unique identifier for the project.

#### Create a project in a workspace

- **Asana API:** [Create a project in a workspace](https://developers.asana.com/reference/createprojectforworkspace).
- **Workspace ID:** Globally unique identifier for the workspace or organization.
- **Project name:** Name of the project. This is generally a short sentence fragment that fits on a line in the UI for maximum readability. However, it can be longer.
- **Project note:** Free-form textual information associated with the project (ie., its description).

#### Delete a project

- **Asana API:** [Delete a project](https://developers.asana.com/reference/deleteproject).
- **Project ID:** Globally unique identifier for the project.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/asana
