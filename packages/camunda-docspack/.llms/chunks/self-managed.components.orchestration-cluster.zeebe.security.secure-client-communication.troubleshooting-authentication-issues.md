# Secure client communication — Troubleshooting authentication issues

The following are common ways clients and the gateway can be misconfigured for TLS, and how to recognize and fix each one.

**Note**
`zbctl` is a [community-supported client](https://github.com/camunda-community-hub/zeebe-client-go/blob/main/cmd/zbctl/zbctl.md).

### TLS is enabled in `zbctl` but disabled in the gateway

**Observed behavior:** The client fails with the following error:

```
Error: rpc error: code = Unavailable desc = all SubConns are in TransientFailure, latest connection error: connection error: desc = "transport: authentication handshake failed: tls: first record does not look like a TLS handshake"
```

The gateway logs the following error via Netty:

```
Aug 06, 2019 4:23:22 PM io.grpc.netty.NettyServerTransport notifyTerminated
INFO: Transport failed
io.netty.handler.codec.http2.Http2Exception: HTTP/2 client preface string missing or corrupt. Hex dump for received bytes: 1603010096010000920303d06091559c43ec48a18b50c028
  at io.netty.handler.codec.http2.Http2Exception.connectionError(Http2Exception.java:103)
  at io.netty.handler.codec.http2.Http2ConnectionHandler$PrefaceDecoder.readClientPrefaceString(Http2ConnectionHandler.java:306)
  at io.netty.handler.codec.http2.Http2ConnectionHandler$PrefaceDecoder.decode(Http2ConnectionHandler.java:239)
  at io.netty.handler.codec.http2.Http2ConnectionHandler.decode(Http2ConnectionHandler.java:438)
  at io.netty.handler.codec.ByteToMessageDecoder.decodeRemovalReentryProtection(ByteToMessageDecoder.java:505)
  at io.netty.handler.codec.ByteToMessageDecoder.callDecode(ByteToMessageDecoder.java:444)
  at io.netty.handler.codec.ByteToMessageDecoder.channelRead(ByteToMessageDecoder.java:283)
  at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:374)
  at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:360)
  at io.netty.channel.AbstractChannelHandlerContext.fireChannelRead(AbstractChannelHandlerContext.java:352)
  at io.netty.channel.DefaultChannelPipeline$HeadContext.channelRead(DefaultChannelPipeline.java:1421)
  at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:374)
  at io.netty.channel.AbstractChannelHandlerContext.invokeChannelRead(AbstractChannelHandlerContext.java:360)
  at io.netty.channel.DefaultChannelPipeline.fireChannelRead(DefaultChannelPipeline.java:930)
  at io.netty.channel.epoll.AbstractEpollStreamChannel$EpollStreamUnsafe.epollInReady(AbstractEpollStreamChannel.java:794)
  at io.netty.channel.epoll.EpollEventLoop.processReady(EpollEventLoop.java:424)
  at io.netty.channel.epoll.EpollEventLoop.run(EpollEventLoop.java:326)
  at io.netty.util.concurrent.SingleThreadEventExecutor$5.run(SingleThreadEventExecutor.java:918)
  at io.netty.util.internal.ThreadExecutorMap$2.run(ThreadExecutorMap.java:74)
  at io.netty.util.concurrent.FastThreadLocalRunnable.run(FastThreadLocalRunnable.java:30)
  at java.lang.Thread.run(Thread.java:748)
```

**Why this happens:** The client is attempting a TLS handshake, but the gateway isn't configured to accept one.

**How to fix:** Either enable TLS in the gateway as well, or specify the `--insecure` flag when using `zbctl`.

### TLS is disabled in `zbctl` but enabled for the gateway

**Observed behavior:** `zbctl` fails with the following error:

```
Error: rpc error: code = Unavailable desc = all SubConns are in TransientFailure, latest connection error: connection closed
```

**Why this happens:** The gateway expects a TLS handshake, but the client is connecting in plaintext.

**How to fix:** Either enable TLS in the client by specifying a path to a certificate, or disable it in the gateway by editing the appropriate configuration file.

### TLS is enabled for both client and gateway but the CA certificate can't be found

**Observed behavior:** `zbctl` fails with the following error:

```
Error: rpc error: code = Unavailable desc = all SubConns are in TransientFailure, latest connection error: connection error: desc = "transport: authentication handshake failed: x509: certificate signed by unknown authority
```

**Why this happens:** The client can't verify the gateway's certificate chain because it doesn't trust the certificate authority (CA) that issued it.

**How to fix:** Either install the CA certificate in the appropriate location for the system, or specify a path to the certificate using the methods described above.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-client-communication
