# Code Conversion — Refactoring recipes (using OpenRewrite) — Using the recipes

#### Prerequisites

- Maven-based Java project (Gradle is also supported via [OpenRewrite's documentation](https://docs.openrewrite.org/running-recipes/getting-started))
- Project under version control (to easily review refactorings)

#### Step 1: Add the OpenRewrite Maven plugin

Add the following to your `pom.xml`:

```xml
<project>
    <build>
        <plugins>
            <plugin>
                <groupId>org.openrewrite.maven</groupId>
                <artifactId>rewrite-maven-plugin</artifactId>
                <version>6.29.0</version>
                <configuration>
                    <activeRecipes>
                        <recipe>io.camunda.migration.code.recipes.AllClientRecipes</recipe>
                        <recipe>io.camunda.migration.code.recipes.AllDelegateRecipes</recipe>
                        <recipe>io.camunda.migration.code.recipes.AllExternalWorkerRecipes</recipe>
                    </activeRecipes>
                    <skipMavenParsing>false</skipMavenParsing>
                </configuration>
                <dependencies>
                    <dependency>
                        <groupId>io.camunda</groupId>
                        <artifactId>camunda-7-to-8-code-conversion-recipes</artifactId>
                        <version>0.3.7</version>
                    </dependency>
                </dependencies>
            </plugin>
        </plugins>
    </build>
</project>
```

**Warning: Important**
Always back up your code or use version control before running recipes. This ensures you can review and rollback changes if needed.

**Note**
The use of `camunda-7-to-8-code-conversion-recipes` artifact requires access to the Camunda Enterprise Maven repository. See the [Camunda 7 documentation](https://docs.camunda.org/get-started/apache-maven/#camunda-artifact-storage) for instructions on setting up the repository in your Maven configuration.

Choose the recipes that match your codebase:

- Include `AllClientRecipes` if you have code that calls the Camunda API (starting processes, correlating messages, etc.)
- Include `AllDelegateRecipes` if you have Java delegates or execution listeners
- Include `AllExternalWorkerRecipes` if you have external task workers

#### Step 2: Run the recipes

Execute the following command:

```shell
mvn rewrite:run
```

#### Step 3: Review the changes

Carefully examine all changes using your version control system's diff tool. Recipes can add scaffolding, generated names, and TODO comments that need AI or manual cleanup. The recipes add comments where manual review is needed:

- Parameters that were removed or have different semantics in Camunda 8
- Methods with no direct one-to-one replacement (for example, executionId-based operations)
- Dummy literal strings that need to be replaced with actual values

**Warning: Important**
A successful recipe run, including a successful compile, does not demonstrate a complete migration. Review source-to-output mappings and behavior. Some concepts from Camunda 7 (like executionId) don't exist in Camunda 8, and recipes cannot automatically determine the correct replacement in all cases.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/code-conversion
