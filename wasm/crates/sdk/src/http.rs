//! Blocking HTTP client over `wasi:http`. Only hosts in the manifest's `[network] allow` list are
//! reachable; the host denies the rest (returned as [`Error::Transport`]).
//!
//! ```text
//! let r = http::post("https://api.stripe.com/v1/charges")
//!     .bearer(&key)
//!     .form(&[("amount", "500"), ("currency", "eur")])
//!     .send()?;
//! if r.status() == 200 { let body: Value = r.json()?; }
//! ```

use serde::{de::DeserializeOwned, Serialize};
use std::fmt;

/// Response bodies above this are an error: the store's memory limit would trap anyway.
pub const MAX_BODY_BYTES: usize = 16 * 1024 * 1024;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Error {
    InvalidUrl(String),
    InvalidHeader(String),
    Body(String),
    /// The host refused or the request failed (denied host, DNS, TLS, timeout, …).
    Transport(String),
    TooLarge,
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidUrl(m) => write!(f, "invalid URL: {m}"),
            Self::InvalidHeader(m) => write!(f, "invalid header: {m}"),
            Self::Body(m) => write!(f, "body: {m}"),
            Self::Transport(m) => write!(f, "request failed: {m}"),
            Self::TooLarge => write!(f, "response body larger than {MAX_BODY_BYTES} bytes"),
        }
    }
}

impl std::error::Error for Error {}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Method {
    Get,
    Head,
    Post,
    Put,
    Patch,
    Delete,
    Options,
}

pub fn get(url: &str) -> Request {
    Request::new(Method::Get, url)
}
pub fn head(url: &str) -> Request {
    Request::new(Method::Head, url)
}
pub fn post(url: &str) -> Request {
    Request::new(Method::Post, url)
}
pub fn put(url: &str) -> Request {
    Request::new(Method::Put, url)
}
pub fn patch(url: &str) -> Request {
    Request::new(Method::Patch, url)
}
pub fn delete(url: &str) -> Request {
    Request::new(Method::Delete, url)
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct Url {
    pub https: bool,
    /// `host` or `host:port`, as given.
    pub authority: String,
    /// Path and query, at least `/`.
    pub path_with_query: String,
}

pub(crate) fn parse_url(url: &str) -> Result<Url, Error> {
    let bad = |m: &str| Error::InvalidUrl(format!("{m}: {url}"));
    let (https, rest) = if let Some(r) = url.strip_prefix("https://") {
        (true, r)
    } else if let Some(r) = url.strip_prefix("http://") {
        (false, r)
    } else {
        return Err(bad("scheme must be http or https"));
    };
    let rest = rest.split('#').next().unwrap_or_default();
    let split = rest.find(['/', '?']).unwrap_or(rest.len());
    let (authority, pq) = rest.split_at(split);
    if authority.is_empty() {
        return Err(bad("missing host"));
    }
    // Userinfo would hide the real host from a reader of the source.
    if authority.contains('@') || authority.chars().any(char::is_whitespace) {
        return Err(bad("host must be plain `host` or `host:port`"));
    }
    let path_with_query = match pq.chars().next() {
        None => "/".into(),
        Some('?') => format!("/{pq}"),
        _ => pq.into(),
    };
    Ok(Url {
        https,
        authority: authority.into(),
        path_with_query,
    })
}

/// `application/x-www-form-urlencoded`.
pub(crate) fn form_encode(pairs: &[(&str, &str)]) -> String {
    fn enc(s: &str, out: &mut String) {
        for b in s.bytes() {
            match b {
                b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'.' | b'_' | b'*' => {
                    out.push(b as char)
                }
                b' ' => out.push('+'),
                _ => out.push_str(&format!("%{b:02X}")),
            }
        }
    }
    let mut out = String::new();
    for (i, (k, v)) in pairs.iter().enumerate() {
        if i > 0 {
            out.push('&');
        }
        enc(k, &mut out);
        out.push('=');
        enc(v, &mut out);
    }
    out
}

/// A request being built. Errors from the builder steps surface from [`Request::send`].
#[derive(Debug, Clone)]
pub struct Request {
    pub(crate) method: Method,
    pub(crate) url: String,
    pub(crate) headers: Vec<(String, String)>,
    pub(crate) body: Vec<u8>,
    pub(crate) error: Option<Error>,
}

impl Request {
    pub fn new(method: Method, url: &str) -> Self {
        Self {
            method,
            url: url.into(),
            headers: Vec::new(),
            body: Vec::new(),
            error: None,
        }
    }

    /// Sets a header, replacing an earlier one with the same name (case-insensitive).
    pub fn header(mut self, name: &str, value: &str) -> Self {
        let valid_name = !name.is_empty()
            && name
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b"!#$%&'*+-.^_`|~".contains(&b));
        if !valid_name || value.bytes().any(|b| b == b'\r' || b == b'\n') {
            self.error
                .get_or_insert(Error::InvalidHeader(format!("{name}: {value}")));
            return self;
        }
        self.headers.retain(|(k, _)| !k.eq_ignore_ascii_case(name));
        self.headers.push((name.into(), value.into()));
        self
    }

    pub fn bearer(self, token: &str) -> Self {
        self.header("authorization", &format!("Bearer {token}"))
    }

    /// JSON body with `content-type: application/json`.
    pub fn json<T: Serialize + ?Sized>(mut self, body: &T) -> Self {
        match serde_json::to_vec(body) {
            Ok(b) => {
                self.body = b;
                self.header("content-type", "application/json")
            }
            Err(e) => {
                self.error.get_or_insert(Error::Body(e.to_string()));
                self
            }
        }
    }

    /// Form body with `content-type: application/x-www-form-urlencoded`.
    pub fn form(mut self, pairs: &[(&str, &str)]) -> Self {
        self.body = form_encode(pairs).into_bytes();
        self.header("content-type", "application/x-www-form-urlencoded")
    }

    /// Raw body; set `content-type` yourself.
    pub fn body(mut self, bytes: impl Into<Vec<u8>>) -> Self {
        self.body = bytes.into();
        self
    }

    pub fn send(self) -> Result<Response, Error> {
        if let Some(e) = self.error {
            return Err(e);
        }
        let url = parse_url(&self.url)?;
        transport::send(self.method, &url, &self.headers, &self.body)
    }
}

#[derive(Debug, Clone)]
pub struct Response {
    status: u16,
    headers: Vec<(String, String)>,
    body: Vec<u8>,
}

impl Response {
    pub fn status(&self) -> u16 {
        self.status
    }
    pub fn is_success(&self) -> bool {
        (200..300).contains(&self.status)
    }
    /// First header with this name (case-insensitive).
    pub fn header(&self, name: &str) -> Option<&str> {
        self.headers
            .iter()
            .find(|(k, _)| k.eq_ignore_ascii_case(name))
            .map(|(_, v)| v.as_str())
    }
    pub fn headers(&self) -> &[(String, String)] {
        &self.headers
    }
    pub fn bytes(&self) -> &[u8] {
        &self.body
    }
    pub fn text(&self) -> Result<String, Error> {
        String::from_utf8(self.body.clone()).map_err(|e| Error::Body(e.to_string()))
    }
    pub fn json<T: DeserializeOwned>(&self) -> Result<T, Error> {
        serde_json::from_slice(&self.body).map_err(|e| Error::Body(e.to_string()))
    }
}

mod transport {
    use super::{Error, Method, Response, Url, MAX_BODY_BYTES};
    use crate::bindings::wasi::http::outgoing_handler;
    use crate::bindings::wasi::http::types::{
        Fields, IncomingBody, Method as M, OutgoingBody, OutgoingRequest, Scheme,
    };
    use crate::bindings::wasi::io::streams::StreamError;

    pub(super) fn send(
        method: Method,
        url: &Url,
        headers: &[(String, String)],
        body: &[u8],
    ) -> Result<Response, Error> {
        let fields: Vec<(String, Vec<u8>)> = headers
            .iter()
            .map(|(k, v)| (k.clone(), v.clone().into_bytes()))
            .collect();
        let fields =
            Fields::from_list(&fields).map_err(|e| Error::InvalidHeader(format!("{e:?}")))?;
        let req = OutgoingRequest::new(fields);
        let m = match method {
            Method::Get => M::Get,
            Method::Head => M::Head,
            Method::Post => M::Post,
            Method::Put => M::Put,
            Method::Patch => M::Patch,
            Method::Delete => M::Delete,
            Method::Options => M::Options,
        };
        let scheme = if url.https {
            Scheme::Https
        } else {
            Scheme::Http
        };
        let set = req
            .set_method(&m)
            .and(req.set_scheme(Some(&scheme)))
            .and(req.set_authority(Some(&url.authority)))
            .and(req.set_path_with_query(Some(&url.path_with_query)));
        set.map_err(|()| Error::InvalidUrl(url.authority.clone()))?;

        let out_body = req
            .body()
            .map_err(|()| Error::Body("request body taken".into()))?;
        let future =
            outgoing_handler::handle(req, None).map_err(|e| Error::Transport(format!("{e:?}")))?;
        {
            let stream = out_body
                .write()
                .map_err(|()| Error::Body("request stream taken".into()))?;
            // blocking-write-and-flush accepts at most 4096 bytes per call.
            for chunk in body.chunks(4096) {
                stream
                    .blocking_write_and_flush(chunk)
                    .map_err(|e| Error::Transport(format!("{e:?}")))?;
            }
        }
        OutgoingBody::finish(out_body, None).map_err(|e| Error::Transport(format!("{e:?}")))?;

        let resp = loop {
            if let Some(r) = future.get() {
                break r;
            }
            future.subscribe().block();
        };
        let resp = resp
            .map_err(|()| Error::Transport("response already taken".into()))?
            .map_err(|e| Error::Transport(format!("{e:?}")))?;

        let status = resp.status();
        let headers = resp
            .headers()
            .entries()
            .into_iter()
            .map(|(k, v)| (k, String::from_utf8_lossy(&v).into_owned()))
            .collect();
        let in_body = resp
            .consume()
            .map_err(|()| Error::Body("response body taken".into()))?;
        let mut buf = Vec::new();
        {
            let stream = in_body
                .stream()
                .map_err(|()| Error::Body("response stream taken".into()))?;
            loop {
                match stream.blocking_read(64 * 1024) {
                    Ok(chunk) => {
                        buf.extend_from_slice(&chunk);
                        if buf.len() > MAX_BODY_BYTES {
                            return Err(Error::TooLarge);
                        }
                    }
                    Err(StreamError::Closed) => break,
                    Err(StreamError::LastOperationFailed(e)) => {
                        return Err(Error::Transport(e.to_debug_string()))
                    }
                }
            }
        }
        drop(IncomingBody::finish(in_body));
        Ok(Response {
            status,
            headers,
            body: buf,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn url_parts() {
        let u = parse_url("https://api.stripe.com/v1/charges?x=1#frag").unwrap();
        assert_eq!(
            u,
            Url {
                https: true,
                authority: "api.stripe.com".into(),
                path_with_query: "/v1/charges?x=1".into()
            }
        );
        let u = parse_url("http://h:8080").unwrap();
        assert_eq!(
            (u.https, u.authority.as_str(), u.path_with_query.as_str()),
            (false, "h:8080", "/")
        );
        assert_eq!(parse_url("https://h?q=1").unwrap().path_with_query, "/?q=1");
    }

    #[test]
    fn url_rejects() {
        for u in [
            "ftp://h/",
            "https://",
            "https:///p",
            "https://u:p@h/",
            "h/p",
            "https://a b/",
        ] {
            assert!(matches!(parse_url(u), Err(Error::InvalidUrl(_))), "{u}");
        }
    }

    #[test]
    fn form_encoding() {
        assert_eq!(
            form_encode(&[("customer", "c 1"), ("note", "a&b=ü"), ("x", "-._*~")]),
            "customer=c+1&note=a%26b%3D%C3%BC&x=-._*%7E"
        );
        assert_eq!(form_encode(&[]), "");
    }

    #[test]
    fn builder_sets_body_and_headers() {
        let r = post("https://h/")
            .bearer("t")
            .json(&serde_json::json!({"a": 1}));
        assert_eq!(r.method, Method::Post);
        assert_eq!(r.body, br#"{"a":1}"#);
        assert_eq!(
            r.headers,
            [
                ("authorization".into(), "Bearer t".into()),
                ("content-type".into(), "application/json".into())
            ]
        );
        let r = put("https://h/").json(&1).form(&[("a", "b")]);
        assert_eq!(r.body, b"a=b");
        assert_eq!(
            r.headers,
            [(
                "content-type".into(),
                "application/x-www-form-urlencoded".into()
            )]
        );
    }

    #[test]
    fn header_replaces_case_insensitively() {
        let r = get("https://h/").header("X-A", "1").header("x-a", "2");
        assert_eq!(r.headers, [("x-a".into(), "2".into())]);
    }

    #[test]
    fn invalid_header_and_url_surface_from_send() {
        let e = get("https://h/")
            .header("bad name", "v")
            .send()
            .unwrap_err();
        assert!(matches!(e, Error::InvalidHeader(_)), "{e}");
        let e = get("https://h/").header("x", "a\r\nb").send().unwrap_err();
        assert!(matches!(e, Error::InvalidHeader(_)), "{e}");
        let e = get("nope").send().unwrap_err();
        assert_eq!(
            e.to_string(),
            "invalid URL: scheme must be http or https: nope"
        );
    }

    #[test]
    fn response_accessors() {
        let r = Response {
            status: 201,
            headers: vec![("Content-Type".into(), "application/json".into())],
            body: br#"{"id":"x"}"#.to_vec(),
        };
        assert!(r.is_success());
        assert_eq!(r.header("content-type"), Some("application/json"));
        assert_eq!(r.json::<serde_json::Value>().unwrap()["id"], "x");
        assert_eq!(r.text().unwrap(), r#"{"id":"x"}"#);
        assert!(matches!(r.json::<u8>(), Err(Error::Body(_))));
    }
}
