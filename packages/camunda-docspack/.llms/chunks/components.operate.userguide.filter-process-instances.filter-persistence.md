# Filter process instances — Filter persistence

Filter conditions persist while you remain on the **Processes** page. If you:

- **Refresh the page**: Filters are preserved for the current session.
- **Navigate away and return**: Filters are cleared.
- **Click the reset icon**: All filters are removed.

**Note**
Filter state is stored locally in your browser session; it cannot be shared via URL or exported.


## Common workflows

### Find instances with missing variables

Use the **does not exist** operator to locate instances missing a critical variable:

1. Click **Add/Edit conditions**.
2. Enter the variable name (for example, `customerId`).
3. Select **does not exist**.
4. Click **Apply**.

### Find instances matching multiple status values

Use the **is one of** operator:

1. Enter variable name: `status`
2. Select **is one of**
3. Enter values: `pending, processing, review` (comma-separated)
4. Click **Apply**

### Find instances by numeric or date values

Enter the value as you would compare it (for example, `42` for numbers, `2024-01-15` for dates):

1. Enter variable name: `amount` or `createdDate`
2. Select **equals** or **contains**
3. Enter the value
4. Click **Apply**

**Note**
Numeric comparison operators are not supported. Use **equals** or **contains** as alternatives.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances
