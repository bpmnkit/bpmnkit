# Mapping rules — Add a mapping rule

1. Log in to the Identity interface and navigate to the **Mappings** tab.

   ![mapping-rule-management-tab](./img/mapping-rule-management-tab.png)

1. Click the **Add mapping** button and select the type of mapping to create. You can create a mapping for a role or
   tenant.

   ![mapping-rule-add](./img/mapping-rule-add-mapping.png)

1. Fill in the fields for the mapping rule and click **Create**.

   ![mapping-rule-add-modal](./img/mapping-rule-add-mapping-modal.png)

**Note**

   The operator option is used to define how we evaluate the rules against your tokens. The options are:
   - **Contains**: Used for array-based claims, such as a list of roles.
   - **Equals**: Used for string-based claims, such as a string ID.

   The created mapping rule can be seen in the table.

   ![mapping-rule-refreshed-table](./img/mapping-rule-refreshed-table.png)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/management-identity/mapping-rules
