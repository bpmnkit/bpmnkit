# Filter process instances — Multi-variable filters

Combine multiple variable filters with AND logic to find instances matching complex criteria in one step.

**Example**: Find all pending EMEA orders over €10,000 by filtering:

- `status` equals `"pending"` **AND**
- `region` equals `"EMEA"` **AND**
- `amount` equals `10000`

### How to add multi-variable filters

1. In the **Filter** panel, under **Variable Filters**, click the **Add/Edit conditions** button in the sidebar.
2. The **Variable Filters** modal opens.
3. Click **Add condition** to add the first variable filter.
4. Enter the **Variable name** (free text).
5. Select an **Operator** from the dropdown.
6. Enter the **Value** for comparison.
7. Click **Add condition** again to add more filters. AND indicators appear between filter rows, showing that all conditions must match.
8. Click **Apply** to filter the instance list.

The sidebar displays a count of active variable filter conditions. Click **Add/Edit conditions** again to modify existing filters.

### Operators reference

| Operator           | Behavior                                                                  | Example                                             |
| ------------------ | ------------------------------------------------------------------------- | --------------------------------------------------- |
| **equals**         | Exact match on variable value (searches truncated value only)             | Find instances where `status = "pending"`           |
| **not equal**      | Value does not match (searches truncated value only)                      | Find instances where `status ≠ "error"`             |
| **contains**       | Case-sensitive substring match (searches truncated value only)            | Find order IDs containing `"2024"`                  |
| **is one of**      | Match any value in a comma-separated list (searches truncated value only) | Find instances where `priority` in `(high, urgent)` |
| **exists**         | Variable is present (any value)                                           | Find instances with a specific variable set         |
| **does not exist** | Variable is not present                                                   | Find instances missing a required variable          |

**Caution**
Value-based variable filters (`equals`, `not equal`, `is one of`, and `contains`) search only the first ~8,000 characters of a variable value. If a match exists beyond this boundary, it will not be returned.

In the Operate UI, the inline warning appears on **contains** only.

### AND logic

All conditions are combined with AND logic — an instance must match **all** conditions to appear in results. AND indicators between filter rows make this logical combination explicit. OR logic and nested conditions are not supported.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances
