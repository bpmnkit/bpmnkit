# Development workflows — Deploy

Deploy resources to the active cluster.

**Note**
When more than one profile is configured and you don't pass `--profile`, `c8ctl` prompts you to confirm which cluster to deploy to — a safety check against deploying to the wrong environment. Pass `--yes` (or `-y`) to skip the prompt in scripts and CI.

### Deploy a single file

```bash
c8 deploy ./process.bpmn
c8 deploy ./decision.dmn
c8 deploy ./form.form
```

### Deploy multiple files

```bash
c8 deploy ./process1.bpmn ./process2.bpmn ./decision.dmn
```

### Deploy a directory

```bash
# Deploy all resources in the current directory and subdirectories
c8 deploy

# Deploy all resources in a specific directory
c8 deploy ./my-project
```

When scanning directories, `c8ctl` includes files with the following extensions by default:

`.bpmn`, `.dmn`, `.form`

Use `--extensions` to add more types to the directory scan (merged with the defaults):

```bash
c8 deploy ./my-project --extensions=.md,.txt
```

Use `--all-extensions` to include every server-supported type (`.md`, `.txt`, `.xml`, `.rpa`, `.json`, `.config`, `.yml`, `.yaml`) without naming each one:

```bash
c8 deploy ./my-project --all-extensions
```

Explicitly named files are always deployed regardless of extension — the extension filter only applies when scanning directories:

```bash
c8 deploy ./custom-resource.unsupported
```

Use `--force` to disable extension filtering during directory discovery, deploying every file found regardless of extension:

```bash
c8 deploy ./my-project --force
```

### Building blocks and process applications

`c8ctl` recognizes two special folder conventions during deployment:

- Building blocks — folders containing `_bb-` in their name. These are deployed first.
- Process applications — folders containing a `.process-application` marker file.

```text
my-project/
├── _bb-shared/
│   ├── common.bpmn
│   └── nested/
│       └── util.bpmn
├── my-app/
│   ├── .process-application
│   ├── process.bpmn
│   └── subfolder/
│       └── form.form
└── standalone.bpmn
```

```bash
c8 deploy ./my-project
```

```text
Deploying 5 resource(s)...
✓ Deployment successful [Key: 123456789]

File                            | Type    | ID         | Version | Key
--------------------------------|---------|------------|---------|-------------------
_bb-shared/common.bpmn          | Process | common     | 1       | 2251799813685249
_bb-shared/nested/util.bpmn     | Process | util       | 1       | 2251799813685250
 my-app/process.bpmn            | Process | my-proc    | 1       | 2251799813685251
 my-app/subfolder/form.form     | Form    | form-id    | 1       | 2251799813685252
 standalone.bpmn                | Process | standalone | 1       | 2251799813685253
```

Building block resources are listed first, followed by process application resources, then standalone resources.

### Duplicate process ID detection

Camunda does not allow deploying multiple resources with the same process or decision ID in a single deployment. `c8ctl` detects duplicate IDs before sending the request and shows a clear error message indicating which files conflict.

If you have files that share the same ID, deploy them separately:

```bash
c8 deploy process-v1.bpmn
c8 deploy process-v2.bpmn
```

### Exclude files with `.c8ignore`

Create a `.c8ignore` file in your project directory to exclude files and directories from deployment and watch scanning. The format follows the same pattern syntax as `.gitignore`:

```text
# Exclude test resources
tests/

# Exclude work-in-progress files
wip-*.bpmn

# Exclude a specific file
old-process.bpmn
```

Place the `.c8ignore` file in the root of the directory you pass to `c8 deploy` or `c8 watch`. Patterns are matched against relative file paths within that directory.

---
Source: https://docs.camunda.io/docs/next/apis-tools/c8ctl/development-workflows
