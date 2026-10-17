# Setup & configuration — Configure ServiceNow

### Install the Camunda Spoke

1. Log in to ServiceNow as an administrator.
2. Navigate to **All → Application Manager**.
3. Search for **Camunda Spoke** and click **Install**.

### Verify installation

- **Spoke**: Confirm the "Camunda Spoke" menu appears in the Application Navigator.
- **Connection alias**: Go to **Connections & Credentials → Connection & Credential Aliases** and ensure the **Camunda alias** exists and is linked to the Camunda Spoke.

### Create an OAuth profile

1. Navigate to **System OAuth → Application Registry** and click **New**.
2. Select **Connect to a third-party OAuth Provider**.
3. Fill in the form:

| Field                  | Value                                        |
| :--------------------- | :------------------------------------------- |
| Name                   | `Camunda OAuth`                              |
| Client ID              | Paste Client ID from Camunda                 |
| Client Secret          | Paste Client Secret from Camunda             |
| OAuth API Script       | `OAuthCamundaUtil`                           |
| Default Grant Type     | `Client Credentials`                         |
| Token URL              | `https://login.cloud.camunda.io/oauth/token` |
| Refresh Token Lifespan | Default `8,640,000`                          |

4. Click **Submit**.

### Create a credential record

1. Navigate to **Connections & Credentials → Credentials** and click **New**.
2. Select **OAuth 2.0 Credentials**.
3. Fill in the form:

| Field                | Value                           |
| :------------------- | :------------------------------ |
| Name                 | `Camunda Connection`            |
| OAuth Entity Profile | `Camunda OAuth default_profile` |

4. Click **Submit**.

### Create a connection record and link to alias

1. Navigate to **Connections & Credentials → Connection & Credential Aliases** and open the **Camunda alias**.
2. In the **Connections** tab, click **New**.
3. Fill in the form:

| Field               | Value                                                              |
| :------------------ | :----------------------------------------------------------------- |
| Name                | `Camunda API Connection`                                           |
| Credential          | `Camunda Connection`                                               |
| Domain              | `Global`                                                           |
| Connection alias ID | `x_camun_camunda.Camunda`                                          |
| URL Builder         | Enabled                                                            |
| Host                | Camunda cluster Region ID (e.g., `lhr-1.api.camunda.io`)           |
| Protocol            | `https`                                                            |
| Base path           | Camunda Cluster ID (e.g., `/6b6b3969-a65c-4bdd-905e-c29102eebded`) |

4. Click **Submit**.

### Optional: Configure Flow Starter

To start ServiceNow flows from Camunda asynchronously, ensure the following:

- ServiceNow Integration Hub Enterprise Pack
- ServiceNow Integration Hub Flow Trigger – REST plugin

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/servicenow/setup-and-configuration
