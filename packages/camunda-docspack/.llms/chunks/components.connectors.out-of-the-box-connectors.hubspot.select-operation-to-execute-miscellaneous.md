# HubSpot connector — Select operation to execute — Miscellaneous

#### Submit form

- **Portal ID:** The HubSpot account that the form belongs to. [Learn more](https://knowledge.hubspot.com/account-management/manage-multiple-hubspot-accounts#check-your-current-account)
- **Form ID:** The unique ID of the form you are sending data to. [Learn more](https://knowledge.hubspot.com/forms/find-your-form-guid)
- **Form fields:** The value of the input fields of the form. [Learn more](https://developers.hubspot.com/docs/reference/api/marketing/forms/v3-legacy)

#### Add element to list

- **List ID:** The ID of the list.
- **Object IDs:** The IDs of the objects to add to the list.

**Note**
Adding elements to a list may take a few seconds to be reflected in the HubSpot UI.

#### Enroll contact to workflow

- **Workflow ID:** The workflow ID. You can retrieve the ID by sending a request to the [get all workflows endpoint](https://developers.hubspot.com/docs/reference/api/automation/create-manage-workflows/v3#get-all-workflows).
- **Contact email:** The email of the contact to be enrolled to the workflow.

---
Source: https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/hubspot
