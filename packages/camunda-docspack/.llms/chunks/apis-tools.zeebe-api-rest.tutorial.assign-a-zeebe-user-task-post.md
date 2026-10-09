# Tutorial — Assign a Zeebe user task (POST)

**Note**
In this tutorial, you will capture a **Zeebe user task** ID to assign and unassign users in this API. Camunda 8.5 introduced this new [user task](https://docs.camunda.io/docs/next/components/modeler/bpmn/user-tasks/user-tasks) implementation type, and these Zeebe user tasks are different from job worker-based user tasks (which while still supported, are now deprecated with 8.6). See more details on task type differences in the [migrating to Zeebe user tasks documentation](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-user-tasks#task-type-differences).

First, let's script an API call to assign a Zeebe user task.

To do this, take the following steps:

1. In the file named `zeebe.js`, outline the authentication and authorization configuration in the first few lines. This will pull in your `.env` variables to obtain an access token before making any API calls:

```javascript
const authorizationConfiguration = {
  clientId: process.env.ZEEBE_CLIENT_ID,
  clientSecret: process.env.ZEEBE_CLIENT_SECRET,
  audience: process.env.ZEEBE_AUDIENCE,
};
```

2. Examine the function `async function assignUser([userTaskKey, assignee])` below this configuration. This is where you will script out your API call.
3. Within the function, you must first generate an access token for this request, so your function should now look like the following:

```javascript
async function assignUser([userTaskKey, assignee]) {
  const accessToken = await getAccessToken(authorizationConfiguration);
}
```

4. Using your generated client credentials from [prerequisites](#prerequisites), capture your Zeebe API URL beneath your call for an access token by defining `zeebeApiUrl`:

`const zeebeApiUrl = process.env.ZEEBE_BASE_URL`

5. On the next line, script the API endpoint to assign a Zeebe user task.:

```javascript
const url = `${ZeebeApiUrl}/user-tasks/${userTaskKey}/assignment`;
```

6. Configure your POST request to the appropriate endpoint, including an authorization header based on the previously acquired `accessToken`:

```javascript
const options = {
  method: "POST",
  url,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  data: {
    // The body contains information about the new assignment.
    assignee: assignee,
  },
};
```

7. Call the assign endpoint, process the results from the API call, and emit an error message from the server if necessary:

```javascript
try {
  // Call the assign endpoint.
  const response = await axios(options);

  // Process the results from the API call.
  if (response.status === 204) {
    console.log(`User task assigned to ${assignee}.`);
  } else {
    // Emit an unexpected error message.
    console.error("Unable to assign this user!");
  }
} catch (error) {
  // Emit an error from the server.
  console.error(error.message);
}
```

8. In your terminal, run `node cli.js zeebe assign <task id> <assignee@assignee.com>`, where `<task id>` is the Zeebe user task ID you've captured from Tasklist, and `<assignee@assignee.com>` is the assignee's email address. Include your own email address if you would like to see these results in your user interface.

**Note**
This `assign` command is connected to the `assignUser` function at the bottom of the `zeebe.js` file, and executed by the `cli.js` file. While we will assign and unassign users in this tutorial, you may add additional arguments depending on the API calls you would like to make.

If you have a valid user and task ID, the assignment will now output. If you have an invalid API name or action name, or no arguments provided, or improper/insufficient credentials configured, an error message will output as outlined in the `cli.js` file. If no action is provided, it will default to "assign" everywhere, except when unassigning a user.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api-rest/tutorial
