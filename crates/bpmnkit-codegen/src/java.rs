//! Java target: Maven, Java 21, `camunda-client-java` (plain) or the Spring Boot starter
//! (`--spring`). Layout in plan §5; coordinates and signatures were checked against the 8.8.47
//! jars (see [`Versions`]).

use std::collections::BTreeSet;
use std::fmt::Write as _;

use bpmnkit_jobspec::{ir_hash, JobSpec, WorkerProject};

use crate::{
    finish, header, lower_camel, pascal, select_jobs, upper_snake, EmitError, Emitter, GenFile,
};

/// Exact pins (plan I6). Bumped by hand; goldens rot with client releases otherwise.
pub struct Versions;

impl Versions {
    pub const CAMUNDA: &'static str = "8.8.47";
    pub const SLF4J: &'static str = "2.0.17";
    pub const JUNIT: &'static str = "5.12.2";
    pub const SPRING_BOOT: &'static str = "3.5.16";
    pub const MAVEN: &'static str = "3.9.11";
    pub const COMPILER_PLUGIN: &'static str = "3.14.1";
    pub const SUREFIRE_PLUGIN: &'static str = "3.5.4";
    pub const EXEC_PLUGIN: &'static str = "3.6.2";
}

const MVNW: &str = include_str!("../assets/java/mvnw");
const MVNW_CMD: &str = include_str!("../assets/java/mvnw.cmd");
const WRAPPER_PROPERTIES: &str = include_str!("../assets/java/maven-wrapper.properties");

#[derive(Debug, Clone, Default)]
pub struct JavaEmitter {
    /// Java package; empty derives `com.example.<name>`.
    pub package: String,
    pub spring: bool,
    /// Generate for every job type, not only those classified as worker.
    pub all: bool,
}

/// `[a-z0-9]` only, so it is a legal package segment and artifact id.
fn slug(s: &str) -> String {
    let mut out = String::new();
    let mut dash = false;
    for c in s.chars() {
        if c.is_ascii_alphanumeric() {
            if dash && !out.is_empty() {
                out.push('-');
            }
            dash = false;
            out.push(c.to_ascii_lowercase());
        } else {
            dash = true;
        }
    }
    if out.is_empty() || out.starts_with(|c: char| c.is_ascii_digit()) {
        out.insert_str(0, "worker-");
        out = out.trim_end_matches('-').to_owned();
    }
    out
}

const RESERVED: &[&str] = &[
    "abstract",
    "assert",
    "boolean",
    "break",
    "byte",
    "case",
    "catch",
    "char",
    "class",
    "const",
    "continue",
    "default",
    "do",
    "double",
    "else",
    "enum",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "goto",
    "if",
    "implements",
    "import",
    "instanceof",
    "int",
    "interface",
    "long",
    "native",
    "new",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "short",
    "static",
    "strictfp",
    "super",
    "switch",
    "synchronized",
    "this",
    "throw",
    "throws",
    "transient",
    "try",
    "void",
    "volatile",
    "while",
    "record",
    "var",
    "yield",
    "true",
    "false",
    "null",
    "_",
];

/// Make names unique in input order by appending 2, 3, … (inputs are sorted, so this is stable).
fn unique<'a>(names: impl Iterator<Item = (String, &'a str)>) -> Vec<(String, &'a str)> {
    let mut seen = BTreeSet::new();
    names
        .map(|(mut n, src)| {
            let base = n.clone();
            let mut i = 2;
            while !seen.insert(n.clone()) {
                n = format!("{base}{i}");
                i += 1;
            }
            (n, src)
        })
        .collect()
}

fn field(name: &str) -> String {
    let n = lower_camel(name);
    if RESERVED.contains(&n.as_str()) {
        format!("{n}_")
    } else {
        n
    }
}

/// The leading variable name of an output mapping source (`=result.id` → `result`).
fn root_identifier(source: &str) -> Option<&str> {
    let s = source.trim().trim_start_matches('=').trim();
    let end = s
        .find(|c: char| !(c.is_ascii_alphanumeric() || c == '_'))
        .unwrap_or(s.len());
    let id = &s[..end];
    (!id.is_empty() && !id.starts_with(|c: char| c.is_ascii_digit())).then_some(id)
}

/// Everything the templates need for one job.
struct J<'a> {
    spec: &'a JobSpec,
    class: String,
    constant: String,
    /// (java field, variable name), sorted by variable name.
    inputs: Vec<(String, &'a str)>,
    outputs: Vec<(String, &'a str)>,
}

fn jobs<'a>(selected: &[&'a JobSpec]) -> Vec<J<'a>> {
    let classes = unique(
        selected
            .iter()
            .map(|j| (pascal(&j.job_type), j.job_type.as_str())),
    );
    let consts = unique(
        selected
            .iter()
            .map(|j| (upper_snake(&j.job_type), j.job_type.as_str())),
    );
    selected
        .iter()
        .zip(classes.into_iter().zip(consts))
        .map(|(spec, ((class, _), (constant, _)))| {
            let in_names: BTreeSet<&str> = spec.inputs.iter().map(|m| m.target.as_str()).collect();
            let out_names: BTreeSet<&str> = spec
                .outputs
                .iter()
                .filter_map(|m| root_identifier(&m.source))
                .collect();
            J {
                spec,
                class,
                constant,
                inputs: unique(in_names.into_iter().map(|n| (field(n), n))),
                outputs: unique(out_names.into_iter().map(|n| (field(n), n))),
            }
        })
        .collect()
}

fn record(out: &mut String, name: &str, fields: &[(String, &str)]) {
    let _ = writeln!(out, "public record {name}(");
    for (i, (f, var)) in fields.iter().enumerate() {
        let sep = if i + 1 < fields.len() { "," } else { "" };
        if f != var {
            let _ = writeln!(out, "    @JsonProperty(\"{}\") Object {f}{sep}", esc(var));
        } else {
            let _ = writeln!(out, "    Object {f}{sep}");
        }
    }
    out.push_str(") {}\n");
}

fn esc(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

fn fetch_list(j: &J) -> String {
    j.inputs
        .iter()
        .map(|(_, v)| format!("\"{}\"", esc(v)))
        .collect::<Vec<_>>()
        .join(", ")
}

impl Emitter for JavaEmitter {
    fn target(&self) -> &'static str {
        "java"
    }

    fn emit(&self, project: &WorkerProject) -> Result<Vec<GenFile>, EmitError> {
        let selected = select_jobs(project, self.all);
        if selected.is_empty() {
            return Err(EmitError::NoJobs);
        }
        let js = jobs(&selected);
        let hash = ir_hash(project);
        let hdr = header("//", &hash);
        let slug = slug(&project.name);
        let pkg = if self.package.is_empty() {
            format!("com.example.{}", slug.replace('-', ""))
        } else {
            self.package.clone()
        };
        let dir = format!("src/main/java/{}", pkg.replace('.', "/"));
        let test_dir = format!("src/test/java/{}", pkg.replace('.', "/"));
        let mut files = Vec::new();
        let gen = |name: &str, body: String| {
            GenFile::generated(format!("{dir}/gen/{name}.java"), format!("{hdr}{body}"))
        };

        // gen/ — overwritten.
        let mut types = format!("package {pkg}.gen;\n\n/** Job types of this project. */\npublic final class JobTypes {{\n    private JobTypes() {{}}\n\n");
        for j in &js {
            let _ = writeln!(
                types,
                "    public static final String {} = \"{}\";",
                j.constant,
                esc(&j.spec.job_type)
            );
        }
        types.push_str("}\n");
        files.push(gen("JobTypes", types));
        files.push(gen("BpmnErrors", bpmn_errors(&pkg, &js, self.spring)));
        for j in &js {
            let mut input = format!("package {pkg}.gen;\n\n");
            if j.inputs.iter().any(|(f, v)| f != v) {
                input.push_str("import com.fasterxml.jackson.annotation.JsonProperty;\n\n");
            }
            input.push_str(
                "/** Variables fetched for the job (the declared zeebe:input targets). */\n",
            );
            record(&mut input, &format!("{}Input", j.class), &j.inputs);
            files.push(gen(&format!("{}Input", j.class), input));

            let mut output = format!("package {pkg}.gen;\n\n");
            if j.outputs.iter().any(|(f, v)| f != v) {
                output.push_str("import com.fasterxml.jackson.annotation.JsonProperty;\n\n");
            }
            output.push_str(
                "/** Variables returned on completion (roots of the zeebe:output sources). */\n",
            );
            record(&mut output, &format!("{}Output", j.class), &j.outputs);
            files.push(gen(&format!("{}Output", j.class), output));
            files.push(gen(
                &format!("{}Worker", j.class),
                worker(&pkg, j, self.spring),
            ));
        }
        if !self.spring {
            files.push(gen("Workers", workers(&pkg, &js)));
        }

        // Once-only — owned by the user after the first run.
        for j in &js {
            files.push(GenFile::once(
                format!("{dir}/handlers/{}Handler.java", j.class),
                handler_stub(&pkg, j, self.spring),
            ));
            files.push(GenFile::once(
                format!("{test_dir}/{}WorkerTest.java", j.class),
                test_stub(&pkg, j, self.spring),
            ));
        }
        files.push(GenFile::once(
            format!("{dir}/App.java"),
            app(&pkg, self.spring),
        ));
        if self.spring {
            files.push(GenFile::once(
                "src/main/resources/application.properties",
                "# Camunda 8 connection. Local Camunda 8 Run: nothing to set.\n\
                 # Camunda SaaS / Self-Managed: set the CAMUNDA_* environment variables or the camunda.client.* properties.\n\
                 camunda.client.mode=self-managed\n\
                 camunda.client.rest-address=${CAMUNDA_REST_ADDRESS:http://localhost:8080}\n"
                    .to_owned(),
            ));
        }
        files.push(GenFile::once("pom.xml", pom(&slug, &pkg, self.spring)));
        files.push(GenFile::once(
            "README.md",
            readme(&project.name, &js, self.spring),
        ));
        files.push(GenFile::once(".gitignore", "target/\n".to_owned()));
        let mut mvnw = GenFile::once("mvnw", MVNW);
        mvnw.executable = true;
        files.push(mvnw);
        files.push(GenFile::once("mvnw.cmd", MVNW_CMD));
        let props = WRAPPER_PROPERTIES.replace("3.9.11", Versions::MAVEN);
        files.push(GenFile::once(
            ".mvn/wrapper/maven-wrapper.properties",
            props,
        ));
        finish(files)
    }
}

fn bpmn_errors(pkg: &str, js: &[J], spring: bool) -> String {
    let codes: BTreeSet<&str> = js
        .iter()
        .flat_map(|j| j.spec.errors.iter().map(String::as_str))
        .collect();
    let consts = unique(codes.iter().map(|c| (upper_snake(c), *c)));
    let methods = unique(codes.iter().map(|c| (field(c), *c)));
    let mut s = format!("package {pkg}.gen;\n\n");
    if !spring {
        s.push_str(
            "import io.camunda.client.api.response.ActivatedJob;\nimport io.camunda.client.api.worker.JobClient;\nimport java.time.Duration;\nimport java.time.format.DateTimeParseException;\n\n",
        );
    }
    s.push_str(
        "/**\n * BPMN errors of the model and the mapping from handler exceptions to Camunda commands:\n * a {@link Thrown} becomes a BPMN error (caught by a boundary event), any other exception fails\n * the job with retries - 1 and the back-off of the `retryBackoff` task header (ISO-8601).\n */\npublic final class BpmnErrors {\n    private BpmnErrors() {}\n\n",
    );
    for (c, code) in &consts {
        let _ = writeln!(s, "    public static final String {c} = \"{}\";", esc(code));
    }
    if !consts.is_empty() {
        s.push('\n');
    }
    s.push_str(
        "    /** Thrown by a handler to raise a BPMN error. */\n    public static final class Thrown extends RuntimeException {\n        private final String code;\n\n        public Thrown(String code, String message) {\n            super(message);\n            this.code = code;\n        }\n\n        public String code() {\n            return code;\n        }\n    }\n\n    public static Thrown of(String code, String message) {\n        return new Thrown(code, message);\n    }\n",
    );
    for ((m, _), (c, _)) in methods.iter().zip(&consts) {
        let _ = write!(s, "\n    public static Thrown {m}(String message) {{\n        return new Thrown({c}, message);\n    }}\n");
    }
    if spring {
        s.push_str(
            "\n    /** The starter turns this into a BPMN error on the job. */\n    public static io.camunda.client.exception.BpmnError toStarter(Thrown t) {\n        return new io.camunda.client.exception.BpmnError(t.code(), t.getMessage());\n    }\n",
        );
    } else {
        s.push_str(
            "\n    public static void report(JobClient client, ActivatedJob job, Exception e) {\n        if (e instanceof Thrown t) {\n            client.newThrowErrorCommand(job).errorCode(t.code()).errorMessage(t.getMessage()).send().join();\n            return;\n        }\n        String message = e.getMessage() == null ? e.getClass().getName() : e.getMessage();\n        client\n            .newFailCommand(job)\n            .retries(Math.max(job.getRetries() - 1, 0))\n            .retryBackoff(backoff(job))\n            .errorMessage(message)\n            .send()\n            .join();\n    }\n\n    private static Duration backoff(ActivatedJob job) {\n        String value = job.getCustomHeaders().get(\"retryBackoff\");\n        if (value == null) {\n            return Duration.ZERO;\n        }\n        try {\n            return Duration.parse(value);\n        } catch (DateTimeParseException ignored) {\n            return Duration.ZERO;\n        }\n    }\n",
        );
    }
    s.push_str("}\n");
    s
}

fn worker(pkg: &str, j: &J, spring: bool) -> String {
    let c = &j.class;
    let mut s = format!("package {pkg}.gen;\n\n");
    let fetch = fetch_list(j);
    let fetch_note = if j.inputs.is_empty() {
        "    // No zeebe:input is declared, so every variable is fetched (an empty list means all).\n"
    } else {
        ""
    };
    if spring {
        let attr = if j.inputs.is_empty() {
            String::new()
        } else {
            format!(", fetchVariables = {{{fetch}}}")
        };
        let _ = write!(
            s,
            "import io.camunda.client.annotation.JobWorker;\nimport io.camunda.client.annotation.VariablesAsType;\nimport io.camunda.client.api.response.ActivatedJob;\nimport org.springframework.stereotype.Component;\n\n/** Adapter between the starter and {c}Handler. Fetches exactly the declared inputs. */\n@Component\npublic class {c}Worker {{\n    /** Implemented by the once-only stub in handlers/. */\n    public interface Handler {{\n        {c}Output handle({c}Input input, ActivatedJob job) throws Exception;\n    }}\n\n{fetch_note}    private final Handler handler;\n\n    public {c}Worker(Handler handler) {{\n        this.handler = handler;\n    }}\n\n    @JobWorker(type = JobTypes.{k}{attr})\n    public {c}Output handle(final ActivatedJob job, @VariablesAsType final {c}Input input) throws Exception {{\n        try {{\n            return handler.handle(input, job);\n        }} catch (BpmnErrors.Thrown t) {{\n            throw BpmnErrors.toStarter(t);\n        }}\n    }}\n}}\n",
            k = j.constant,
        );
        return s;
    }
    let _ = write!(
        s,
        "import io.camunda.client.api.response.ActivatedJob;\nimport io.camunda.client.api.worker.JobClient;\nimport io.camunda.client.api.worker.JobHandler;\nimport java.util.List;\n\n/** Adapter between the client and {c}Handler. Fetches exactly the declared inputs. */\npublic final class {c}Worker implements JobHandler {{\n    /** Implemented by the once-only stub in handlers/. */\n    public interface Handler {{\n        {c}Output handle({c}Input input, ActivatedJob job) throws Exception;\n    }}\n\n{fetch_note}    public static final List<String> FETCH_VARIABLES = List.of({fetch});\n\n    private final Handler handler;\n\n    public {c}Worker(Handler handler) {{\n        this.handler = handler;\n    }}\n\n    @Override\n    public void handle(JobClient client, ActivatedJob job) {{\n        try {{\n            {c}Output output = handler.handle(job.getVariablesAsType({c}Input.class), job);\n            client.newCompleteCommand(job).variables(output).send().join();\n        }} catch (Exception e) {{\n            BpmnErrors.report(client, job, e);\n        }}\n    }}\n}}\n"
    );
    s
}

fn workers(pkg: &str, js: &[J]) -> String {
    let mut s = format!(
        "package {pkg}.gen;\n\nimport io.camunda.client.CamundaClient;\nimport io.camunda.client.api.worker.JobWorker;\nimport java.util.ArrayList;\nimport java.util.List;\nimport {pkg}.handlers.*;\n\n/** Opens one job worker per job type. */\npublic final class Workers {{\n    private Workers() {{}}\n\n    public static List<JobWorker> registerAll(CamundaClient client) {{\n        List<JobWorker> workers = new ArrayList<>();\n"
    );
    for j in js {
        let c = &j.class;
        let fetch = if j.inputs.is_empty() {
            String::new()
        } else {
            format!("\n                .fetchVariables({c}Worker.FETCH_VARIABLES)")
        };
        let _ = writeln!(
            s,
            "        workers.add(\n            client\n                .newWorker()\n                .jobType(JobTypes.{k})\n                .handler(new {c}Worker(new {c}Handler())){fetch}\n                .name(\"{name}\")\n                .open());",
            k = j.constant,
            name = esc(&j.spec.job_type),
        );
    }
    s.push_str("        return workers;\n    }\n}\n");
    s
}

fn handler_stub(pkg: &str, j: &J, spring: bool) -> String {
    let c = &j.class;
    let (imp, ann) = if spring {
        (
            "import org.springframework.stereotype.Component;\n",
            "@Component\n",
        )
    } else {
        ("", "")
    };
    format!(
        "package {pkg}.handlers;\n\nimport io.camunda.client.api.response.ActivatedJob;\nimport {pkg}.gen.{c}Input;\nimport {pkg}.gen.{c}Output;\nimport {pkg}.gen.{c}Worker;\n{imp}\n/**\n * Job type `{ty}`. Written once by bpmnkit, yours from now on.\n *\n * <p>Delivery is at-least-once: make this idempotent. Throw {{@code BpmnErrors.of(code, message)}} for a\n * BPMN error; any other exception fails the job (retries - 1).\n */\n{ann}public class {c}Handler implements {c}Worker.Handler {{\n    @Override\n    public {c}Output handle({c}Input input, ActivatedJob job) throws Exception {{\n        throw new UnsupportedOperationException(\"implement {c}Handler\");\n    }}\n}}\n",
        ty = j.spec.job_type.replace("*/", "* /"),
    )
}

fn test_stub(pkg: &str, j: &J, spring: bool) -> String {
    let c = &j.class;
    if spring {
        format!(
            "package {pkg};\n\nimport static org.assertj.core.api.Assertions.assertThat;\n\nimport io.camunda.process.test.api.CamundaProcessTestContext;\nimport io.camunda.process.test.api.CamundaSpringProcessTest;\nimport java.util.Map;\nimport {pkg}.gen.JobTypes;\nimport org.junit.jupiter.api.Test;\nimport org.springframework.beans.factory.annotation.Autowired;\nimport org.springframework.boot.test.context.SpringBootTest;\n\n/** Written once. Camunda Process Test: deploy your process and assert on it with the worker mocked. */\n@SpringBootTest\n@CamundaSpringProcessTest\nclass {c}WorkerTest {{\n    @Autowired private CamundaProcessTestContext processTestContext;\n\n    @Test\n    void jobWorkerCanBeMocked() {{\n        // Replace with: deploy the process, start an instance, assert on the outcome.\n        assertThat(processTestContext.mockJobWorker(JobTypes.{k}).thenComplete(Map.of())).isNotNull();\n    }}\n}}\n",
            k = j.constant
        )
    } else {
        format!(
            "package {pkg};\n\nimport static org.assertj.core.api.Assertions.assertThat;\n\nimport io.camunda.client.CamundaClient;\nimport io.camunda.process.test.api.CamundaProcessTest;\nimport io.camunda.process.test.api.CamundaProcessTestContext;\nimport java.util.Map;\nimport {pkg}.gen.JobTypes;\nimport org.junit.jupiter.api.Test;\n\n/** Written once. Camunda Process Test: deploy your process and assert on it with the worker mocked. */\n@CamundaProcessTest\nclass {c}WorkerTest {{\n    // Injected by the extension.\n    private CamundaClient client;\n    private CamundaProcessTestContext processTestContext;\n\n    @Test\n    void jobWorkerCanBeMocked() {{\n        // Replace with: deploy the process, start an instance, assert on the outcome.\n        assertThat(processTestContext.mockJobWorker(JobTypes.{k}).thenComplete(Map.of())).isNotNull();\n        assertThat(client).isNotNull();\n    }}\n}}\n",
            k = j.constant
        )
    }
}

fn app(pkg: &str, spring: bool) -> String {
    if spring {
        format!("package {pkg};\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n/** Written once. */\n@SpringBootApplication\npublic class App {{\n    public static void main(String[] args) {{\n        SpringApplication.run(App.class, args);\n    }}\n}}\n")
    } else {
        format!("package {pkg};\n\nimport io.camunda.client.CamundaClient;\nimport io.camunda.client.api.worker.JobWorker;\nimport java.util.List;\nimport java.util.concurrent.CountDownLatch;\nimport {pkg}.gen.Workers;\n\n/**\n * Written once. The client reads CAMUNDA_REST_ADDRESS, CAMUNDA_CLIENT_ID, CAMUNDA_CLIENT_SECRET,\n * CAMUNDA_AUTHORIZATION_SERVER_URL, CAMUNDA_TOKEN_AUDIENCE from the environment (default:\n * http://localhost:8080).\n */\npublic final class App {{\n    private App() {{}}\n\n    public static void main(String[] args) throws InterruptedException {{\n        CamundaClient client = CamundaClient.newClientBuilder().build();\n        List<JobWorker> workers = Workers.registerAll(client);\n        Runtime.getRuntime()\n            .addShutdownHook(\n                new Thread(\n                    () -> {{\n                        workers.forEach(JobWorker::close);\n                        client.close();\n                    }}));\n        new CountDownLatch(1).await();\n    }}\n}}\n")
    }
}

fn pom(artifact: &str, pkg: &str, spring: bool) -> String {
    let v = Versions::CAMUNDA;
    let (deps, plugin) = if spring {
        (
            format!("    <dependency>\n      <groupId>io.camunda</groupId>\n      <artifactId>camunda-spring-boot-starter</artifactId>\n      <version>{v}</version>\n    </dependency>\n    <dependency>\n      <groupId>org.springframework.boot</groupId>\n      <artifactId>spring-boot-starter-test</artifactId>\n      <version>{sb}</version>\n      <scope>test</scope>\n    </dependency>\n    <dependency>\n      <groupId>io.camunda</groupId>\n      <artifactId>camunda-process-test-spring</artifactId>\n      <version>{v}</version>\n      <scope>test</scope>\n    </dependency>\n", sb = Versions::SPRING_BOOT),
            format!("      <plugin>\n        <groupId>org.springframework.boot</groupId>\n        <artifactId>spring-boot-maven-plugin</artifactId>\n        <version>{sb}</version>\n        <configuration>\n          <mainClass>{pkg}.App</mainClass>\n        </configuration>\n        <executions>\n          <execution>\n            <goals>\n              <goal>repackage</goal>\n            </goals>\n          </execution>\n        </executions>\n      </plugin>\n", sb = Versions::SPRING_BOOT),
        )
    } else {
        (
            format!("    <dependency>\n      <groupId>io.camunda</groupId>\n      <artifactId>camunda-client-java</artifactId>\n      <version>{v}</version>\n    </dependency>\n    <dependency>\n      <groupId>org.slf4j</groupId>\n      <artifactId>slf4j-simple</artifactId>\n      <version>{s}</version>\n      <scope>runtime</scope>\n    </dependency>\n    <dependency>\n      <groupId>io.camunda</groupId>\n      <artifactId>camunda-process-test-java</artifactId>\n      <version>{v}</version>\n      <scope>test</scope>\n    </dependency>\n", s = Versions::SLF4J),
            format!("      <plugin>\n        <groupId>org.codehaus.mojo</groupId>\n        <artifactId>exec-maven-plugin</artifactId>\n        <version>{e}</version>\n        <configuration>\n          <mainClass>{pkg}.App</mainClass>\n        </configuration>\n      </plugin>\n", e = Versions::EXEC_PLUGIN),
        )
    };
    format!(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!-- Written once by bpmnkit; yours from now on. Versions are pinned exactly. -->\n<project xmlns=\"http://maven.apache.org/POM/4.0.0\"\n         xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n         xsi:schemaLocation=\"http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd\">\n  <modelVersion>4.0.0</modelVersion>\n\n  <groupId>{pkg}</groupId>\n  <artifactId>{artifact}</artifactId>\n  <version>0.1.0</version>\n\n  <properties>\n    <maven.compiler.release>21</maven.compiler.release>\n    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>\n    <project.build.outputTimestamp>2020-01-01T00:00:00Z</project.build.outputTimestamp>\n  </properties>\n\n  <dependencies>\n{deps}    <dependency>\n      <groupId>org.junit.jupiter</groupId>\n      <artifactId>junit-jupiter</artifactId>\n      <version>{j}</version>\n      <scope>test</scope>\n    </dependency>\n  </dependencies>\n\n  <build>\n    <plugins>\n      <plugin>\n        <groupId>org.apache.maven.plugins</groupId>\n        <artifactId>maven-compiler-plugin</artifactId>\n        <version>{c}</version>\n      </plugin>\n      <plugin>\n        <groupId>org.apache.maven.plugins</groupId>\n        <artifactId>maven-surefire-plugin</artifactId>\n        <version>{s}</version>\n      </plugin>\n{plugin}    </plugins>\n  </build>\n</project>\n",
        j = Versions::JUNIT,
        c = Versions::COMPILER_PLUGIN,
        s = Versions::SUREFIRE_PLUGIN,
    )
}

fn readme(name: &str, js: &[J], spring: bool) -> String {
    let run = if spring {
        "./mvnw spring-boot:run"
    } else {
        "./mvnw -q compile exec:java"
    };
    let mut s = format!(
        "# {name}\n\nCamunda 8 job workers generated by `bpmnkit worker gen --lang java{sp}`. No Maven install needed: `mvnw` is the Maven Wrapper (Java 21 required).\n\n```sh\n{run}        # start the workers (REST, CAMUNDA_REST_ADDRESS, default http://localhost:8080)\n./mvnw -B verify   # build and test (Camunda Process Test needs a Docker-compatible runtime)\n```\n\n## Job types\n\n",
        sp = if spring { " --spring" } else { "" },
    );
    for j in js {
        let _ = writeln!(
            s,
            "- `{}` → `handlers/{}Handler.java`",
            j.spec.job_type, j.class
        );
    }
    s.push_str(
        "\n## Ownership\n\n- `src/main/java/**/gen/` is overwritten by `bpmnkit worker gen` (`DO NOT EDIT`). Check drift in CI with `--check`.\n- Everything else (handlers, tests, `App.java`, `pom.xml`, the wrapper) is written once and never overwritten.\n- Delivery is at-least-once: handlers must be idempotent.\n",
    );
    s
}
