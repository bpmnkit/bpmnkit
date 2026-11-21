import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import {
	PLATFORMS,
	downloadBinary,
	parseSha256,
	platformKey,
	releaseUrls,
	resolveInstalled,
	resolveLegacy,
	verifySha256,
} from "../lib/launch.js"

test("platformKey maps the five supported targets and rejects the rest", () => {
	assert.equal(platformKey("linux", "x64"), "linux-x64")
	assert.equal(platformKey("win32", "x64"), "win32-x64")
	assert.equal(platformKey("darwin", "arm64"), "darwin-arm64")
	assert.equal(platformKey("freebsd", "x64"), null)
	assert.equal(platformKey("win32", "arm64"), null)
})

test("resolveInstalled asks for the platform package's binary, .exe on Windows", () => {
	const asked = []
	const require = {
		resolve: (id) => {
			asked.push(id)
			return id
		},
	}
	resolveInstalled(require, "linux-x64", "linux")
	resolveInstalled(require, "win32-x64", "win32")
	assert.deepEqual(asked, [
		"@bpmnkit/cli-linux-x64/bin/bpmnkit",
		"@bpmnkit/cli-win32-x64/bin/bpmnkit.exe",
	])
	assert.equal(
		resolveInstalled(
			{
				resolve: () => {
					throw new Error("MODULE_NOT_FOUND")
				},
			},
			"linux-x64",
		),
		null,
	)
})

test("resolveLegacy points at dist/index.js next to the resolved package.json", () => {
	const p = resolveLegacy({ resolve: () => join("/n", "@bpmnkit", "cli-legacy", "package.json") })
	assert.equal(p, join("/n", "@bpmnkit", "cli-legacy", "dist", "index.js"))
})

test("parseSha256 reads sha256sum and cargo-dist sidecars", () => {
	const h = "a".repeat(64)
	assert.equal(parseSha256(`${h}  file.tar.xz\n`), h)
	assert.equal(parseSha256(`${h.toUpperCase()} *file.zip`), h)
	assert.equal(parseSha256("nope"), null)
})

test("verifySha256 throws on a mismatch", () => {
	const bytes = Buffer.from("payload")
	const good = createHash("sha256").update(bytes).digest("hex")
	verifySha256(bytes, `${good}  x`)
	assert.throws(() => verifySha256(bytes, `${"0".repeat(64)}  x`), /mismatch/)
	assert.throws(() => verifySha256(bytes, "garbage"), /not a sha256/)
})

test("releaseUrls follow the cargo-dist artifact names", () => {
	const u = releaseUrls("2.0.0", "win32-x64")
	assert.equal(u.file, "bpmnkit-cli-x86_64-pc-windows-msvc.zip")
	assert.ok(u.archiveUrl.endsWith("/bpmnkit-cli-v2.0.0/bpmnkit-cli-x86_64-pc-windows-msvc.zip"))
	assert.equal(u.sumUrl, `${u.archiveUrl}.sha256`)
	for (const key of Object.keys(PLATFORMS))
		assert.ok(releaseUrls("1.0.0", key).file.includes(PLATFORMS[key].triple))
})

function fakeFetch(archive, sum) {
	return async (url) => ({
		ok: true,
		status: 200,
		arrayBuffer: async () => {
			const b = url.endsWith(".sha256") ? sum : archive
			return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)
		},
	})
}

test("downloadBinary verifies the checksum before unpacking and caches the result", async () => {
	const cacheRoot = mkdtempSync(join(tmpdir(), "bpmnkit-test-"))
	const archive = Buffer.from("archive-bytes")
	const digest = createHash("sha256").update(archive).digest("hex")
	let extracted = 0
	const extract = (_archive, dest) => {
		extracted++
		mkdirSync(dest, { recursive: true })
		writeFileSync(join(dest, "bpmnkit"), "#!/bin/sh\n")
	}
	const opts = { version: "2.0.0", key: "linux-x64", platform: "linux", cacheRoot, extract }
	const bin = await downloadBinary({
		...opts,
		fetchFn: fakeFetch(archive, Buffer.from(`${digest}  f`)),
	})
	assert.ok(existsSync(bin))
	await downloadBinary({ ...opts, fetchFn: () => assert.fail("cache hit must not fetch") })
	assert.equal(extracted, 1)
})

test("downloadBinary rejects a tampered archive and extracts nothing", async () => {
	const cacheRoot = mkdtempSync(join(tmpdir(), "bpmnkit-test-"))
	await assert.rejects(
		downloadBinary({
			version: "2.0.0",
			key: "linux-x64",
			platform: "linux",
			cacheRoot,
			extract: () => assert.fail("must not extract"),
			fetchFn: fakeFetch(Buffer.from("evil"), Buffer.from(`${"1".repeat(64)}  f`)),
		}),
		/mismatch/,
	)
})
