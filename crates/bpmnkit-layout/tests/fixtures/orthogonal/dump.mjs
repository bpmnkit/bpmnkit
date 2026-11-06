// Regenerate: node dump.mjs > cases.json
import { routeOrthogonal, sidePorts } from "/home/user/bpmnkit/packages/core/dist/layout/orthogonal.js"
const enc = (v) => (v === Number.POSITIVE_INFINITY ? "Infinity" : v === Number.NEGATIVE_INFINITY ? "-Infinity" : v)
const sign = (v) => Math.sign(v)
const inter = (p, q, r, t) => {
  const side = (o, a, b) => sign((a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x))
  return side(p, q, r) !== side(p, q, t) && side(r, t, p) !== side(r, t, q)
}
const B = (x, y, width, height) => ({ x, y, width, height })
const cases = []
function add(name, req, segs) {
  const r = { ...req }
  if (segs) r.crossings = (a, b) => segs.filter(([c, d]) => inter(a, b, c, d)).length
  const out = routeOrthogonal(r)
  cases.push({ name, from: req.from.map(p => ({ ...p, cost: p.cost === undefined ? null : enc(p.cost) })),
    to: req.to.map(p => ({ ...p, cost: p.cost === undefined ? null : enc(p.cost) })),
    obstacles: req.obstacles, margin: req.margin ?? null, segments: segs ?? null, out })
}
const a = B(0, 0, 100, 80), b = B(400, 0, 100, 80)
add("straight", { from: sidePorts(a), to: sidePorts(b), obstacles: [] })
add("blocked-middle", { from: sidePorts(a, { right: 0, top: 20, bottom: 20, left: 80 }), to: sidePorts(b, { left: 0, top: 20, bottom: 20, right: 80 }), obstacles: [B(200, -20, 100, 120)] })
add("wall", { from: sidePorts(a), to: sidePorts(b), obstacles: [B(200, -400, 50, 900)] })
add("no-route-enclosed", { from: sidePorts(a), to: sidePorts(b), obstacles: [B(380, -20, 140, 10), B(380, 90, 140, 10), B(370, -20, 10, 120), B(520, -20, 10, 120)] })
add("diag", { from: sidePorts(a, { right: 0 }), to: sidePorts(B(400, 300, 100, 80), { left: 0, top: 20 }), obstacles: [B(150, 100, 200, 150), B(200, 0, 50, 60)] })
add("crossings", { from: sidePorts(a, { right: 0, top: 20, bottom: 20, left: 80 }), to: sidePorts(b, { left: 0, top: 20, bottom: 20, right: 80 }), obstacles: [B(200, 20, 60, 60)] },
  [[{ x: 150, y: -200 }, { x: 150, y: 30 }], [{ x: 320, y: -100 }, { x: 320, y: 200 }], [{ x: 100, y: 10 }, { x: 600, y: 10 }]])
add("crossings-dense", { from: sidePorts(a), to: sidePorts(B(300, 300, 100, 80)), obstacles: [B(150, 150, 80, 80)] },
  Array.from({ length: 8 }, (_, i) => [{ x: 110 + i * 30, y: -300 }, { x: 110 + i * 30, y: 600 }]))
add("infinite-costs", { from: sidePorts(B(0, 0, 36, 36), { top: Infinity, bottom: 0, left: Infinity, right: Infinity }), to: sidePorts(b, { left: 0, top: 20, bottom: 20, right: 80 }), obstacles: [B(-50, 36, 300, 40)] })
add("raw-ports-infinity", { from: [{ point: { x: 100, y: 40 }, side: "right", cost: Infinity }, { point: { x: 50, y: 80 }, side: "bottom", cost: 5 }], to: [{ point: { x: 400, y: 40 }, side: "left" }], obstacles: [B(200, 0, 50, 300)] })
add("far-obstacles-fallback", { from: sidePorts(a), to: sidePorts(B(0, 1000, 100, 80)), obstacles: [B(-600, 300, 1400, 400), B(-2000, 0, 100, 100)], margin: 30 })
add("fractional", { from: sidePorts(B(0.3, 0.7, 100.2, 80.1)), to: sidePorts(B(333.33, 211.1, 50, 50)), obstacles: [B(150.25, 40.4, 60.6, 120.2)] })
add("start-stub-blocked", { from: sidePorts(a, { right: 0 }), to: sidePorts(b), obstacles: [B(100, 0, 5, 80), B(0, -10, 100, 5), B(0, 85, 100, 5), B(-10, 0, 5, 80)] })
add("empty-from", { from: [], to: sidePorts(b), obstacles: [] })
console.log(JSON.stringify({ sidePorts: [
  { b: a, cost: {}, out: sidePorts(a) },
  // JSON has no Infinity / NaN: the Rust test reads "Infinity" and null back as those.
  { b: B(1, 2, 3, 5), cost: { top: 3, left: "Infinity", right: null }, out: sidePorts(B(1, 2, 3, 5), { top: 3, left: Infinity, right: NaN }) },
], cases }, null, 0))
