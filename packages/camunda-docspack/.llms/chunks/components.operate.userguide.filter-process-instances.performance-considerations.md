# Filter process instances — Performance considerations

Each variable condition adds filtering overhead. At **8+ conditions**, the filter interface displays an informational warning below the list of conditions: _"Filtering by many conditions can be slow. Add conditions only if you need them."_

This warning appears once per session and is informational only — you can add more conditions if needed, but be aware of potential performance impact on large process instance lists.

### Best practices

- Start with fewer conditions and add more if needed.
- Use **exists** / **does not exist** to check for variable presence before filtering on value.
- Combine with other filters (Process Name, Finished Instances) to reduce the initial instance list.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances
