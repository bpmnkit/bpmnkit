# Clients — Manage clients in SaaS

In Camunda 8 SaaS, client credentials are created and managed in [Camunda Hub](https://docs.camunda.io/docs/next/components/hub/index).

### Step 1: Create client credentials in Camunda Hub

Follow the [guide for creating client credentials in Camunda Hub](https://docs.camunda.io/docs/next/components/hub/organization/manage-clusters/manage-api-clients#create-a-client).

Copy the **client id** shown in the variables after you have created your client as this is required in the next step.

### Step 2: Configure authorizations in Admin

If you have enabled [authorizations](https://docs.camunda.io/docs/next/components/concepts/access-control/authorizations) on your cluster, the new client has no permissions by default, even after assigning scopes in Camunda Hub. You must grant fine-grained permissions in Admin:

1.  Open the **Admin** application for your cluster.
2.  Open the **Authorizations** tab.
3.  Click **Create authorization**.
4.  Set the **Owner type** to `Client`.
5.  In the **Owner ID** field, enter the **Client ID** of the client you just created and copied.
6.  Select the **Resource type**, **Resource ID**, and permissions the client needs.
7.  Click **Create authorization**.

If authorizations are disabled, your client will have full access based on the scopes you selected during creation.

---
Source: https://docs.camunda.io/docs/next/components/admin/client
