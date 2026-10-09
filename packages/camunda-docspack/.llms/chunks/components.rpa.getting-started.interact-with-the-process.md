# Get started with RPA — Interact with the process

Now that you have integrated your first script, it can be part of a larger BPMN process. The main interaction between the script and your process will be the variables and documents.

### Variables

Process variables will be mapped to robot variables automatically. Use the `Camunda` library and the `Set Output Variable` keyword to set return variables.

In this example, the input would be the following:

```Robot
*** Settings ***
Library             Camunda

*** Tasks ***
Log X
    Log                    Process variable 'x' is set to ${x}
    Set Output Variable    result    We logged x
```

### Documents

**Note**
Multiple Camunda components can create documents. Visit our [concepts page](https://docs.camunda.io/docs/next/components/document-handling/getting-started) to learn how Camunda handles binary data.

Documents managed by Camunda can be consumed or created by an RPA script. Use `Download Documents` to resolve a document descriptor to a file and `Upload Documents` to create a document descriptor from a file.

The script below downloads a file, appends a line, and uploads the document with the same variable name:

```Robot
*** Settings ***
Library             Camunda
Library             Camunda.FileSystem

*** Tasks ***
Log Operation
    ${path}=    Download Documents     ${operationLog}
    Append To File    ${path}     new Line, appended by RPA script
    Upload Documents    ${path}     operationLog
```

### Handling exceptions

You can handle problems in your tasks in two ways: exceptions and errors. See Camunda [best practices](https://docs.camunda.io/docs/next/components/best-practices/development/dealing-with-problems-and-exceptions) to understand which strategy is best for your case.

#### Incidents

If your RPA script runs into an unexpected error during execution, this error (alongside the output) will be reported to Zeebe. If the job retries are exceeded, an [incident](https://docs.camunda.io/docs/next/components/concepts/incidents) will be created in [Operate](https://docs.camunda.io/docs/next/components/operate/operate-introduction).

To ensure your environment is always clean and all open applications are closed, create a cleanup step and tag it as `[Teardown]`. See the [Robot Framework documentation](https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html#user-keyword-setup-and-teardown) for details on setup and teardown.

```
*** Settings ***
Library             Camunda
Library             Camunda.Browser.Selenium

*** Tasks ***
Main
    Perform Work
    [Teardown]    Cleanup

*** Keywords ***
Perform Work
    Open Browser      about:blank
    Fail

Cleanup
    # Close your application, even when encountering errors
    Close All Browsers
```

#### BPMN errors

If you encounter an error that should be handled as a BPMN error, you can use the `Throw BPMN Error` keyword. Instead of creating an incident, this will create a [BPMN error](https://docs.camunda.io/docs/next/components/best-practices/development/dealing-with-problems-and-exceptions#handling-errors-on-the-process-level).

**Note**
A BPMN error cannot be caught in the script. It always stops the script execution and initiates the teardown procedure.

```robot
*** Settings ***
Library             Camunda

*** Tasks ***
Log Operation
    Throw BPMN Error     MY_ERROR_CODE       We encountered a business error
    [Teardown]    Log    Teardown is still executed
```

### Shared script resources

Multiple script files are not supported. Each task should be contained within a single script. You can use [pre-run and post-run scripts](https://docs.camunda.io/docs/next/components/rpa/production#pre--and-post-run-scripts) for environment setup and cleanup.

---
Source: https://docs.camunda.io/docs/next/components/rpa/getting-started
