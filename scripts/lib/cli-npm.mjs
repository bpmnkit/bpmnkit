// Shared by smoke-cli-npm.mjs and publish-cli-npm.mjs: putting the native binary into the
// `@bpmnkit/cli-<platform>` package it belongs to.
import { chmodSync, copyFileSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")

export const platformDir = (key) => join(ROOT, "packages", `cli-${key}`)

/** Copies `bin` to `packages/cli-<key>/bin/bpmnkit[.exe]` and returns the staged path. */
export function stageBinary(key, bin) {
	const win = key.startsWith("win32")
	mkdirSync(join(platformDir(key), "bin"), { recursive: true })
	const dest = join(platformDir(key), "bin", win ? "bpmnkit.exe" : "bpmnkit")
	copyFileSync(bin, dest)
	if (!win) chmodSync(dest, 0o755)
	return dest
}
