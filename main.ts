import { Plugin } from 'obsidian';

export default class Utils extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor((element, context) => {
			const codeblocks = element.findAll('code');

			for (let codeblock of codeblocks) {
				const text = codeblock.innerText.trim();
				if (text[0] === '%') {
					const el = codeblock.createSpan({
						text: "PLACEHOLDER",
					});
					codeblock.replaceWith(el);
				}
			}
		});
	}

	onunload() {
	}
}
