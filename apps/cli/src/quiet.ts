/**
 * Silences Node's process warnings (the UNDICI `EnvHttpProxyAgent` notice behind
 * a proxy, ExperimentalWarning for type stripping). An agent reading casen's output
 * pays for every line, and these say nothing about the model. `NODE_NO_WARNINGS=0`
 * keeps them. Imported first by the entry point, before anything can warn.
 */
if (process.env.NODE_NO_WARNINGS !== "0") process.removeAllListeners("warning")
