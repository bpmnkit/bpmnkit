#!/usr/bin/env node
/**
 * Builds apps/reebe-wasm — the Reebe engine compiled to WebAssembly — from
 * apps/reebe/crates/reebe-wasm. Its .js, .d.ts and .wasm files are build
 * output and not committed, so a checkout keeps whatever an earlier build left
 * there. `@bpmnkit/engine` and Studio type-check against those files.
 *
 * - Files built after the last change to the crates, exporting every method
 *   of the crate's `WasmEngine`, are kept as they are.
 * - Otherwise, with wasm-pack installed, it builds them. The committed
 *   package.json is kept: wasm-pack rewrites it from Cargo.toml.
 * - Without wasm-pack, files that still export every method are kept. Files
 *   from an older build fail with how to update them, instead of a type error
 *   in a package that uses them.
 *
 * Run by `pnpm build:wasm` and by turbo's `build:wasm` task of
 * @bpmnkit/reebe-wasm, which `build` depends on.
 */

import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const CRATE = join(ROOT, "apps/reebe/crates/reebe-wasm")
const OUT = join(ROOT, "apps/reebe-wasm")
const PACKAGE_JSON = join(OUT, "package.json")
const TYPINGS = join(OUT, "reebe_wasm.d.ts")
const WASM = join(OUT, "reebe_wasm_bg.wasm")
const RUST = join(ROOT, "apps/reebe")

/** The methods the crate's `#[wasm_bindgen] impl WasmEngine` exports to JavaScript. */
function crateMethods() {
	const source = readFileSync(join(CRATE, "src/lib.rs"), "utf8")
	const start = source.search(/#\[wasm_bindgen\]\s*impl\s+WasmEngine\s*\{/)
	if (start < 0) throw new Error("no #[wasm_bindgen] impl WasmEngine in the reebe-wasm crate")
	const end = source.indexOf("\n}", start)
	const block = source.slice(start, end)
	return [...block.matchAll(/pub fn (\w+)/g)].map((m) => m[1]).filter((name) => name !== "new")
}

/** The crate's methods the built typings lack; all of them when there are none. */
function missingMethods() {
	const methods = crateMethods()
	if (!existsSync(TYPINGS)) return methods
	const typings = readFileSync(TYPINGS, "utf8")
	return methods.filter((name) => !new RegExp(`^\\s+${name}\\(`, "m").test(typings))
}

/** When a Rust source or manifest of the engine last changed, in ms. */
function newestSource() {
	let newest = statSync(join(RUST, "Cargo.lock")).mtimeMs
	const walk = (dir) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const path = join(dir, entry.name)
			if (entry.isDirectory()) walk(path)
			else if (entry.name.endsWith(".rs") || entry.name === "Cargo.toml") {
				newest = Math.max(newest, statSync(path).mtimeMs)
			}
		}
	}
	walk(join(RUST, "crates"))
	return Math.max(newest, statSync(join(RUST, "Cargo.toml")).mtimeMs)
}

// Built after the last change to the crates, and complete: nothing to do. CI builds it in a
// step of its own before `pnpm build`, so this keeps it from compiling the crate twice.
if (existsSync(WASM) && statSync(WASM).mtimeMs >= newestSource() && missingMethods().length === 0) {
	console.log("apps/reebe-wasm is up to date with apps/reebe/crates.")
	process.exit(0)
}

const probe = spawnSync("wasm-pack", ["--version"], { encoding: "utf8" })
if (probe.error) {
	const missing = missingMethods()
	if (missing.length === 0) {
		console.log(
			"wasm-pack is not installed; apps/reebe-wasm matches the crate's exports, kept as is.",
		)
		process.exit(0)
	}
	console.error(
		[
			existsSync(TYPINGS)
				? `apps/reebe-wasm is from an older build: it lacks ${missing.join(", ")}.`
				: "apps/reebe-wasm has not been built.",
			"Build it from apps/reebe/crates/reebe-wasm with wasm-pack:",
			"  rustup target add wasm32-unknown-unknown",
			"  cargo install wasm-pack",
			"  pnpm build:wasm",
		].join("\n"),
	)
	process.exit(1)
}

const committed = readFileSync(PACKAGE_JSON, "utf8")
const build = spawnSync(
	"wasm-pack",
	["build", CRATE, "--target", "web", "--scope", "bpmnkit", "--out-dir", OUT],
	{ stdio: "inherit" },
)
// The committed package.json carries the published name, version and metadata
writeFileSync(PACKAGE_JSON, committed)
if (build.status !== 0) process.exit(build.status ?? 1)
