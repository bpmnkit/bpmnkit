# JSON test cases — Run a JSON test case

You can run your JSON test case files as parameterized JUnit tests. Add the `@TestCaseSource` annotation to your test method to read the files and provide test cases as arguments. Then, execute the test cases using the `TestCaseRunner` provided by CPT.

The runner executes the test case instructions by leveraging CPT's assertions and utilities. If an assertion instruction fails, the runner throws an assertion error, causing the test to fail. If all instructions pass, the test case is considered successful.

```java
@SpringBootTest
@CamundaSpringProcessTest
public class MyProcessTest {

    @Autowired private TestCaseRunner testCaseRunner;

    @ParameterizedTest
    @TestCaseSource
    void shouldPass(final TestCase testCase, final String fileName) {
        // given: the process definitions are deployed

        // when/then: run and verify the test case
        testCaseRunner.run(testCase);
    }
}
```

```java
@CamundaProcessTest
public class MyProcessTest {

    private TestCaseRunner testCaseRunner;

    @ParameterizedTest
    @TestCaseSource
    void shouldPass(final TestCase testCase, final String fileName) {
        // given: the process definitions are deployed

        // when/then: run and verify the test case
        testCaseRunner.run(testCase);
    }
}
```

You can set the following fields in the `@TestCaseSource` annotation to configure which files to load:

- `directory`: The classpath directory to scan for JSON test case files. Defaults to `/test-cases`.
- `fileNames`: An array of specific file names to load from the directory. If not set, all files in the directory are loaded.
- `fileExtension`: The file extension to filter files in the directory. Defaults to `json`. The filter is ignored if `fileNames` is set.

### Connect your process application

The `TestCaseRunner` integrates seamlessly with CPT's [test lifecycle](https://docs.camunda.io/docs/next/apis-tools/testing/getting-started#test-lifecycle). It connects to your process application and starts job workers, if enabled.

You can add additional steps before and after running the test case, for example, to deploy additional resources or to mock external services of your process application.

```java
@SpringBootTest
@CamundaSpringProcessTest
public class MyProcessTest {

    @Autowired private CamundaClient client;
    @Autowired private CamundaProcessTestContext processTestContext;
    @Autowired private TestCaseRunner testCaseRunner;

    @MockitoBean private AccountingService accountingService;

    @ParameterizedTest
    @TestCaseSource
    void shouldPass(final TestCase testCase, final String fileName) {
        // given: the process definitions are deployed via @Deployment on the process application
        // optionally: set up mocks, job workers, etc.

        // when/then: run and verify the test case
        testCaseRunner.run(testCase);

        // optionally: verify mock invocations, external resources, etc.
        Mockito.verify(accountingService).addInvoiceToAccount("0815", "INV-1001");
    }
}
```

```java
@CamundaProcessTest
@ExtendWith(MockitoExtension.class)
public class MyProcessTest {

    private CamundaClient client;
    private CamundaProcessTestContext processTestContext;
    private TestCaseRunner testCaseRunner;

    // Inject the mock in the process application
    @Mock private AccountingService accountingService;

    @ParameterizedTest
    @TestCaseSource
    @TestDeployment(resources = "invoice-approval.bpmn")
    void shouldPass(final TestCase testCase, final String fileName) {
        // given: the process definitions are deployed via @TestDeployment
        // optionally: set up mocks, job workers, etc.

        // when/then: run and verify the test case
        testCaseRunner.run(testCase);

        // optionally: verify mock invocations, external resources, etc.
        Mockito.verify(accountingService).addInvoiceToAccount("0815", "INV-1001");
    }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/testing/json-test-cases
