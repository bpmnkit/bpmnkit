| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors | connect skip right | connect ms | connect out tok | connect neurons | connect problems | connect questions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/zai-org/glm-4.7-flash | 65/65 | 205 | 626 | 824 | 533 | 38 | 0 | 4.9 | 58/65 | 0.5 | 0.4 | 0.0 | 62/65 | 1565 | 83 | 9.0 | 4.4 | 1.4 |

| case | @cf/zai-org/glm-4.7-flash |
|---|---|
| 10-email-connector-order-confirmation | 5/5 |
| 16-github-issues-to-slack | 5/5 |
| 17-stripe-refund-rest | 4/5 |
| 18-sendgrid-confirmation | 5/5 |
| 19-kafka-publish | 5/5 |
| 20-openai-summarise | 5/5 |
| 21-sheets-and-teams | 3/5 |
| 22-internal-api | 5/5 |
| 23-webhook-rest-teams | 4/5 |
| 24-lambda-then-sqs | 5/5 |
| 25-no-integration | 4/5 |
| 26-notion-page-rest | 5/5 |
| 27-github-workflow-runs | 3/5 |

Medians except neurons, problems, fixes, lint errors, kept, added and removed (means).
Reasoning tokens are estimated from characters when the model does not report them.
