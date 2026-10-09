# Connect to an existing Keycloak instance — Considerations

When connecting Management Identity to a shared realm, accurately determining what clients should and should not be displayed in the UI is not possible. Therefore, the clients in the realm you connect Management Identity to will be shown in the UI and can have their secrets viewed and updated. Users with access to Management Identity should be considered as having administrator-level access to the system.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/configuration/connect-to-an-existing-keycloak
