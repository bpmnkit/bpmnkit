| model | ok | TTFB ms | first shape ms | total ms | in tok | out tok | reasoning tok | neurons | assertions | problems | fixes | lint errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| @cf/openai/gpt-oss-120b | 12/12 | 327 | 12387 | 10568 | 424 | 635 | 525 | 67.7 | 4/12 | 7.3 | 0.5 | 0.3 |
| @cf/openai/gpt-oss-20b | 12/12 | 230 | 19199 | 12061 | 430 | 1215 | 1257 | 41.8 | 4/12 | 0.6 | 1.2 | 0.0 |
| @cf/google/gemma-4-26b-a4b-it | 12/12 | 531 | 2061 | 2443 | 405 | 72 | 0 | 5.9 | 7/12 | 1.8 | 0.2 | 0.3 |
| @cf/zai-org/glm-4.7-flash | 12/12 | 238 | 824 | 1972 | 366 | 80 | 0 | 5.0 | 5/12 | 2.6 | 1.5 | 1.5 |
| @cf/qwen/qwen3-30b-a3b-fp8 | 12/12 | 142 | 5469 | 7277 | 377 | 1052 | 1130 | 33.8 | 3/12 | 0.2 | 0.3 | 0.3 |
| @cf/ibm-granite/granite-4.0-h-micro | 12/12 | 383 | 1085 | 1657 | 373 | 51 | 0 | 1.2 | 2/12 | 4.5 | 2.3 | 1.3 |

Medians except neurons, problems, fixes and lint errors (means).
Reasoning tokens are estimated from characters when the model does not report them.
