| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors | drafts with gaps | completions kept | check ms | connect skip right | connect ms | connect out tok | connect neurons | connect problems | connect questions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/zai-org/glm-4.7-flash | 119/120 | 336 | 1101 | 2004 | 604 | 68 | 0 | 6.6 | 99/119 | 2.0 | 1.5 | 0.1 | 29/119 | 18/29 | 2318 | 97/119 | 3028 | 114 | 10.8 | 3.3 | 1.2 |

| case | @cf/zai-org/glm-4.7-flash |
|---|---|
| 01-slack-notify-ops | 5/5 |
| 02-multi-branch-approval | 4/5 |
| 05-message-correlated-payment | 5/5 |
| 06-multi-instance-email-notify | 4/5 |
| 07-error-boundary-payment-refund | 4/5 |
| 08-long-process-onboarding | 2/5 |
| 10-email-connector-order-confirmation | 4/5 |
| 11-http-connector-external-api | 4/5 |
| 12-business-rule-credit-check | 5/5 |
| 13-parallel-gateway-fulfillment | 2/5 |
| 14-user-task-candidate-groups | 4/5 |
| 15-timer-boundary-retry | 4/5 |
| 16-github-issues-to-slack | 5/5 |
| 17-stripe-refund-rest | 4/5 |
| 18-sendgrid-confirmation | 4/5 |
| 19-kafka-publish | 4/5 |
| 20-openai-summarise | 5/5 |
| 21-sheets-and-teams | 5/5 |
| 22-internal-api | 5/5 |
| 23-webhook-rest-teams | 5/5 |
| 24-lambda-then-sqs | 5/5 |
| 25-no-integration | 5/5 |
| 26-notion-page-rest | 4/5 |
| 27-github-workflow-runs | 1/5 |

Medians except neurons, problems, fixes, lint errors, kept, added and removed (means).
Reasoning tokens are estimated from characters when the model does not report them.
