# RDBMS search APIs and result count behavior — Query performance guidance

To optimize query performance, use selective filters and pagination:

### 1. Use selective filters

Always filter by indexed columns to reduce the result set size. Indexed columns typically include:

- **Key fields**: Process definition key, instance ID, case instance ID
- **Date properties**: Creation date, completion date, update timestamp

**Good example** (efficient):

```
Filter: processDefinitionKey = "myProcess" AND createdDate >= 2024-01-01
Result size: < 100 items, fast COUNT(*)
```

**Poor example** (expensive):

```
Filter: category = "audit"
Result size: Potentially millions of items, expensive COUNT(*)
```

### 2. Avoid sorting large result sets

When the result set is much larger than the page size, sorting requires the database to read and order all matching rows, even if only 100 are returned.

**Good pattern**:

```
Filter by date range + key field → sort by creation date → paginate
```

**Avoid**:

```
No filter → sort by arbitrary field → paginate (requires reading entire table)
```

### 3. Prefer pagination over exact counts

Rather than requesting exact counts for large result sets:

- Use page size limits (e.g., 100 items per page)
- Check `hasMoreTotalItems` to determine if more results exist
- Continue paginating as needed

This avoids unnecessary COUNT(\*) operations on queries that may scan large portions of the table.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-search-and-result-limits
