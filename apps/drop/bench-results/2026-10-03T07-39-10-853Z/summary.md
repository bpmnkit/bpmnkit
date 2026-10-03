| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors | connect skip right | connect ms | connect out tok | connect neurons | connect problems | connect questions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/openai/gpt-oss-120b | 36/36 | 239 | 2970 | 3461 | 564 | 454 | 393 | 61.4 | 28/36 | 0.4 | 0.4 | 0.0 | 33/36 | 1954 | 100 | 9.7 | 3.1 | 0.4 |

| case | @cf/openai/gpt-oss-120b |
|---|---|
| 16-github-issues-to-slack | 1/3 |
| 17-stripe-refund-rest | 2/3 |
| 18-sendgrid-confirmation | 3/3 |
| 19-kafka-publish | 3/3 |
| 20-openai-summarise | 2/3 |
| 21-sheets-and-teams | 2/3 |
| 22-internal-api | 3/3 |
| 23-webhook-rest-teams | 3/3 |
| 24-lambda-then-sqs | 3/3 |
| 25-no-integration | 2/3 |
| 26-notion-page-rest | 1/3 |
| 27-github-workflow-runs | 3/3 |

Medians except neurons, problems, fixes, lint errors, kept, added and removed (means).
Reasoning tokens are estimated from characters when the model does not report them.
