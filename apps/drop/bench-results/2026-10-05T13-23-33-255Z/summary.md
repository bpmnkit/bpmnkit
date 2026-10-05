| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors | drafts with gaps | completions kept | check ms | connect skip right | connect ms | connect out tok | connect neurons | connect problems | connect questions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/zai-org/glm-4.7-flash | 72/72 | 292 | 914 | 1948 | 604 | 62 | 0 | 6.4 | 61/72 | 1.7 | 1.9 | 0.1 | 24/72 | 18/24 | 2148 | 60/72 | 2957 | 111 | 10.5 | 3.4 | 1.6 |

| case | @cf/zai-org/glm-4.7-flash |
|---|---|
| 01-slack-notify-ops | 3/3 |
| 02-multi-branch-approval | 3/3 |
| 05-message-correlated-payment | 3/3 |
| 06-multi-instance-email-notify | 2/3 |
| 07-error-boundary-payment-refund | 3/3 |
| 08-long-process-onboarding | 2/3 |
| 10-email-connector-order-confirmation | 2/3 |
| 11-http-connector-external-api | 3/3 |
| 12-business-rule-credit-check | 2/3 |
| 13-parallel-gateway-fulfillment | 1/3 |
| 14-user-task-candidate-groups | 2/3 |
| 15-timer-boundary-retry | 2/3 |
| 16-github-issues-to-slack | 2/3 |
| 17-stripe-refund-rest | 3/3 |
| 18-sendgrid-confirmation | 3/3 |
| 19-kafka-publish | 3/3 |
| 20-openai-summarise | 3/3 |
| 21-sheets-and-teams | 3/3 |
| 22-internal-api | 3/3 |
| 23-webhook-rest-teams | 3/3 |
| 24-lambda-then-sqs | 2/3 |
| 25-no-integration | 3/3 |
| 26-notion-page-rest | 3/3 |
| 27-github-workflow-runs | 2/3 |

Medians except neurons, problems, fixes, lint errors, kept, added and removed (means).
Reasoning tokens are estimated from characters when the model does not report them.
