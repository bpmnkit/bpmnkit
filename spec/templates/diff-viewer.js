// Progressive enhancement: everything above works without this script.
;(() => {
	const body = document.body
	body.classList.add("bk-js")
	const diff = JSON.parse(document.getElementById("bk-diff").textContent)
	const svgs = [...document.querySelectorAll(".bk-svg")]
	if (svgs.length === 0) return
	const home = svgs[0].getAttribute("viewBox").split(" ").map(Number)
	let vb = home.slice()
	let anim = 0
	const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches

	const apply = (v) => {
		vb = v
		const s = v.join(" ")
		for (const svg of svgs) svg.setAttribute("viewBox", s)
	}
	const animate = (to) => {
		cancelAnimationFrame(anim)
		if (reduce) return apply(to)
		const from = vb.slice()
		const t0 = performance.now()
		const step = (now) => {
			const t = Math.min(1, (now - t0) / 280)
			const e = 1 - (1 - t) ** 3
			apply(from.map((f, i) => f + (to[i] - f) * e))
			if (t < 1) anim = requestAnimationFrame(step)
		}
		anim = requestAnimationFrame(step)
	}

	const boxOf = (g) => {
		if (!g) return null
		if (g.waypoints?.length) {
			const xs = g.waypoints.map((p) => p.x)
			const ys = g.waypoints.map((p) => p.y)
			const x = Math.min(...xs)
			const y = Math.min(...ys)
			return [x, y, Math.max(...xs) - x, Math.max(...ys) - y]
		}
		if (g.width === undefined) return null
		return [g.x, g.y, g.width, g.height]
	}
	const zoomTo = (change) => {
		const b = boxOf(change.geometryAfter) ?? boxOf(change.geometryBefore)
		if (!b) return
		const w = Math.max(b[2] * 3, 360)
		const h = Math.max(b[3] * 3, 240)
		animate([b[0] + b[2] / 2 - w / 2, b[1] + b[3] / 2 - h / 2, w, h])
	}

	const rows = [...document.querySelectorAll(".bk-row")]
	let current = -1
	const select = (i, zoom) => {
		const row = rows.find((r) => Number(r.dataset.i) === i)
		if (!row) return
		current = i
		for (const r of rows) r.classList.toggle("bk-sel", r === row)
		row.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" })
		if (zoom) zoomTo(diff.changes[i])
		for (const g of document.querySelectorAll(`.bk-hl[data-i="${i}"]`)) {
			g.classList.remove("bk-pulse")
			void g.getBBox()
			g.classList.add("bk-pulse")
		}
	}
	for (const row of rows) {
		row.addEventListener("click", () => select(Number(row.dataset.i), true))
		row.addEventListener("keydown", (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault()
				select(Number(row.dataset.i), true)
			}
		})
	}

	let moved = false
	for (const a of document.querySelectorAll(".bk-diff a")) {
		a.addEventListener("click", (e) => {
			e.preventDefault()
			if (!moved) select(Number(a.firstElementChild.dataset.i), false)
		})
	}

	const visible = () => rows.filter((r) => r.offsetParent !== null)
	document.addEventListener("keydown", (e) => {
		if (e.target instanceof HTMLInputElement && e.target.type === "range") return
		if (e.metaKey || e.ctrlKey || e.altKey) return
		if (e.key === "0") return animate(home)
		if (e.key !== "j" && e.key !== "k") return
		const list = visible()
		if (list.length === 0) return
		const at = list.findIndex((r) => Number(r.dataset.i) === current)
		const next = e.key === "j" ? Math.min(list.length - 1, at + 1) : Math.max(0, at - 1)
		select(Number(list[at === -1 ? 0 : next].dataset.i), true)
	})

	const scaleOf = (svg) => {
		const r = svg.getBoundingClientRect()
		return Math.max(vb[2] / r.width, vb[3] / r.height)
	}
	const toUser = (svg, cx, cy) => {
		const r = svg.getBoundingClientRect()
		const s = scaleOf(svg)
		return [vb[0] + (cx - r.left - (r.width - vb[2] / s) / 2) * s, vb[1] + (cy - r.top - (r.height - vb[3] / s) / 2) * s]
	}
	for (const canvas of document.querySelectorAll(".bk-canvas")) {
		const svg = canvas.querySelector(".bk-svg")
		canvas.addEventListener(
			"wheel",
			(e) => {
				e.preventDefault()
				cancelAnimationFrame(anim)
				const f = Math.exp(e.deltaY * 0.0015)
				const [px, py] = toUser(svg, e.clientX, e.clientY)
				apply([px - (px - vb[0]) * f, py - (py - vb[1]) * f, vb[2] * f, vb[3] * f])
			},
			{ passive: false },
		)
		let start = null
		canvas.addEventListener("pointerdown", (e) => {
			if (e.button !== 0) return
			cancelAnimationFrame(anim)
			start = { x: e.clientX, y: e.clientY, vb: vb.slice(), s: scaleOf(svg) }
			moved = false
		})
		canvas.addEventListener("pointermove", (e) => {
			if (!start) return
			const dx = e.clientX - start.x
			const dy = e.clientY - start.y
			if (!moved && Math.hypot(dx, dy) < 4) return
			if (!moved) canvas.setPointerCapture(e.pointerId)
			moved = true
			canvas.classList.add("bk-drag")
			apply([start.vb[0] - dx * start.s, start.vb[1] - dy * start.s, start.vb[2], start.vb[3]])
		})
		const end = () => {
			start = null
			canvas.classList.remove("bk-drag")
		}
		canvas.addEventListener("pointerup", end)
		canvas.addEventListener("pointercancel", end)
		canvas.addEventListener("dblclick", () => animate(home))
	}

	const fade = document.getElementById("bk-fade")
	fade.addEventListener("input", () => body.style.setProperty("--bk-fade", String(fade.value / 100)))
})()
