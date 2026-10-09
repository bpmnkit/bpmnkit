/**
 * The retrieval side: a BM25 index over chunk text and entities, with tags
 * scored as a field of their own. Built in memory from the manifests — the
 * corpus is a project's own documentation, not the whole registry, so there is
 * nothing to persist and no database to keep in step.
 */

import { stem, terms } from "./text.js"
import type { ManifestChunk, Pack, SearchHit } from "./types.js"

/** BM25 saturation and length-normalisation, at their conventional values. */
const K1 = 1.2
const B = 0.75

/** An entity is a deliberate index term; a word in a paragraph is incidental. */
const ENTITY_WEIGHT = 3

/**
 * A tag adds this share of a query term's IDF, after the BM25 sum and outside it. Counted into
 * the same frequencies as the prose, a tag was saturated away: Camunda's incidents page lost
 * "resolve the incident" to five `secret-resolution-incidents` chunks that say every query word
 * in prose. A tag that is the term ("incidents") outweighs one that holds it as a part
 * ("secret-resolution-incidents"), because the page that is about a thing beats one that names it.
 */
const WHOLE_TAG_WEIGHT = 1
const PART_TAG_WEIGHT = 0.3

/**
 * A line repeated in this share of a pack's chunks is the pack's template, not its content —
 * and in at least `BOILERPLATE_MIN` of them, so two pages quoting the same sentence in a small
 * pack are not mistaken for one.
 *
 * Camunda's API digests are why: all 227 say `Consistency: eventual.` or `strong.` and list the
 * same 400/500/503 responses. Indexed, that made "consistency" a near stop word and let short
 * digests outrank the page that explains consistency. The lines are still shown in an answer;
 * they only stop counting towards a match.
 */
const BOILERPLATE_SHARE = 0.05
const BOILERPLATE_MIN = 10

interface IndexedChunk {
	chunkId: string
	pack: Pack
	chunk: ManifestChunk
	tokens: number
	content: string
	frequencies: Map<string, number>
	length: number
	/** Stems of the tags that are one word. */
	wholeTags: Set<string>
	/** Index terms of every tag, the parts of `a-b` tags included. */
	tagTerms: Set<string>
}

export interface DocsIndex {
	chunks: IndexedChunk[]
	documentFrequency: Map<string, number>
	averageLength: number
}

/** One chunk's content, paired with the pack it came from. */
export interface IndexInput {
	pack: Pack
	chunk: ManifestChunk
	content: string
	tokens: number
}

export function buildIndex(inputs: IndexInput[]): DocsIndex {
	const chunks: IndexedChunk[] = []
	const documentFrequency = new Map<string, number>()
	const boilerplate = boilerplateLines(inputs)

	for (const input of inputs) {
		const frequencies = new Map<string, number>()
		const add = (values: readonly string[], weight: number) => {
			for (const term of values) frequencies.set(term, (frequencies.get(term) ?? 0) + weight)
		}
		const template = boilerplate.get(packKey(input.pack)) ?? new Set<string>()
		const contentTerms = terms(
			input.content
				.split("\n")
				.filter((line) => !template.has(line.trim()))
				.join("\n"),
		)
		add(contentTerms, 1)
		add(terms((input.chunk.entities ?? []).join(" ")), ENTITY_WEIGHT)
		const tags = input.chunk.tags ?? []
		const tagTerms = new Set(terms(tags.join(" ")))

		for (const term of new Set([...frequencies.keys(), ...tagTerms])) {
			documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1)
		}

		chunks.push({
			chunkId: `${input.pack.name}@${input.pack.version}/${input.chunk.id}`,
			pack: input.pack,
			chunk: input.chunk,
			tokens: input.tokens,
			content: input.content,
			frequencies,
			length: contentTerms.length,
			wholeTags: new Set(
				tags.filter((tag) => !/[._-]/.test(tag)).map((tag) => stem(tag.toLowerCase())),
			),
			tagTerms,
		})
	}

	const total = chunks.reduce((sum, c) => sum + c.length, 0)
	return {
		chunks,
		documentFrequency,
		averageLength: chunks.length === 0 ? 1 : Math.max(1, total / chunks.length),
	}
}

function packKey(pack: Pack): string {
	return `${pack.name}@${pack.version}`
}

/** Each pack's template lines: those found in enough of its chunks to say nothing about one. */
function boilerplateLines(inputs: readonly IndexInput[]): Map<string, Set<string>> {
	const perPack = new Map<string, { chunks: number; lines: Map<string, number> }>()
	for (const input of inputs) {
		const key = packKey(input.pack)
		const entry = perPack.get(key) ?? { chunks: 0, lines: new Map<string, number>() }
		perPack.set(key, entry)
		entry.chunks += 1
		for (const line of new Set(input.content.split("\n").map((l) => l.trim()))) {
			if (line !== "") entry.lines.set(line, (entry.lines.get(line) ?? 0) + 1)
		}
	}

	const out = new Map<string, Set<string>>()
	for (const [key, { chunks, lines }] of perPack) {
		const threshold = Math.max(BOILERPLATE_MIN, chunks * BOILERPLATE_SHARE)
		out.set(
			key,
			new Set([...lines].filter(([, count]) => count >= threshold).map(([line]) => line)),
		)
	}
	return out
}

export interface SearchOptions {
	/** Maximum hits to return. */
	limit?: number
	/**
	 * Restrict to these package names — a project asks only about what it
	 * installed. A name that was never indexed throws rather than returning
	 * nothing, so a typo cannot pass for an absence of documentation.
	 */
	packs?: readonly string[]
}

/** Rank every chunk that shares a term with the query. Ties break on chunk id. */
export function search(index: DocsIndex, query: string, options: SearchOptions = {}): SearchHit[] {
	const limit = options.limit ?? 3
	const allowed = options.packs ? new Set(options.packs) : null
	if (allowed) {
		// Narrowing to a package that was never indexed would otherwise come back
		// as an empty result, which reads as "the documentation does not cover
		// this" — a different answer, and the wrong one to hand a model.
		const indexed = new Set(index.chunks.map((candidate) => candidate.pack.name))
		for (const name of allowed) {
			if (!indexed.has(name)) {
				throw new Error(
					`No documentation package named "${name}". Indexed: ${[...indexed].sort().join(", ")}`,
				)
			}
		}
	}

	const queryTerms = terms(query)
	if (queryTerms.length === 0) return []

	const total = index.chunks.length
	const hits: SearchHit[] = []

	for (const candidate of index.chunks) {
		if (allowed && !allowed.has(candidate.pack.name)) continue

		let score = 0
		for (const term of new Set(queryTerms)) {
			const documents = index.documentFrequency.get(term) ?? 0
			const idf = Math.log(1 + (total - documents + 0.5) / (documents + 0.5))
			const frequency = candidate.frequencies.get(term)
			if (frequency) {
				const norm = K1 * (1 - B + (B * candidate.length) / index.averageLength)
				score += idf * ((frequency * (K1 + 1)) / (frequency + norm))
			}
			if (candidate.wholeTags.has(term)) score += WHOLE_TAG_WEIGHT * idf
			else if (candidate.tagTerms.has(term)) score += PART_TAG_WEIGHT * idf
		}
		if (score <= 0) continue

		hits.push({
			chunkId: candidate.chunkId,
			pack: candidate.pack,
			chunk: candidate.chunk,
			tokens: candidate.tokens,
			content: candidate.content,
			score,
		})
	}

	hits.sort((a, b) => b.score - a.score || a.chunkId.localeCompare(b.chunkId))
	return hits.slice(0, limit)
}

export interface AnswerOptions extends SearchOptions {
	/** Hard ceiling on the tokens an answer may spend, counted before content. */
	maxTokens?: number
}

/** How many runners-up an answer names after its chunks. */
const MORE_LIMIT = 5

/**
 * The hits an agent gets back: the top matches that fit the token budget.
 * The budget is spent from the manifest counts, so a chunk that would overrun
 * it is dropped rather than truncated mid-sentence.
 *
 * `more` names the runners-up without their content. Ranking misses by a place
 * or two far more often than it misses outright, and the id is enough for an
 * agent to see which one it wanted and ask for it by id.
 *
 * A query that is a chunk id — bare or as an answer header shows it — returns
 * that chunk alone, which is how an agent follows up on `more`.
 */
export function answer(index: DocsIndex, query: string, options: AnswerOptions = {}) {
	const maxTokens = options.maxTokens ?? 3000
	const limit = options.limit ?? 3

	const pinned = byId(index, query.trim(), options.packs)
	if (pinned) return { hits: [pinned], more: [], tokens: pinned.tokens, maxTokens }

	const ranked = search(index, query, { ...options, limit: limit * 4 + MORE_LIMIT })

	const selected: SearchHit[] = []
	const more: SearchHit[] = []
	let spent = 0
	for (const hit of ranked) {
		if (selected.length < limit && spent + hit.tokens <= maxTokens) {
			selected.push(hit)
			spent += hit.tokens
		} else if (more.length < MORE_LIMIT) {
			more.push(hit)
		}
	}
	return { hits: selected, more, tokens: spent, maxTokens }
}

function byId(
	index: DocsIndex,
	id: string,
	packs: readonly string[] | undefined,
): SearchHit | undefined {
	const candidate = index.chunks.find(
		(c) =>
			(c.chunkId === id || c.chunk.id === id) &&
			(packs === undefined || packs.includes(c.pack.name)),
	)
	if (!candidate) return undefined
	return {
		chunkId: candidate.chunkId,
		pack: candidate.pack,
		chunk: candidate.chunk,
		tokens: candidate.tokens,
		content: candidate.content,
		score: 0,
	}
}
