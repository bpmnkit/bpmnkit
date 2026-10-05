Change rules: text

| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors | kept % | added | removed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/zai-org/glm-4.7-flash | 30/30 | 236 | 536 | 1345 | 840 | 65 | 0 | 7.7 | 19/30 | 1.0 | 1.1 | 0.0 | 93.6 | 1.3 | 0.5 |

| case | @cf/zai-org/glm-4.7-flash |
|---|---|
| 01-add-step | 2/3 |
| 02-add-timer-boundary | 1/3 |
| 03-remove-step | 3/3 |
| 04-add-branch | 2/3 |
| 05-make-parallel | 1/3 |
| 06-answer-default-question | 2/3 |
| 07-answer-variable-question | 2/3 |
| 08-change-type | 0/3 |
| 09-rename | 3/3 |
| 10-add-loop | 3/3 |

Medians except neurons, problems, fixes, lint errors, kept, added and removed (means).
Reasoning tokens are estimated from characters when the model does not report them.
