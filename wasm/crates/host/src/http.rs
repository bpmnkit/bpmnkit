//! Outgoing `wasi:http`: only to the manifest's `host:port` entries, DNS resolved here, and never
//! to private, loopback or link-local addresses (SSRF and DNS rebinding). The connection goes to
//! the address that was checked, not to a second lookup.

use std::future::Future;
use std::io;
use std::net::{IpAddr, Ipv4Addr, Ipv6Addr, SocketAddr, ToSocketAddrs};
use std::pin::Pin;
use std::sync::{Arc, LazyLock};

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

/// The per-store `wasi:http` hooks: the manifest's allow-list plus the host's net policy.
pub(crate) struct Hooks {
    pub allow: Arc<[String]>,
    pub policy: NetPolicy,
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
        Box::new(async move {
            let (host, port) = check_target(request.uri(), &allow, &policy).inspect_err(|_| {
                tracing::warn!(uri = %request.uri(), "outgoing request denied by the allow-list");
            })?;
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

static TLS: LazyLock<Arc<rustls::ClientConfig>> = LazyLock::new(|| {
    let roots = rustls::RootCertStore {
        roots: webpki_roots::TLS_SERVER_ROOTS.into(),
    };
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
