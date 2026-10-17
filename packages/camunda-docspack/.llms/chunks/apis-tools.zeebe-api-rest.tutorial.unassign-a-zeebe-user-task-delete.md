# Tutorial — Unassign a Zeebe user task (DELETE)

To unassign a user from a Zeebe user task, you can use the same Zeebe user task ID from the previous exercise and take the following steps:

1. Outline your function, similar to the steps above:

```javascript
async function unassignUser([userTaskKey]) {
  const accessToken = await getAccessToken(authorizationConfiguration);

  const ZeebeApiUrl = process.env.ZEEBE_BASE_URL;

  const url = `${ZeebeApiUrl}/user-tasks/${userTaskKey}/assignee`;
}
```

2. Configure the API call using the DELETE method:

```javascript
const options = {
  method: "DELETE",
  url,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
};
```

3. Process the results from the API call. For example:

```javascript
try {
  // Call the delete endpoint.
  const response = await axios(options);

  // Process the results from the API call.
  if (response.status === 204) {
    console.log("User task has been unassigned!");
  } else {
    // Emit an unexpected error message.
    console.error("Unable to unassign this user task!");
  }
} catch (error) {
  // Emit an error from the server.
  console.error(error.message);
}
```

4. In your terminal, run `node cli.js zeebe unassign <task id>`, where `<task id>` is the Zeebe user task ID.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api-rest/tutorial
