| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors | connect skip right | connect ms | connect out tok | connect neurons | connect problems | connect questions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/zai-org/glm-4.7-flash | 60/60 | 206 | 485 | 872 | 518 | 41 | 0 | 5.3 | 50/60 | 1.2 | 1.0 | 0.0 | 57/60 | 1765 | 105 | 10.1 | 3.9 | 1.1 |

| case | @cf/zai-org/glm-4.7-flash |
|---|---|
| 16-github-issues-to-slack | 5/5 |
| 17-stripe-refund-rest | 5/5 |
| 18-sendgrid-confirmation | 5/5 |
| 19-kafka-publish | 5/5 |
| 20-openai-summarise | 4/5 |
| 21-sheets-and-teams | 4/5 |
| 22-internal-api | 5/5 |
| 23-webhook-rest-teams | 3/5 |
| 24-lambda-then-sqs | 5/5 |
| 25-no-integration | 5/5 |
| 26-notion-page-rest | 3/5 |
| 27-github-workflow-runs | 1/5 |

Medians except neurons, problems, fixes, lint errors, kept, added and removed (means).
Reasoning tokens are estimated from characters when the model does not report them.
