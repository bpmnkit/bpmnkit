// Finds the native `bpmnkit` binary and runs it. Plain ESM, no build step: this file is what
// `npx @bpmnkit/cli` executes before any binary exists.
import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { homedir, tmpdir } from "node:os"
import { dirname, join } from "node:path"

/** Node platform/arch to the npm platform package suffix and the cargo-dist target triple. */
export const PLATFORMS = {
	"linux-x64": { triple: "x86_64-unknown-linux-gnu", archive: "tar.xz" },
	"linux-arm64": { triple: "aarch64-unknown-linux-gnu", archive: "tar.xz" },
	"darwin-x64": { triple: "x86_64-apple-darwin", archive: "tar.xz" },
	"darwin-arm64": { triple: "aarch64-apple-darwin", archive: "tar.xz" },
	"win32-x64": { triple: "x86_64-pc-windows-msvc", archive: "zip" },
}

export function platformKey(platform = process.platform, arch = process.arch) {
	const key = `${platform}-${arch}`
	return key in PLATFORMS ? key : null
}

const exe = (platform) => (platform === "win32" ? "bpmnkit.exe" : "bpmnkit")

/** The binary from the installed `@bpmnkit/cli-<platform>` package, or `null`. */
export function resolveInstalled(require, key, platform = process.platform) {
	try {
		return require.resolve(`@bpmnkit/cli-${key}/bin/${exe(platform)}`)
	} catch {
		return null
	}
}

/** The legacy Node CLI entry, resolved the way Node resolves any dependency. */
export function resolveLegacy(require) {
	try {
		return join(dirname(require.resolve("@bpmnkit/cli-legacy/package.json")), "dist", "index.js")
	} catch {
		return null
	}
}

/** `sha256sum`/cargo-dist sidecar text is `<hex>  <name>` or `<hex> *<name>`. */
export function parseSha256(text) {
	const m = /^([0-9a-fA-F]{64})(?:\s|$)/.exec(text.trim())
	return m ? m[1].toLowerCase() : null
}

export function verifySha256(bytes, sidecarText) {
	const want = parseSha256(sidecarText)
	if (!want) throw new Error("checksum file is not a sha256 digest")
	const got = createHash("sha256").update(bytes).digest("hex")
	if (got !== want) throw new Error(`sha256 mismatch: expected ${want}, got ${got}`)
}

export function releaseUrls(version, key, base) {
	const { triple, archive } = PLATFORMS[key]
	const root =
		base ?? `https://github.com/bpmnkit/bpmnkit/releases/download/bpmnkit-cli-v${version}`
	const file = `bpmnkit-cli-${triple}.${archive}`
	return { file, archiveUrl: `${root}/${file}`, sumUrl: `${root}/${file}.sha256` }
}

/**
 * Fallback for installs without the optional platform package (`--omit=optional`, an unsupported
 * registry mirror): fetch the release archive, check its sha256, unpack once, reuse afterwards.
 */
export async function downloadBinary({
	version,
	key,
	platform = process.platform,
	cacheRoot = join(process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"), "bpmnkit", "cli"),
	fetchFn = fetch,
	extract = untar,
	base = process.env.BPMNKIT_CLI_DOWNLOAD_BASE,
}) {
	const dest = join(cacheRoot, version, key)
	const bin = join(dest, exe(platform))
	if (existsSync(bin)) return bin
	const { file, archiveUrl, sumUrl } = releaseUrls(version, key, base)
	const get = async (url) => {
		const res = await fetchFn(url)
		if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
		return Buffer.from(await res.arrayBuffer())
	}
	const [archive, sum] = await Promise.all([get(archiveUrl), get(sumUrl)])
	verifySha256(archive, sum.toString("utf8"))
	mkdirSync(dest, { recursive: true })
	const work = mkdtempSync(join(tmpdir(), "bpmnkit-"))
	const archivePath = join(work, file)
	writeFileSync(archivePath, archive)
	extract(archivePath, dest)
	// cargo-dist archives wrap the binary in a directory named after the archive.
	const nested = join(dest, file.replace(/\.(tar\.xz|zip)$/, ""), exe(platform))
	const found = existsSync(bin) ? bin : nested
	if (!existsSync(found)) throw new Error(`${file} did not contain ${exe(platform)}`)
	if (platform !== "win32") chmodSync(found, 0o755)
	return found
}

function untar(archivePath, dest) {
	// bsdtar (macOS, Windows 10+) and GNU tar (Linux) both read these formats with `-xf`.
	const r = spawnSync("tar", ["-xf", archivePath, "-C", dest], { stdio: "inherit" })
	if (r.status !== 0) throw new Error("could not unpack the release archive with `tar`")
}

/** Runs the binary and returns its exit code. `alias` is the command name shown in messages. */
export async function launch(alias, importMetaUrl, args = process.argv.slice(2)) {
	const require = createRequire(importMetaUrl)
	const key = platformKey()
	if (!key) {
		console.error(
			`bpmnkit: no prebuilt binary for ${process.platform}-${process.arch}; build it with \`cargo install bpmnkit-cli\``,
		)
		return 1
	}
	let bin = resolveInstalled(require, key)
	if (!bin) {
		// The npm version (2.x) and the binary's version (the Rust workspace's) differ; the
		// release archives are tagged with the latter.
		const manifest = JSON.parse(readFileSync(new URL("../package.json", importMetaUrl), "utf8"))
		const version = manifest.bpmnkit.binaryVersion
		try {
			bin = await downloadBinary({ version, key })
		} catch (e) {
			console.error(
				`bpmnkit: platform package @bpmnkit/cli-${key} is not installed and the download failed: ${e.message}`,
			)
			return 1
		}
	}
	const legacy = resolveLegacy(require)
	const r = spawnSync(bin, args, {
		stdio: "inherit",
		env: {
			...process.env,
			BPMNKIT_INSTALLED_VIA: "npm",
			BPMNKIT_ARGV0: alias,
			...(legacy && !process.env.BPMNKIT_LEGACY_CLI ? { BPMNKIT_LEGACY_CLI: legacy } : {}),
		},
	})
	if (r.error) {
		console.error(`bpmnkit: cannot run ${bin}: ${r.error.message}`)
		return 127
	}
	return r.status ?? (r.signal ? 128 : 1)
}
