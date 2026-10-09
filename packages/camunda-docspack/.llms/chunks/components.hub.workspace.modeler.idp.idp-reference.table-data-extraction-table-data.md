# IDP reference — Table data extraction {#table-data}

IDP can extract table data using LLM foundation models to identify and structure tabular data based on your prompts.

### Default JSON extraction format

When extracting repeated elements from a document, the extraction defaults to JSON format unless instructed.

In this format:

- Table data is represented as an array of objects.
- Each object corresponds to a row.
- Column names are used as object keys, with values mapped accordingly.

#### Example JSON output

**Prompt:** "Extract a list of name and ages of patients on floor 1".

```json
[
  {
    "name": "Kaitlin Jones",
    "age": 41
  },
  {
    "name": "Thomas Hampton",
    "age": 57
  }
]
```

### CSV extraction

To extract table data in CSV format, specify this in the prompt. The output is then structured in a CSV-compatible format.

#### Example CSV output

**Prompt:** "Extract a list of name and ages of patients on floor 1 as CSV".

```csv
Name,Age
Kaitlin Jones,41
Thomas Hampton,57
```

### Customize table data extraction

You can further refine table extraction by:

- Explicitly specifying column headers.
- Defining delimiter preferences for CSV.
- Requesting additional context for ambiguous data.

---
Source: https://docs.camunda.io/docs/next/components/hub/workspace/modeler/idp/idp-reference
