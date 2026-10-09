# Integrate API data — Load data on runtime with form events

**Info**
Workaround

Currently, there is no built-in way to update a form's context data on runtime. However, a workaround exists.

To load and update data on runtime (e.g. when searching in a searchable select box, or entering a query in a text field), follow these steps:

1. Listen to the `changed`, `formField.blur`, or `formField.search` event.
2. Gather the current form state from the `changed` event, or call the `submit` function to retrieve the data.
3. Find the query term in the changed state that is relevant for your API calls.
4. Run your API call, e.g. fetch records based on the query term.
5. Re-import the form schema but with the updated data (the current form state you obtained earlier, merged with the API results).

Don't forget to block the UI, e.g. using a loading spinner.

---
Source: https://docs.camunda.io/docs/next/apis-tools/frontend-development/03-forms/03-customize-and-extend/03-integrate-api-data
