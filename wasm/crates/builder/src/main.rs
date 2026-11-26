//! `bpmnkit-wasm-builder`: the worker build service, and `keygen` for its signing key.

use std::fs;
use std::path::{Path, PathBuf};
use std::process::ExitCode;

use bpmnkit_wasm_build::{LocalExecutor, Toolchain};
use bpmnkit_wasm_builder::{
    detect, random_bytes, router, warm, Builder, Caps, Config, Isolation, RateConfig,
    SandboxExecutor, Tokens,
};
use bpmnkit_wasm_contract::{encode_hex, signing_key_from_hex, DirRegistry, SigningKey};

const USAGE: &str = "\
bpmnkit-wasm-builder <command> [options]

  serve --registry DIR --signing-key FILE   run the build service (token: env BPMNKIT_BUILDER_TOKEN,
                                            comma-separated `caller=token` or `token`, >= 16 chars)
      --listen ADDR        default 127.0.0.1:8787
      --max-builds N       concurrent cargo runs, default 2
      --rate-burst N       per caller, default 10      --rate-per-min N   refill, default 30
      --warm               pre-build the dependency set into the shared target dir at start
      --sdk PATH           (env BPMNKIT_WASM_SDK)       --target-dir PATH  shared target dir
      --work-dir PATH      rendered projects            --lockfile PATH    curated Cargo.lock
      --offline            cargo --offline (always on inside bwrap: no network there)
  keygen [--key FILE] [--pub FILE]          new ed25519 key pair as hex (default key.hex, pub.hex)

endpoints: POST /check, POST /builds -> {id}, GET /builds/{id}, GET /builds/{id}/events (NDJSON),
           GET /healthz";

#[derive(Default)]
struct Opts {
    flags: Vec<(String, Option<String>)>,
}
impl Opts {
    fn get(&self, k: &str) -> Option<&str> {
        self.flags
            .iter()
            .rev()
            .find(|(f, _)| f == k)
            .and_then(|(_, v)| v.as_deref())
    }
    fn has(&self, k: &str) -> bool {
        self.flags.iter().any(|(f, _)| f == k)
    }
    fn num<T: std::str::FromStr>(&self, k: &str, default: T) -> Result<T, String> {
        self.get(k).map_or(Ok(default), |v| {
            v.parse().map_err(|_| format!("{k}: `{v}` is not a number"))
        })
    }
}

const SWITCHES: &[&str] = &["--warm", "--offline"];
const VALUED: &[&str] = &[
    "--registry",
    "--signing-key",
    "--listen",
    "--max-builds",
    "--rate-burst",
    "--rate-per-min",
    "--sdk",
    "--target-dir",
    "--work-dir",
    "--lockfile",
    "--key",
    "--pub",
];

fn parse(args: &[String]) -> Result<Opts, String> {
    let mut o = Opts::default();
    let mut it = args.iter();
    while let Some(a) = it.next() {
        if SWITCHES.contains(&a.as_str()) {
            o.flags.push((a.clone(), None));
        } else if VALUED.contains(&a.as_str()) {
            let v = it.next().ok_or(format!("{a} needs a value"))?;
            o.flags.push((a.clone(), Some(v.clone())));
        } else {
            return Err(format!("unknown argument `{a}`"));
        }
    }
    Ok(o)
}

fn cache_dir() -> Option<PathBuf> {
    std::env::var_os("XDG_CACHE_HOME")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|h| Path::new(&h).join(".cache")))
}

fn mkdir(p: &Path) -> Result<PathBuf, String> {
    fs::create_dir_all(p).map_err(|e| format!("{}: {e}", p.display()))?;
    fs::canonicalize(p).map_err(|e| format!("{}: {e}", p.display()))
}

fn toolchain(o: &Opts) -> Result<Toolchain, String> {
    let sdk = o
        .get("--sdk")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("BPMNKIT_WASM_SDK").map(Into::into))
        .or_else(Toolchain::in_repo_sdk)
        .ok_or("cannot find the SDK crate: pass --sdk or set BPMNKIT_WASM_SDK")?;
    let mut tc =
        Toolchain::local(fs::canonicalize(&sdk).map_err(|e| format!("{}: {e}", sdk.display()))?);
    let target = o
        .get("--target-dir")
        .map(PathBuf::from)
        .or_else(|| cache_dir().map(|c| c.join("bpmnkit-wasm/builder-target")))
        .ok_or("cannot pick a target dir: pass --target-dir")?;
    tc.target_dir = Some(mkdir(&target)?);
    tc.work_root = mkdir(
        &o.get("--work-dir")
            .map_or_else(|| tc.work_root.clone(), PathBuf::from),
    )?;
    tc.lockfile = o.get("--lockfile").map(PathBuf::from);
    tc.offline = o.has("--offline");
    Ok(tc)
}

fn read_key(p: &str) -> Result<SigningKey, String> {
    let t = fs::read_to_string(p).map_err(|e| format!("{p}: {e}"))?;
    signing_key_from_hex(&t).map_err(|e| format!("{p}: {e}"))
}

fn keygen(o: &Opts) -> Result<(), String> {
    let (kp, pp) = (
        o.get("--key").unwrap_or("key.hex"),
        o.get("--pub").unwrap_or("pub.hex"),
    );
    for p in [kp, pp] {
        if Path::new(p).exists() {
            return Err(format!("{p} exists; not overwriting"));
        }
    }
    let seed = random_bytes(32).map_err(|e| format!("random: {e}"))?;
    let key = SigningKey::from_bytes(&seed.try_into().expect("32 bytes"));
    let write = |p: &str, hex: String, mode: u32| -> Result<(), String> {
        use std::io::Write;
        #[cfg(unix)]
        use std::os::unix::fs::OpenOptionsExt;
        let mut opts = fs::OpenOptions::new();
        opts.write(true).create_new(true);
        #[cfg(unix)]
        opts.mode(mode);
        let mut f = opts.open(p).map_err(|e| format!("{p}: {e}"))?;
        writeln!(f, "{hex}").map_err(|e| format!("{p}: {e}"))
    };
    write(kp, encode_hex(&key.to_bytes()), 0o600)?;
    write(pp, encode_hex(key.verifying_key().as_bytes()), 0o644)?;
    println!("wrote {kp} (keep secret) and {pp} (give to bpmnkit-wasm-host --trusted-key)");
    Ok(())
}

fn cargo_home() -> Option<PathBuf> {
    std::env::var_os("CARGO_HOME")
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|h| Path::new(&h).join(".cargo")))
}

async fn serve(o: &Opts) -> Result<(), String> {
    let tokens = Tokens::parse(&std::env::var("BPMNKIT_BUILDER_TOKEN").unwrap_or_default())?;
    let registry = mkdir(Path::new(
        o.get("--registry").ok_or("serve needs --registry")?,
    ))?;
    let key = read_key(o.get("--signing-key").ok_or("serve needs --signing-key")?)?;
    let mut tc = toolchain(o)?;
    let rate = RateConfig {
        burst: o.num("--rate-burst", 10)?,
        per_minute: o.num("--rate-per-min", 30)?,
    };
    if rate.burst == 0 || rate.per_minute == 0 {
        return Err("--rate-burst and --rate-per-min must be at least 1".into());
    }
    if o.has("--warm") {
        eprintln!("warming the dependency set in {:?}…", tc.target_dir);
        warm(&tc, &LocalExecutor).map_err(|e| format!("warm build failed: {e}"))?;
    }
    // cargo takes a lock file in its home even offline.
    let mut rw = vec![tc.work_root.clone()];
    rw.extend(tc.target_dir.clone());
    rw.extend(cargo_home().filter(|p| p.is_dir()));
    let (iso, warning) = detect(rw, Caps::default());
    if let Some(w) = warning {
        eprintln!("{w}");
    }
    if matches!(iso, Isolation::Bwrap { .. }) {
        tc.offline = true;
        if !o.has("--warm") {
            eprintln!("note: builds run offline in bwrap; pass --warm on a cold cache");
        }
    }
    eprintln!("sandbox: {iso:?}");
    let b = Builder::new(
        Config {
            tokens,
            rate,
            max_builds: o.num("--max-builds", 2)?,
            toolchain: tc,
        },
        DirRegistry::new(registry),
        key,
        SandboxExecutor::new(iso, LocalExecutor),
    );
    let addr = o.get("--listen").unwrap_or("127.0.0.1:8787");
    let l = tokio::net::TcpListener::bind(addr)
        .await
        .map_err(|e| format!("{addr}: {e}"))?;
    eprintln!("listening on http://{addr}");
    axum::serve(l, router(b))
        .with_graceful_shutdown(async {
            let _ = tokio::signal::ctrl_c().await;
        })
        .await
        .map_err(|e| e.to_string())
}

#[tokio::main]
async fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let r = match args.first().map(String::as_str) {
        Some("serve") => match parse(&args[1..]) {
            Ok(o) => serve(&o).await,
            Err(e) => Err(e),
        },
        Some("keygen") => parse(&args[1..]).and_then(|o| keygen(&o)),
        Some("-h" | "--help" | "help") => {
            println!("{USAGE}");
            Ok(())
        }
        _ => Err(USAGE.into()),
    };
    match r {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("{e}");
            ExitCode::FAILURE
        }
    }
}
