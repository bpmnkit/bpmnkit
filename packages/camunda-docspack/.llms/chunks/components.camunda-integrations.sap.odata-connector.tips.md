# SAP OData connector — Tips

- Ensure the connection from the Cloud Foundry environment via the destination to the SAP systems works. Using the [Terminal in Business Application Studio](https://community.sap.com/t5/technology-blogs-by-sap/how-to-check-the-connectivity-to-your-backend-system-in-business/ba-p/13479832) is a quick way to verify this.
- Validate requests first in an API client before trying with the SAP OData connector in Modeler. Then, copy over to the element template fields. This saves time and reduces potential error.
- Any payload size less than or equal to 2.5 MB can be considered safe.

---
Source: https://docs.camunda.io/docs/next/components/camunda-integrations/sap/odata-connector
