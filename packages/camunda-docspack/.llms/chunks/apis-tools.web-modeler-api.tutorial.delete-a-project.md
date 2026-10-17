# Tutorial — Delete a project

To delete a project, take the following steps:

1. Outline your function, similar to the steps above:

```javascript
async function deleteProject([projectId]) {
  const accessToken = await getAccessToken(authorizationConfiguration);
  const modelerApiUrl = process.env.MODELER_BASE_URL;
  const url = `${modelerApiUrl}/projects/${projectId}`;
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
  const response = await axios(options);

  if (response.status === 204) {
    console.log(`Project ${projectId} was deleted!`);
  } else {
    console.error("Unable to delete project!");
  }
} catch (error) {
  console.error(error.message);
}
```

4. In your terminal, run `npm run cli modeler delete <project ID>`, where `<project ID>` is the ID output by the command to create a project.

---
Source: https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/tutorial
