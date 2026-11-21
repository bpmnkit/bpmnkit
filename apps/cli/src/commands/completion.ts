import { getBashScript, getFishScript, getZshScript } from "../completion.js"
import type { CommandGroup } from "../types.js"

export const completionGroup: CommandGroup = {
	name: "completion",
	description: "Generate shell completion scripts",
	commands: [
		{
			name: "bash",
			description: "Generate bash completion script",
			examples: [
				{ description: "Install bash completion", command: 'eval "$(bpmnkit completion bash)"' },
				{
					description: "Persist bash completion",
					command: "bpmnkit completion bash >> ~/.bash_completion",
				},
			],
			async run(ctx) {
				ctx.output.print(getBashScript())
			},
		},
		{
			name: "zsh",
			description: "Generate zsh completion script",
			examples: [
				{
					description: "Install zsh completion",
					command: "mkdir -p ~/.zfunc && bpmnkit completion zsh > ~/.zfunc/_bpmnkit",
				},
				{
					description: "Then add to ~/.zshrc",
					command: "# fpath=(~/.zfunc $fpath); autoload -Uz compinit && compinit",
				},
			],
			async run(ctx) {
				ctx.output.print(getZshScript())
			},
		},
		{
			name: "fish",
			description: "Generate fish completion script",
			examples: [
				{
					description: "Install fish completion",
					command: "bpmnkit completion fish > ~/.config/fish/completions/bpmnkit.fish",
				},
			],
			async run(ctx) {
				ctx.output.print(getFishScript())
			},
		},
	],
}
