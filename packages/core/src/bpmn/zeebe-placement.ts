import { ZEEBE_ALLOWED_IN } from "../generated/zeebe-elements.js"

// The data lives in spec/elements/zeebe.json (`allowedIn`), which
// scripts/generate-zeebe-placement.ts fills from the vendored descriptors
// (zeebe-bpmn-moddle, MIT, resolved against bpmn-moddle, MIT). Regenerate with:
//   pnpm --filter @bpmnkit/core generate:placement && pnpm spec:gen

/**
 * Where each Zeebe extension element may be placed, keyed by element name.
 *
 * The value is the set of element names that may own it. Owners are BPMN
 * elements for extensions that sit in an `extensionElements` bag, and Zeebe
 * elements for the few that nest inside another extension.
 *
 * An extension absent from this table is one the descriptor says nothing about;
 * see `isZeebePlacementAllowed` for what that means.
 */
export const ZEEBE_PLACEMENT: Readonly<Record<string, readonly string[]>> = ZEEBE_ALLOWED_IN
