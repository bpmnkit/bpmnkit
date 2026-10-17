# Tutorial — POST a client

To create a new client, you will follow similar steps as outlined in your [GET request] (#get-clientid) above:

1. Edit the `addClient` function, incorporate the access token, and add your settings in the `.env` file. Note that this function destructures the `clientName` as the first item in an array passed in.

```javascript
async function addClient([clientName]) {
  const accessToken = await getAccessToken(authorizationConfiguration);

  const administrationApiUrl = process.env.ADMINISTRATION_API_URL;
  const clusterId = process.env.CLUSTER_ID;
```

2. Adjust your API endpoint to add a new client to a cluster:

```javascript
const url = `${administrationApiUrl}/clusters/${clusterId}/clients`;
```

3. When configuring your API call, issue a POST request, and add a body containing information for the new client:

```javascript
const options = {
  method: "POST",
  url,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
  data: {
    clientName: clientName,
  },
};
```

4. Call the `add` endpoint and process the results from the API call:

```javascript
const response = await axios(options);
const newClient = response.data;
```

5. Emit the new client to output. While different from this example, you will likely want to capture the `clientSecret` property from the response, as this cannot be displayed again:

```javascript
console.log(
      `Client added! Name: ${newClient.name}. ID: ${newClient.clientId}.`
    );
  } catch (error) {
    // Emit an error from the server.
    console.error(error.message);
  }
```

6. In your terminal, run `npm run cli admin add <client name>`, where `<client name>` is where you can paste the name of your new client.

---
Source: https://docs.camunda.io/docs/next/apis-tools/administration-api/tutorial
