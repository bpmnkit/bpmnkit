# Batch operations — Error handling and recovery

### Creation request validation

Before processing begins, the system performs several validation checks:

- **Empty filter validation**: Filters cannot be empty or null
- **Authorization validation**: User permissions are checked before operation creation
- **Command-specific validation**: Each command type has specific requirements (for example, migration plan validity)

Failed validations result in immediate rejection with specific error codes and messages (for example, `INVALID_ARGUMENT`, `NOT_AUTHORIZED`).

### Initialization failures

Initialization can fail for several reasons:

- **Network issues**: Connection problems with the secondary database
- **Permission errors**: Insufficient authorization to query the database
- **Configuration issues**: Secondary database not properly configured
- **Query errors**: Invalid or malformed filter criteria

**Error handling behavior:**

The system automatically handles initialization failures based on the error type:

- **Retryable errors**: Network issues, temporary database unavailability
  - Uses exponential backoff with configurable retry limits
  - Maximum delay and retry count can be configured
- **Non-retryable errors**: Permission issues, configuration problems
  - Fail immediately without retries
- **Adaptive sizing**: If record size limits are exceeded, page sizes are automatically reduced

### Execution failures

Individual items may fail during execution for various reasons:

- Process instance was completed or canceled after batch initialization
- Incident was already resolved by another operation
- Migration or modification plan is invalid for the specific instance
- Authorization insufficient for the specific process instance

The system marks failed items as `FAILED` and does not retry them within the same batch operation.

### Recovery strategies

- **Retry failed batches**: Create a new batch operation with the same filter
- **Partial recovery**: Use more specific filters to target only failed items
- **Monitoring**: Use provided APIs to track which items failed and why

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/batch-operations
