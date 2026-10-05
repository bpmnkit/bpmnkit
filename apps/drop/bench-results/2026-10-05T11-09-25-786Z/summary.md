Change rules: text

| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors | kept % | added | removed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/zai-org/glm-4.7-flash | 30/30 | 267 | 687 | 1263 | 784 | 64 | 0 | 7.4 | 20/30 | 0.3 | 1.0 | 0.0 | 93.9 | 1.0 | 0.4 |

| case | @cf/zai-org/glm-4.7-flash |
|---|---|
| 01-add-step | 3/3 |
| 02-add-timer-boundary | 0/3 |
| 03-remove-step | 3/3 |
| 04-add-branch | 2/3 |
| 05-make-parallel | 0/3 |
| 06-answer-default-question | 3/3 |
| 07-answer-variable-question | 3/3 |
| 08-change-type | 2/3 |
| 09-rename | 2/3 |
| 10-add-loop | 2/3 |

Medians except neurons, problems, fixes, lint errors, kept, added and removed (means).
Reasoning tokens are estimated from characters when the model does not report them.
