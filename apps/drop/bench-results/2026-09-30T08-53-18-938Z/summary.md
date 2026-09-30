| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/openai/gpt-oss-120b | 12/12 | 222 | 6535 | 5243 | 528 | 558 | 531 | 65.0 | 7/12 | 0.2 | 0.2 | 0.0 |
| @cf/openai/gpt-oss-20b | 12/12 | 163 | 7097 | 4879 | 534 | 626 | 633 | 35.3 | 6/12 | 0.3 | 0.5 | 0.0 |
| @cf/google/gemma-4-26b-a4b-it | 12/12 | 204 | 782 | 1656 | 513 | 66 | 0 | 7.7 | 9/12 | 2.2 | 1.7 | 0.1 |
| @cf/zai-org/glm-4.7-flash | 12/12 | 195 | 675 | 1503 | 469 | 71 | 0 | 5.9 | 6/12 | 2.3 | 1.6 | 0.0 |
| @cf/qwen/qwen3-30b-a3b-fp8 | 12/12 | 182 | 7637 | 9473 | 482 | 925 | 931 | 37.6 | 6/12 | 0.7 | 0.8 | 0.1 |
| @cf/ibm-granite/granite-4.0-h-micro | 12/12 | 355 | 1317 | 1571 | 476 | 50 | 0 | 2.1 | 3/12 | 4.5 | 1.6 | 0.2 |

Medians except neurons, problems, fixes and lint errors (means).
Reasoning tokens are estimated from characters when the model does not report them.
