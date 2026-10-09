# Filter process instances — Smart value transformations

The filter automatically transforms entered values based on context:

| You enter    | Operator  | Interpreted as           | Behavior                                |
| ------------ | --------- | ------------------------ | --------------------------------------- |
| `hello`      | equals    | String `"hello"`         | Exact match on the string (with quotes) |
| `42`         | equals    | Number `42`              | Exact match on numeric value            |
| `true`       | equals    | Boolean `true`           | Exact match on boolean                  |
| `null`       | equals    | Null                     | Exact match on null value               |
| `val1, val2` | is one of | Array `["val1", "val2"]` | Match either value                      |
| `{"x":1}`    | equals    | Object `{"x":1}`         | Exact match on the JSON object          |

### Edge cases

- **Leading zeros** (for example, `01234`) are preserved as strings, not converted to numbers.
- **Comma-separated values** split into a list only with the **is one of** operator; otherwise, commas are treated as literal characters. To include a literal comma, wrap the value in quotes.
- **Null vs. "null"**: The exact string `null` (no quotes) is treated as null; the string `"null"` (with quotes) is treated as a text string.
- **Contains operator**: Does NOT transform values; it searches for the literal substring you entered.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances
