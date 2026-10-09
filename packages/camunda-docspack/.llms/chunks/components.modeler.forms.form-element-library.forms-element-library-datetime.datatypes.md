# Datetime — Datatypes

Datetime components can be bound to data of the `string` type. The format of the string depends on the subtype:

- **date**: ISO 8601 string of the format `YYYY-MM-DD`.
- **datetime**: ISO 8601 string of the format `YYYY-MM-DDTHH:MM`. Note that leading zeroes must be present in the hour and minutes (e.g., 01:30 not 1:30); this is an ISO 8601 requirement.
- **time**: String of the format `HH:MM`. Leading zeros can be omitted.

---
Source: https://docs.camunda.io/docs/next/components/modeler/forms/form-element-library/forms-element-library-datetime
