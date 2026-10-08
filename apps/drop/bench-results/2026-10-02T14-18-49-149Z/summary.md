| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors | connect skip right | connect ms | connect out tok | connect neurons | connect problems | connect questions |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/openai/gpt-oss-120b | 36/36 | 341 | 5288 | 5822 | 564 | 418 | 419 | 50.2 | 23/36 | 0.1 | 0.1 | 0.0 | 36/36 | 2782 | 87 | 8.5 | 2.5 | 0.9 |

| case | @cf/openai/gpt-oss-120b |
|---|---|
| 16-github-issues-to-slack | 2/3 |
| 17-stripe-refund-rest | 1/3 |
| 18-sendgrid-confirmation | 0/3 |
| 19-kafka-publish | 3/3 |
| 20-openai-summarise | 1/3 |
| 21-sheets-and-teams | 3/3 |
| 22-internal-api | 3/3 |
| 23-webhook-rest-teams | 2/3 |
| 24-lambda-then-sqs | 1/3 |
| 25-no-integration | 3/3 |
| 26-notion-page-rest | 2/3 |
| 27-github-workflow-runs | 2/3 |

Medians except neurons, problems, fixes, lint errors, kept, added and removed (means).
Reasoning tokens are estimated from characters when the model does not report them.
