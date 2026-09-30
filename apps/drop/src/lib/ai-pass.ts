/**
 * The pass a solved Turnstile challenge earns for describe-to-diagram.
 *
 * A Turnstile token is single-use and lasts five minutes, and a reader drafts
 * once and then asks for a dozen changes. Challenging every call would be
 * maddening, so the route verifies one token and answers with a pass: an
 * expiry and an HMAC over it and the caller's IP hash. Later calls carry the
 * pass instead. It is stateless — nothing is stored — and signed with a key
 * derived from `TURNSTILE_SECRET`, so it needs no secret of its own. A pass
 * from another IP, or an expired one, is refused and the reader is challenged
 * again.
 */

import type { Env } from "../env.js"
import { AI_PASS_HEADER } from "../shared/constants.js"
import { clientIp, json } from "./http.js"
import { hashIp } from "./ids.js"
import { verifyTurnstile } from "./turnstile.js"

/** How long a solved challenge lasts: a drafting session, not a day. */
export const AI_PASS_TTL_MS = 30 * 60_000

const encoder = new TextEncoder()

function key(secret: string): Promise<CryptoKey> {
	// Derived, so the pass key is never the Turnstile secret itself.
	return crypto.subtle.importKey(
		"raw",
		encoder.encode(`drop-ai-pass\n${secret}`),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	)
}

function toBase64Url(bytes: ArrayBuffer): string {
	return btoa(String.fromCharCode(...new Uint8Array(bytes)))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "")
}

function fromBase64Url(text: string): Uint8Array | null {
	try {
		const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/"))
		return Uint8Array.from(binary, (c) => c.charCodeAt(0))
	} catch {
		return null
	}
}

/** A pass for `caller` that lasts until `now + AI_PASS_TTL_MS`: `<expiry>.<signature>`. */
export async function issueAiPass(secret: string, caller: string, now: number): Promise<string> {
	const expires = now + AI_PASS_TTL_MS
	const signature = await crypto.subtle.sign(
		"HMAC",
		await key(secret),
		encoder.encode(`${expires}\n${caller}`),
	)
	return `${expires}.${toBase64Url(signature)}`
}

/** Whether `pass` was issued to `caller` and has not expired. */
export async function checkAiPass(
	secret: string,
	caller: string,
	pass: string,
	now: number,
): Promise<boolean> {
	const [expiresText, signatureText, ...rest] = pass.split(".")
	if (!expiresText || !signatureText || rest.length > 0 || !/^\d+$/.test(expiresText)) return false
	const expires = Number(expiresText)
	if (expires <= now || expires > now + AI_PASS_TTL_MS) return false
	const signature = fromBase64Url(signatureText)
	if (!signature) return false
	return crypto.subtle.verify(
		"HMAC",
		await key(secret),
		signature,
		encoder.encode(`${expires}\n${caller}`),
	)
}

/**
 * The Turnstile gate for describe-to-diagram.
 *
 * Off unless `TURNSTILE_SECRET` is set, as for claims and comments. A request
 * passes with a valid pass, or with a Turnstile `token` Cloudflare accepts,
 * which earns a new pass. Anything else is a 403 with `code: "unverified"`,
 * which tells the page to show the challenge. A missing token is refused
 * without asking Cloudflare about it.
 *
 * @returns `denied` to send instead, or the `pass` to hand out (none when the
 * request came with a valid one, or the gate is off).
 */
export async function checkAiChallenge(
	request: Request,
	env: Env,
	token: string | undefined,
	now: number,
): Promise<{ denied?: Response; pass?: string }> {
	const secret = env.TURNSTILE_SECRET
	if (!secret) return {}
	const ip = clientIp(request)
	const caller = env.REPORT_IP_SALT ? await hashIp(ip, env.REPORT_IP_SALT) : ip
	const held = request.headers.get(AI_PASS_HEADER)
	if (held && (await checkAiPass(secret, caller, held, now))) return {}
	if (token && (await verifyTurnstile(secret, token, ip))) {
		return { pass: await issueAiPass(secret, caller, now) }
	}
	return {
		denied: json(
			{ error: "Please confirm you are a person first.", code: "unverified" },
			{ status: 403 },
		),
	}
}
