| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors | connect skip right | connect ms | connect out tok | connect neurons | connect problems | connect questions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/zai-org/glm-4.7-flash | 36/36 | 248 | 673 | 1361 | 504 | 58 | 0 | 5.3 | 27/36 | 0.9 | 0.9 | 0.2 | 34/36 | 2111 | 105 | 9.8 | 3.3 | 1.5 |

| case | @cf/zai-org/glm-4.7-flash |
|---|---|
| 16-github-issues-to-slack | 3/3 |
| 17-stripe-refund-rest | 0/3 |
| 18-sendgrid-confirmation | 3/3 |
| 19-kafka-publish | 3/3 |
| 20-openai-summarise | 1/3 |
| 21-sheets-and-teams | 2/3 |
| 22-internal-api | 3/3 |
| 23-webhook-rest-teams | 3/3 |
| 24-lambda-then-sqs | 1/3 |
| 25-no-integration | 3/3 |
| 26-notion-page-rest | 2/3 |
| 27-github-workflow-runs | 3/3 |

Medians except neurons, problems, fixes, lint errors, kept, added and removed (means).
Reasoning tokens are estimated from characters when the model does not report them.
