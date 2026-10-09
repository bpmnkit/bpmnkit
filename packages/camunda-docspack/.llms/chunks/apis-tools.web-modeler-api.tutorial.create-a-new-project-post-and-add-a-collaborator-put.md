# Tutorial — Create a new project (POST) and add a collaborator (PUT)

First, let's script an API call to create a new project.

To do this, take the following steps:

1. In the file named `modeler.js`, outline the authentication and authorization configuration in the first few lines. This will pull in your `.env` variables to obtain an access token before making any API calls:

```javascript
const authorizationConfiguration = {
  clientId: process.env.MODELER_CLIENT_ID,
  clientSecret: process.env.MODELER_CLIENT_SECRET,
  audience: process.env.MODELER_AUDIENCE,
};
```

2. Examine the function `async function createProject([projectName, adminEmail])` below this configuration. This is where you will script out your API call, defining a project name and the project administrator's email.
3. Within the function, you must first generate an access token for this request, so your function should now look like the following:

```javascript
async function createProject([projectName, adminEmail]) {
  const accessToken = await getAccessToken(authorizationConfiguration);
}
```

4. Using your generated client credentials from [prerequisites](#prerequisites), capture your Web Modeler base URL beneath your call for an access token by defining `modelerApiUrl`:

```javascript
const modelerApiUrl = process.env.MODELER_BASE_URL;
```

5. On the next line, script the API endpoint to create your project:

```javascript
const projectUrl = `${modelerApiUrl}/projects`;
```

6. Configure your POST request to the appropriate endpoint, including an authorization header based on the previously acquired `accessToken`. You will also add a body to outline information about the new project:

```javascript
const projectOptions = {
  method: "POST",
  url: projectUrl,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  data: {
    name: projectName,
  },
};
```

7. Call the add project endpoint and capture the data for the new project:

```javascript
  try {
    const response = await axios(projectOptions);

    const newProject = response.data;

    console.log(
      `Project added! Name: ${newProject.name}. ID: ${newProject.id}.`
    );
```

8. Next, we'll add a collaborator to the project you just created. After calling the add project endpoint, add an endpoint to add a collaborator to the project:

```javascript
const collaboratorUrl = `${modelerApiUrl}/collaborators`;
```

9. Configure the API call, including a body with information about the project and the new collaborator:

```javascript
    const collaboratorOptions = {
      method: "PUT",
      url: collaboratorUrl,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      data: {
        email: adminEmail,
        projectId: newProject.id,
        role: "project_admin"
      }
```

10. Call the add collaborator endpoint and process the results:

```javascript
 const collaboratorResponse = await axios(collaboratorOptions);

    if (collaboratorResponse.status === 204) {
      console.log(`Collaborator added! Email: ${adminEmail}.`);
    } else {
      console.error("Unable to add collaborator!");
    }
  } catch (error) {
    // Emit an error from the server.
    console.error(error.message);
  }
```

11. In your terminal, run `npm run cli modeler create` to create your project.

**Note**
This `create` command is connected to the `createProject` function at the bottom of the `modeler.js` file, and executed by the `cli.js` file. While we create a project in this tutorial, you may add additional arguments depending on the API calls you would like to make.

---
Source: https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/tutorial
