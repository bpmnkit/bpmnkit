| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors | connect skip right | connect ms | connect out tok | connect neurons | connect problems | connect questions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/zai-org/glm-4.7-flash | 36/36 | 198 | 452 | 813 | 518 | 38 | 0 | 5.1 | 28/36 | 1.1 | 0.6 | 0.1 | 35/36 | 1435 | 107 | 9.4 | 3.5 | 1.3 |

| case | @cf/zai-org/glm-4.7-flash |
|---|---|
| 16-github-issues-to-slack | 2/3 |
| 17-stripe-refund-rest | 2/3 |
| 18-sendgrid-confirmation | 3/3 |
| 19-kafka-publish | 3/3 |
| 20-openai-summarise | 2/3 |
| 21-sheets-and-teams | 2/3 |
| 22-internal-api | 3/3 |
| 23-webhook-rest-teams | 3/3 |
| 24-lambda-then-sqs | 2/3 |
| 25-no-integration | 3/3 |
| 26-notion-page-rest | 2/3 |
| 27-github-workflow-runs | 1/3 |

Medians except neurons, problems, fixes, lint errors, kept, added and removed (means).
Reasoning tokens are estimated from characters when the model does not report them.
