import { translateJuelToFeel } from "./camunda7/juel.js"

/**
 * Turns a condition into the form Zeebe deploys: a FEEL expression with a
 * leading `=`. Zeebe reads text without `=` as a static value and rejects it
 * on a condition. A Camunda 7 `${…}` goes through the migration's JUEL
 * converter; one it cannot translate is left as written, so the lint and
 * deploy checks still name it instead of us guessing.
 */
export function toFeelCondition(text: string): string {
	const trimmed = text.trim()
	if (trimmed === "" || trimmed.startsWith("=")) return text
	if (/^[$#]\{[\s\S]*\}$/.test(trimmed)) {
		const translated = translateJuelToFeel(trimmed)
		return translated.ok ? `=${translated.feel}` : text
	}
	return `=${trimmed}`
}
