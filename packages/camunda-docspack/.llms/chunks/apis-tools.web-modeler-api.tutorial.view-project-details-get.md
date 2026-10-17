# Tutorial — View project details (GET)

To view project details, take the following steps:

1. Outline your function, similar to the steps above:

```javascript
async function viewProject([projectId]) {
  const accessToken = await getAccessToken(authorizationConfiguration);
  const modelerApiUrl = process.env.MODELER_BASE_URL;
  const url = `${modelerApiUrl}/projects/${projectId}`;
}
```

2. Configure the API call using the GET method:

```javascript
const options = {
  method: "GET",
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
  const project = response.data;

  console.log("Project:", project);
} catch (error) {
  console.error(error.message);
}
```

4. In your terminal, run `npm run cli modeler view <project ID>`, where `<project ID>` is the ID output by the command to create a project.

---
Source: https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/tutorial
