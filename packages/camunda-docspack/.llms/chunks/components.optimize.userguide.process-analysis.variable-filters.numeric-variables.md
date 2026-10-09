# Variable filters — Numeric variables

Here you have an input field to define whether the variable value in the process instance should be equal, not equal, less than, or greater than a certain value. You can even add more input fields and apply the same operation several times at once.

If the `is` option of the toggle button is selected, adding one or more values means that you want to see only those process instances where the variable value equals one of the checked values (this corresponds to the `or` operator in boolean logic.)

If the `is not` option of the toggle button is selected, adding one or more values means that you want to see only those process instances where the variable value does not equal any of the checked values (this corresponds to the `and` operator in boolean logic.)

In case the `is less than` or `is greater than` option is selected, only one value can be entered.

Null or undefined options can be included or excluded from the results in a way similar to string variables.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/variable-filters
