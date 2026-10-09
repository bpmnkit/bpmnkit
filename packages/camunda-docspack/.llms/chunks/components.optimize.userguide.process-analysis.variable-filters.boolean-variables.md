# Variable filters — Boolean variables

They can have the state `true`, `false`, `null`, or `undefined`.


## String variables

Two types of operators are available for variables of type `String`. You can either filter by an exact variable value (`is` and `is not`) or filter by a substring (`contains` and `does not contain`).

For the operators `is` and `is not`, the first 10 values are loaded and displayed. If the variable has more than 10 values, a `Load More` button is shown to be able to extend the list as much as you need. You can also search through the whole list of values using the search input field. The list only contains variable values that already appeared in one of the instances of the process.

To filter by a variable value that is not in the list of available values, click the **+ Value** button and add a custom variable value.

In case the `is` option of the toggle button is selected, checking one or more values means that you want to see only those process instances where the variable value equals one of the checked values (this corresponds to the `or` operator in boolean logic.)

In case the `is not` option of the toggle button is selected, checking one or more values means that you want to see only those process instances where the variable value does not equal any of the checked values (this corresponds to the `and` operator in the boolean logic.)

For the operators `contains` and `does not contain`, you can add one or multiple values that should match a substring of the variable value. For the `contains` operator, adding one or more values means that you want to see only those process instances where the variable value contains one of the entered values (this corresponds to the `or` operator in boolean logic).

In case the `does not contain` operator is selected, adding one or more values means that you want to see only those process instances where the variable value does not contain any of the entered values (this corresponds to the `and` operator in boolean logic.)

There is an option to include the null or undefined values of the selected variable in the result. By using the same option, it is also possible to show all the values except the null or undefined by selecting the `is not` option of the toggle button.

---
Source: https://docs.camunda.io/docs/next/components/optimize/userguide/process-analysis/variable-filters
