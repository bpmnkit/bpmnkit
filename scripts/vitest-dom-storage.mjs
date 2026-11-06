import { Storage } from "happy-dom"

// Node 25+ defines its own `localStorage` and `sessionStorage` globals, which stay undefined unless
// Node is started with `--localstorage-file`. Vitest's DOM environment does not overwrite them, so
// tests that use storage see `undefined`. Give a DOM test the storage a browser would have.
if (typeof window !== "undefined") {
	for (const key of ["localStorage", "sessionStorage"]) {
		if (globalThis[key] === undefined) {
			Object.defineProperty(globalThis, key, {
				value: new Storage(),
				configurable: true,
				writable: true,
			})
		}
	}
}
