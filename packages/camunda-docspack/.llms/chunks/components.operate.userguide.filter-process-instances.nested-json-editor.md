# Filter process instances — Nested JSON editor

For complex variable values (JSON objects), use the JSON editor to construct filters precisely.

### How to use the JSON editor

1. In the **Variable Filters** modal, click on a condition row.
2. In the modal, toggle the **JSON** tab to switch from **Fields** view to **JSON** view.
3. The JSON editor shows the filter structure (or paste valid JSON).
4. Use the **maximize** icon to open the editor in a focused modal for complex values. The parent modal dims for focus, and the JSON editor displays a contextual title indicating which variable/row is being edited.
5. Toggle back to **Fields** to confirm the transformation, or edit directly in JSON. Changes transform losslessly between Fields and JSON views.

The JSON structure mirrors the Camunda API filter schema, so you can share or reuse complex filters with teammates. The round-trip between Fields and JSON is lossless — no data is lost in translation.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances
