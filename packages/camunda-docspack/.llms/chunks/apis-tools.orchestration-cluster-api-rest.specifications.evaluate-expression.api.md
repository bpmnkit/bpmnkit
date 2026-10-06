# Evaluate an expression

`POST /expression/evaluation`

Evaluates a FEEL expression and returns the result. Supports references to tenant scoped
cluster variables when a tenant ID is provided. Optionally, provide a `scopeKey` to make the
variables of a specific process instance or element instance visible while evaluating the
expression.

- Required permissions: EVALUATE on EXPRESSION.
- Added in Camunda 8.9.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Request body:
  application/json: ExpressionEvaluationRequest (required)
    expression (string, required) — The expression to evaluate (e.g., "=x + y")
    tenantId (string) — Required when the expression references tenant-scoped cluster variables
    scopeKey (ScopeKey) — Key of the process instance or element instance whose variables should be made visible to the expression. Use a process instance key to evaluate against the…
    variables (object) — Optional variables for expression evaluation. These variables are only used for the current evaluation and do not persist beyond it.

Responses:
  200 ExpressionEvaluationResult — Expression evaluated successfully
  400 ProblemDetail — The provided data is not valid.
  401 ProblemDetail — The request lacks valid authentication credentials.
  403 ProblemDetail — Forbidden. The request is not allowed.
  500 ProblemDetail — An internal error occurred while processing the request.

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/evaluate-expression.api
