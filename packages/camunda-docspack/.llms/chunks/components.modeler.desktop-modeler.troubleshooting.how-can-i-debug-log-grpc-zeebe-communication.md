# Troubleshooting — How can I debug log gRPC / Zeebe communication?

You can also start Desktop Modeler with gRPC logging turned on to get detailed [logging output](#how-to-obtain-desktop-modeler-logs) on communication to Zeebe:

```plain
set DEBUG=* && set ZEEBE_NODE_LOG_LEVEL=DEBUG && set GRPC_VERBOSITY=DEBUG && set GRPC_TRACE=all && "Camunda Modeler.exe"
```

```plain
DEBUG=* ZEEBE_NODE_LOG_LEVEL=DEBUG GRPC_VERBOSITY=DEBUG GRPC_TRACE=all camunda-modeler
```

```plain
DEBUG=* ZEEBE_NODE_LOG_LEVEL=DEBUG GRPC_VERBOSITY=DEBUG GRPC_TRACE=all camunda-modeler
```


## Desktop Modeler does not start on Ubuntu 24 / modern Linux

Modern Linux operating systems introduce restrictions on user namespaces, a sandboxing (isolation) mechanism Modeler uses. You may see an error message when you start the application:

```sh
$ ./camunda-modeler
[46193:1114/170934.837319:FATAL:setuid_sandbox_host.cc(163)] The SUID sandbox helper binary was found, but is not configured correctly. Rather than run without sandboxing I'm aborting now. You need to make sure that [...]/camunda-modeler-[...]-linux-x64/chrome-sandbox is owned by root and has mode 4755.
zsh: trace trap (core dumped)  ./camunda-modeler
```

To remedy this, configure your system to allow sandboxing by [creating an AppArmor profile](https://github.com/camunda/camunda-modeler/issues/4695#issuecomment-2478458250), or review [this issue](https://github.com/camunda/camunda-modeler/issues/4695#issuecomment-2478581677) for an in-depth explanation of available options. If you don't have the necessary permissions to permit sandboxing, you may choose to disable the sandbox, though this is not recommended.

---
Source: https://docs.camunda.io/docs/next/components/modeler/desktop-modeler/troubleshooting
