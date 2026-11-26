//! Outgoing `wasi:http`: only to the manifest's `host:port` entries, DNS resolved here, and never
//! to private, loopback or link-local addresses (SSRF and DNS rebinding). The connection goes to
//! the address that was checked, not to a second lookup.

use std::future::Future;
use std::io;
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr, SocketAddr, ToSocketAddrs};
use std::pin::Pin;
use std::sync::{Arc, LazyLock, Mutex};

use bpmnkit_wasm_contract::HttpStub;

use http::uri::Scheme;
use http_body_util::BodyExt;
use tokio::net::TcpStream;
use wasmtime_wasi_http::io::TokioIo;
use wasmtime_wasi_http::{Error, RequestOptions, WasiBody, WasiHttpHooks};

/// Host-side name resolution; a trait so tests can map names without a DNS server.
pub trait Resolver: Send + Sync {
    fn resolve(&self, host: &str, port: u16) -> io::Result<Vec<SocketAddr>>;
}

#[derive(Debug, Default, Clone, Copy)]
pub struct SystemResolver;
impl Resolver for SystemResolver {
    fn resolve(&self, host: &str, port: u16) -> io::Result<Vec<SocketAddr>> {
        Ok((host, port).to_socket_addrs()?.collect())
    }
}

/// How outgoing requests are resolved and filtered. The two `allow_*` switches exist for tests
/// against a local server; production keeps both `false`.
#[derive(Clone)]
pub struct NetPolicy {
    pub resolver: Arc<dyn Resolver>,
    pub allow_private_addrs: bool,
    pub allow_plain_http: bool,
}
impl Default for NetPolicy {
    fn default() -> Self {
        Self {
            resolver: Arc::new(SystemResolver),
            allow_private_addrs: false,
            allow_plain_http: false,
        }
    }
}

/// `host:port` the request targets, if the scheme and the allow-list permit it.
pub fn check_target(
    uri: &http::Uri,
    allow: &[String],
    policy: &NetPolicy,
) -> Result<(String, u16), Error> {
    let https = match uri.scheme() {
        Some(s) if *s == Scheme::HTTPS => true,
        Some(s) if *s == Scheme::HTTP && policy.allow_plain_http => false,
        _ => return Err(Error::HttpRequestDenied),
    };
    let host = uri
        .host()
        .ok_or(Error::HttpRequestUriInvalid)?
        .to_ascii_lowercase();
    let port = uri.port_u16().unwrap_or(if https { 443 } else { 80 });
    let key = format!("{host}:{port}");
    if allow.iter().any(|a| a.eq_ignore_ascii_case(&key)) {
        Ok((host, port))
    } else {
        Err(Error::HttpRequestDenied)
    }
}

/// Resolves and filters; any forbidden address rejects the whole name, so a record set mixing
/// public and private addresses cannot be used to reach the private one.
pub fn resolve_checked(
    host: &str,
    port: u16,
    policy: &NetPolicy,
) -> Result<Vec<SocketAddr>, Error> {
    let addrs = policy
        .resolver
        .resolve(host, port)
        .map_err(|_| Error::DestinationNotFound)?;
    if addrs.is_empty() {
        return Err(Error::DestinationNotFound);
    }
    if !policy.allow_private_addrs && addrs.iter().any(|a| is_forbidden(a.ip())) {
        return Err(Error::DestinationIpProhibited);
    }
    Ok(addrs)
}

/// Not a public unicast address.
pub fn is_forbidden(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => forbidden_v4(v4),
        IpAddr::V6(v6) => {
            if let Some(v4) = v6.to_ipv4_mapped() {
                return forbidden_v4(v4);
            }
            let s = v6.segments();
            v6.is_loopback()
                || v6.is_unspecified()
                || v6.is_multicast()
                || (s[0] & 0xfe00) == 0xfc00 // unique local fc00::/7
                || (s[0] & 0xffc0) == 0xfe80 // link-local fe80::/10
                || (s[0] & 0xffc0) == 0xfec0 // site-local (deprecated)
                || (s[0] == 0x2001 && s[1] == 0x0db8) // documentation
                // NAT64 64:ff9b::/96 and IPv4-compatible ::/96 embed an IPv4 address.
                || (s[0] == 0x64 && s[1] == 0xff9b && s[2..6] == [0; 4]
                    && forbidden_v4(embedded_v4(v6)))
                || (s[..6] == [0; 6] && forbidden_v4(embedded_v4(v6)))
        }
    }
}

fn embedded_v4(v6: Ipv6Addr) -> Ipv4Addr {
    let o = v6.octets();
    Ipv4Addr::new(o[12], o[13], o[14], o[15])
}

fn forbidden_v4(ip: Ipv4Addr) -> bool {
    let [a, b, c, _] = ip.octets();
    ip.is_private()
        || ip.is_loopback()
        || ip.is_link_local()
        || ip.is_unspecified()
        || ip.is_broadcast()
        || ip.is_documentation()
        || ip.is_multicast()
        || a == 0
        || (a == 100 && (64..128).contains(&b)) // shared address space (CGNAT)
        || (a == 192 && b == 0 && c == 0) // IETF protocol assignments
        || (a == 198 && (b == 18 || b == 19)) // benchmarking
        || a >= 240 // reserved
}

/// Canned responses for a test run: requests the allow-list permits are answered from here and
/// never reach the network; one with no matching stub fails and is recorded.
#[derive(Debug, Default)]
pub struct HttpStubs {
    stubs: Vec<HttpStub>,
    unmatched: Mutex<Vec<String>>,
}

impl HttpStubs {
    pub fn new(stubs: Vec<HttpStub>) -> Self {
        Self {
            stubs,
            unmatched: Mutex::default(),
        }
    }

    /// `METHOD url` of every request no stub answered, in order.
    pub fn unmatched(&self) -> Vec<String> {
        self.unmatched
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .clone()
    }

    /// Method case-insensitively; URL by scheme, host (case-insensitive), effective port and
    /// path with query, so `https://H:443/p` matches `https://h/p`.
    pub fn find(&self, method: &str, uri: &http::Uri) -> Option<&HttpStub> {
        let want = uri_key(uri)?;
        self.stubs.iter().find(|s| {
            s.method.eq_ignore_ascii_case(method)
                && s.url
                    .parse::<http::Uri>()
                    .ok()
                    .and_then(|u| uri_key(&u))
                    .as_ref()
                    == Some(&want)
        })
    }

    fn respond(&self, method: &str, uri: &http::Uri) -> Result<http::Response<WasiBody>, Error> {
        let Some(s) = self.find(method, uri) else {
            let what = format!("{method} {uri}");
            self.unmatched
                .lock()
                .unwrap_or_else(|e| e.into_inner())
                .push(what.clone());
            return Err(Error::InternalError(Some(format!(
                "no HTTP stub for {what}"
            ))));
        };
        let mut b = http::Response::builder().status(s.status);
        for (k, v) in &s.headers {
            b = b.header(k, v);
        }
        b.body(
            http_body_util::Full::new(hyper::body::Bytes::from(s.body.clone()))
                .map_err(|never| match never {})
                .boxed_unsync(),
        )
        .map_err(|e| Error::InternalError(Some(format!("bad HTTP stub for {method} {uri}: {e}"))))
    }
}

fn uri_key(u: &http::Uri) -> Option<(String, String, u16, String)> {
    let scheme = u.scheme_str()?.to_ascii_lowercase();
    let port = u
        .port_u16()
        .unwrap_or(if scheme == "https" { 443 } else { 80 });
    let path = u.path_and_query().map_or("/", |p| p.as_str()).to_owned();
    Some((scheme, u.host()?.to_ascii_lowercase(), port, path))
}

/// The per-store `wasi:http` hooks: the manifest's allow-list plus the host's net policy, and
/// stubs in place of the network for a test run.
pub(crate) struct Hooks {
    pub allow: Arc<[String]>,
    pub policy: NetPolicy,
    pub stubs: Option<Arc<HttpStubs>>,
}

type IoFuture = Box<dyn Future<Output = Result<(), Error>> + Send>;
type SendFuture =
    Box<dyn Future<Output = Result<(http::Response<WasiBody>, IoFuture), Error>> + Send>;

impl WasiHttpHooks for Hooks {
    fn send_request(
        &mut self,
        request: http::Request<WasiBody>,
        _options: Option<RequestOptions>,
        _fut: IoFuture,
    ) -> SendFuture {
        let allow = Arc::clone(&self.allow);
        let policy = self.policy.clone();
        let stubs = self.stubs.clone();
        Box::new(async move {
            let (host, port) = check_target(request.uri(), &allow, &policy).inspect_err(|_| {
                tracing::warn!(uri = %request.uri(), "outgoing request denied by the allow-list");
            })?;
            if let Some(stubs) = stubs {
                // Drain the request body first: answering while the guest is still writing
                // closes its stream mid-write (`StreamError::Closed`).
                let (parts, body) = request.into_parts();
                let _ = body.collect().await;
                let res = stubs.respond(parts.method.as_str(), &parts.uri)?;
                let io: IoFuture = Box::new(async { Ok(()) });
                return Ok((res, io));
            }
            let https = request.uri().scheme() == Some(&Scheme::HTTPS);
            let p = policy.clone();
            let h = host.clone();
            let addrs = tokio::task::spawn_blocking(move || resolve_checked(&h, port, &p))
                .await
                .map_err(|_| Error::DnsTimeout)??;
            send(request, &host, &addrs, https).await
        })
    }
}

/// The Mozilla roots, plus every certificate in `extra` (a PEM file). The extra file is how an
/// operator trusts a private CA or a TLS-intercepting egress proxy; it never replaces the roots.
fn root_store(extra: Option<&std::path::Path>) -> Result<rustls::RootCertStore, String> {
    use rustls::pki_types::{pem::PemObject, CertificateDer};
    let mut roots = rustls::RootCertStore {
        roots: webpki_roots::TLS_SERVER_ROOTS.into(),
    };
    let Some(path) = extra else {
        return Ok(roots);
    };
    let certs = CertificateDer::pem_file_iter(path)
        .and_then(|it| it.collect::<Result<Vec<_>, _>>())
        .map_err(|e| format!("{}: {e}", path.display()))?;
    let (added, _) = roots.add_parsable_certificates(certs);
    if added == 0 {
        return Err(format!("{}: no certificates", path.display()));
    }
    Ok(roots)
}

static TLS: LazyLock<Arc<rustls::ClientConfig>> = LazyLock::new(|| {
    let extra = std::env::var_os("SSL_CERT_FILE").map(std::path::PathBuf::from);
    let roots = root_store(extra.as_deref()).unwrap_or_else(|e| {
        eprintln!("bpmnkit-wasm-host: SSL_CERT_FILE ignored: {e}");
        root_store(None).expect("built-in roots")
    });
    Arc::new(
        rustls::ClientConfig::builder_with_provider(Arc::new(
            rustls::crypto::ring::default_provider(),
        ))
        .with_safe_default_protocol_versions()
        .expect("ring supports the default protocol versions")
        .with_root_certificates(roots)
        .with_no_client_auth(),
    )
});

trait Stream: tokio::io::AsyncRead + tokio::io::AsyncWrite + Send + Unpin + 'static {}
impl<T: tokio::io::AsyncRead + tokio::io::AsyncWrite + Send + Unpin + 'static> Stream for T {}

async fn send(
    mut req: http::Request<WasiBody>,
    host: &str,
    addrs: &[SocketAddr],
    https: bool,
) -> Result<(http::Response<WasiBody>, IoFuture), Error> {
    let tcp = TcpStream::connect(addrs).await.map_err(Error::Connect)?;
    let stream: Pin<Box<dyn Stream>> = if https {
        let name = rustls::pki_types::ServerName::try_from(host.to_owned())
            .map_err(Error::InvalidDnsNameError)?;
        let tls = tokio_rustls::TlsConnector::from(Arc::clone(&TLS))
            .connect(name, tcp)
            .await
            .map_err(Error::Tls)?;
        Box::pin(tls)
    } else {
        Box::pin(tcp)
    };
    let (mut sender, conn) = hyper::client::conn::http1::handshake(TokioIo::new(stream))
        .await
        .map_err(Error::from)?;
    let conn = tokio::spawn(conn);
    // Origin-form on the wire; scheme and authority are only for proxies.
    *req.uri_mut() = http::Uri::builder()
        .path_and_query(
            req.uri()
                .path_and_query()
                .map_or("/", |p| p.as_str())
                .to_owned(),
        )
        .build()
        .map_err(|_| Error::HttpRequestUriInvalid)?;
    let res = sender.send_request(req).await.map_err(Error::from)?;
    let io: IoFuture = Box::new(async move {
        match conn.await {
            Ok(r) => r.map_err(Error::from),
            Err(_) => Err(Error::ConnectionTerminated),
        }
    });
    Ok((res.map(|b| b.map_err(Error::from).boxed_unsync()), io))
}

#[cfg(test)]
mod tests {
    #[test]
    fn extra_roots_come_from_a_pem_file() {
        let dir = std::env::temp_dir().join(format!("bpmnkit-roots-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        let pem = dir.join("ca.pem");
        std::fs::write(&pem, include_str!("testdata/isrg-root-x1.pem")).unwrap();
        let base = webpki_roots::TLS_SERVER_ROOTS.len();
        assert_eq!(super::root_store(None).unwrap().len(), base);
        assert_eq!(super::root_store(Some(&pem)).unwrap().len(), base + 1);

        let empty = dir.join("empty.pem");
        std::fs::write(&empty, "not a certificate").unwrap();
        assert!(super::root_store(Some(&empty)).is_err());
        assert!(super::root_store(Some(&dir.join("missing.pem"))).is_err());
        std::fs::remove_dir_all(&dir).unwrap();
    }

    use super::*;

    struct Fixed(Vec<IpAddr>);
    impl Resolver for Fixed {
        fn resolve(&self, _: &str, port: u16) -> io::Result<Vec<SocketAddr>> {
            Ok(self.0.iter().map(|ip| SocketAddr::new(*ip, port)).collect())
        }
    }
    fn policy(ips: &[&str]) -> NetPolicy {
        NetPolicy {
            resolver: Arc::new(Fixed(ips.iter().map(|s| s.parse().unwrap()).collect())),
            ..NetPolicy::default()
        }
    }
    fn allow() -> Vec<String> {
        vec!["api.example.com:443".into()]
    }

    #[test]
    fn allow_list_is_exact_host_and_port() {
        let p = policy(&[]);
        let ok = |u: &str| check_target(&u.parse().unwrap(), &allow(), &p);
        assert_eq!(
            ok("https://api.example.com/v1").unwrap(),
            ("api.example.com".into(), 443)
        );
        assert_eq!(
            ok("https://API.example.com:443/").unwrap().0,
            "api.example.com"
        );
        for bad in [
            "https://api.example.com:8443/",
            "https://evil.example.com/",
            "https://api.example.com.evil.net/",
            "http://api.example.com:443/",
            "https://127.0.0.1/",
        ] {
            assert!(
                matches!(ok(bad), Err(Error::HttpRequestDenied)),
                "{bad} must be denied"
            );
        }
    }

    fn stub(method: &str, url: &str, status: u16) -> HttpStub {
        HttpStub {
            method: method.into(),
            url: url.into(),
            status,
            headers: [("x-a".to_string(), "1".to_string())].into(),
            body: "{\"id\":1}".into(),
        }
    }

    async fn send_with(stubs: &Arc<HttpStubs>, method: &str, url: &str) -> Result<(), Error> {
        let mut hooks = Hooks {
            allow: Arc::from(allow()),
            // A resolver that panics: the stub path must never look a name up.
            policy: NetPolicy {
                resolver: Arc::new(Panics),
                ..NetPolicy::default()
            },
            stubs: Some(Arc::clone(stubs)),
        };
        let req = http::Request::builder()
            .method(method)
            .uri(url)
            .body(
                http_body_util::Empty::<hyper::body::Bytes>::new()
                    .map_err(|never| match never {})
                    .boxed_unsync(),
            )
            .unwrap();
        let (res, io) =
            Pin::from(hooks.send_request(req, None, Box::new(async { Ok(()) }))).await?;
        // The stub's status reaches the guest unchanged.
        assert!(res.status().as_u16() >= 200);
        Pin::from(io).await?;
        assert_eq!(res.headers()["x-a"], "1");
        let body = res.into_body().collect().await?.to_bytes();
        assert_eq!(&body[..], b"{\"id\":1}");
        Ok(())
    }

    struct Panics;
    impl Resolver for Panics {
        fn resolve(&self, h: &str, _: u16) -> io::Result<Vec<SocketAddr>> {
            panic!("resolved {h}")
        }
    }

    #[tokio::test]
    async fn stubs_answer_matching_requests() {
        let s = Arc::new(HttpStubs::new(vec![
            stub("GET", "https://api.example.com/x", 404),
            stub("post", "https://API.example.com:443/v1?a=1", 402),
        ]));
        assert_eq!(
            s.find("POST", &"https://api.example.com/v1?a=1".parse().unwrap())
                .map(|s| s.status),
            Some(402)
        );
        assert!(send_with(&s, "POST", "https://api.example.com/v1?a=1")
            .await
            .is_ok());
        assert!(s.unmatched().is_empty());
    }

    #[tokio::test]
    async fn unmatched_request_names_the_url() {
        let s = Arc::new(HttpStubs::new(vec![stub(
            "GET",
            "https://api.example.com/x",
            200,
        )]));
        let e = send_with(&s, "POST", "https://api.example.com/x")
            .await
            .unwrap_err();
        assert!(
            e.to_string().contains("POST https://api.example.com/x"),
            "{e}"
        );
        assert!(send_with(&s, "GET", "https://api.example.com/y")
            .await
            .is_err());
        assert_eq!(
            s.unmatched(),
            [
                "POST https://api.example.com/x",
                "GET https://api.example.com/y"
            ]
        );
    }

    #[tokio::test]
    async fn allow_list_applies_before_stubs() {
        let s = Arc::new(HttpStubs::new(vec![stub(
            "GET",
            "https://evil.example.com/",
            200,
        )]));
        assert!(matches!(
            send_with(&s, "GET", "https://evil.example.com/").await,
            Err(Error::HttpRequestDenied)
        ));
        // Denied before matching, so it is not reported as a missing stub either.
        assert!(s.unmatched().is_empty());
    }

    #[test]
    fn private_addresses_are_rejected() {
        for ip in [
            "127.0.0.1",
            "10.1.2.3",
            "172.16.0.1",
            "192.168.1.1",
            "169.254.169.254",
            "100.64.0.1",
            "0.0.0.0",
            "::1",
            "fd00::1",
            "fe80::1",
            "::ffff:10.0.0.1",
            "64:ff9b::a00:1",
        ] {
            assert!(
                matches!(
                    resolve_checked("h", 443, &policy(&[ip])),
                    Err(Error::DestinationIpProhibited)
                ),
                "{ip} must be rejected"
            );
        }
        // One private record poisons the set.
        assert!(resolve_checked("h", 443, &policy(&["93.184.216.34", "10.0.0.1"])).is_err());
        assert!(resolve_checked("h", 443, &policy(&["93.184.216.34", "2606:2800::1"])).is_ok());
        assert!(matches!(
            resolve_checked("h", 443, &policy(&[])),
            Err(Error::DestinationNotFound)
        ));
    }
}
