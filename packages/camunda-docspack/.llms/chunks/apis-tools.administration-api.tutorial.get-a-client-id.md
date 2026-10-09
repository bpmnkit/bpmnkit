# Tutorial — GET a client ID

To get a client ID, take the following steps:

1. Outline your function, similar to the steps above:

```javascript
async function viewClient([clientId]) {
  const accessToken = await getAccessToken(authorizationConfiguration);

  const administrationApiUrl = process.env.ADMINISTRATION_API_URL;
  const clusterId = process.env.CLUSTER_ID;
```

2. Write the API endpoint to view a single client within a cluster:

```javascript
const url = `${administrationApiUrl}/clusters/${clusterId}/clients/${clientId}`;
```

3. Call the client endpoint using a GET method:

```javascript
var options = {
  method: "GET",
  url,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
};
```

4. Process your results from the API call and emit the client details:

```javascript
try {
  const response = await axios(options);

  const clientResponse = response.data;

  console.log("Client:", clientResponse);
} catch (error) {
  console.error(error.message);
}
```

5. In your terminal, run `npm run cli admin view` to view your client.

---
Source: https://docs.camunda.io/docs/next/apis-tools/administration-api/tutorial
