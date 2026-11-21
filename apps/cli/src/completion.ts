import type { CommandGroup } from "./types.js"

// ─── Runtime completion ────────────────────────────────────────────────────────

/**
 * Return newline-separated completion suggestions for the given cursor
 * position and word list. Called when the binary runs with --complete.
 *
 * Protocol: bpmnkit --complete <cursorWordIndex> -- <words...>
 */
export function getRuntimeCompletions(
	groups: CommandGroup[],
	cursorIdx: number,
	words: string[],
): string[] {
	// words[0] is the binary itself; strip it
	const tokens = words.slice(1)
	const pos = cursorIdx - 1 // adjust for stripped binary
	const partial = tokens[pos] ?? ""

	// Position 0: completing the resource group name
	if (pos === 0) {
		const names = groups.flatMap((g) => [g.name, ...(g.aliases ?? [])])
		return names.filter((n) => n.startsWith(partial))
	}

	// Find which group is selected
	const groupToken = tokens[0] ?? ""
	const group = groups.find((g) => g.name === groupToken || g.aliases?.includes(groupToken))
	if (!group) return []

	// Position 1: completing the command name
	if (pos === 1) {
		const names = group.commands.flatMap((c) => [c.name, ...(c.aliases ?? [])])
		return names.filter((n) => n.startsWith(partial))
	}

	// Position 2+: completing flags for the active command
	const cmdToken = tokens[1] ?? ""
	const cmd = group.commands.find((c) => c.name === cmdToken || c.aliases?.includes(cmdToken))
	if (!cmd) return []

	// Suggest flags
	if (partial.startsWith("--") || partial === "") {
		const flagNames = (cmd.flags ?? []).map((f) => `--${f.name}`)
		const globalFlags = ["--profile", "--output", "--no-color", "--debug", "--help"]
		return [...flagNames, ...globalFlags].filter((f) => f.startsWith(partial))
	}

	return []
}

// ─── Shell scripts ────────────────────────────────────────────────────────────

export function getBashScript(): string {
	return `# bash completion for bpmnkit
# Add to ~/.bash_completion or source in ~/.bashrc:
#   eval "$(bpmnkit completion bash)"

_casen_complete() {
  local cur_word
  cur_word="\${COMP_WORDS[COMP_CWORD]}"
  local completions
  completions=$(bpmnkit --complete $COMP_CWORD -- "\${COMP_WORDS[@]}" 2>/dev/null)
  COMPREPLY=($(compgen -W "$completions" -- "$cur_word"))
}
complete -F _casen_complete bpmnkit
`
}

export function getZshScript(): string {
	return `#compdef bpmnkit
# zsh completion for bpmnkit
# Add to a directory in your \$fpath, e.g.:
#   mkdir -p ~/.zfunc && bpmnkit completion zsh > ~/.zfunc/_bpmnkit
# Then ensure the directory is in your fpath before compinit:
#   fpath=(~/.zfunc $fpath)
#   autoload -Uz compinit && compinit

_bpmnkit() {
  local -a completions
  IFS=$'\\n' completions=( $(bpmnkit --complete $((CURRENT - 1)) -- "\${words[@]}" 2>/dev/null) )
  compadd -a completions
}

_bpmnkit
`
}

export function getFishScript(): string {
	return `# fish completion for bpmnkit
# Copy to ~/.config/fish/completions/bpmnkit.fish or run:
#   bpmnkit completion fish > ~/.config/fish/completions/bpmnkit.fish

function __casen_complete
  set -l cmd (commandline -opc)
  set -l pos (count $cmd)
  bpmnkit --complete $pos -- $cmd 2>/dev/null
end

complete -c bpmnkit -f -a '(__casen_complete)'
`
}
