# Tutorial — GET a list of existing clients

First, let's script an API call to list our existing clients.

To do this, take the following steps:

1. In the file named `administration.js`, outline the authentication and authorization configuration in the first few lines. This will pull in your `.env` variables to obtain an access token before making any API calls:

```javascript
const authorizationConfiguration = {
  clientId: process.env.ADMINISTRATION_CLIENT_ID,
  clientSecret: process.env.ADMINISTRATION_CLIENT_SECRET,
  audience: process.env.ADMINISTRATION_AUDIENCE,
};
```

2. Examine the function `async function listClients()` below this configuration. This is where you will script out your API call.
3. Within the function, you must first apply an access token for this request, so your function should now look like the following:

```javascript
async function listClients() {
  const accessToken = await getAccessToken(authorizationConfiguration);
}
```

4. As noted in the detailed API description in [Swagger](https://console.cloud.camunda.io/customer-api/openapi/docs/#/), you must call your Administration API URL and cluster ID. Using your generated client credentials from [prerequisites](#prerequisites), capture your Administration API URL and cluster ID beneath your call for an access token by defining `administrationApiUrl` and `clusterId`:

```javascript
const administrationApiUrl = process.env.ADMINISTRATION_API_URL;
const clusterId = process.env.CLUSTER_ID;
```

5. On the next line, script the API endpoint to list your existing clients for a particular cluster:

```javascript
const url = `${administrationApiUrl}/clusters/${clusterId}/clients`;
```

6. Configure your GET request to the appropriate endpoint, including an authorization header based on the previously acquired `accessToken`:

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

7. Call the clients' endpoint, process the results from the API call, emit the clients to output, and emit an error message from the server if necessary:

```javascript
try {
  // Call the clients endpoint.
  const response = await axios(options);

  // Process the results from the API call.
  const results = response.data;

  // Emit clients to output.
  results.forEach((x) => console.log(`Name: ${x.name}; ID: ${x.clientId}`));
} catch (error) {
  // Emit an error from the server.
  console.error(error.message);
}
```

8. In your terminal, run `npm run cli admin list` for a list of your existing clients.

**Note**
This `list` command is connected to the `listClients` function at the bottom of the `administration.js` file, and executed by the `cli.js` file. While we will view, create, and delete clients in this tutorial, you may add additional arguments depending on the API calls you would like to make.

If you have any existing clients, the `Name: {name}; ID: {Id}` will now output. If you have an invalid API name or action name, or no arguments provided, or improper/insufficient credentials configured, an error message will output as outlined in the `cli.js` file.

---
Source: https://docs.camunda.io/docs/next/apis-tools/administration-api/tutorial
