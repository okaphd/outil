import { Plugin } from 'obsidian';

export default class Utils extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor((element, context) => {
			const codeblocks = element.findAll('code');

			for (let codeblock of codeblocks) {
				const text = codeblock.innerText.trim();
				if (text[0] === '%') {
					if (text === "%PROPERTIES") {
						let el = codeblock.createSpan({ cls: "ou-properties" });

						for (let i in context.frontmatter) {
							let container = el.createSpan({ text: "", cls: "ou-properties-container" });
							let key = container.createSpan({ text: "", cls: "ou-properties-key" });
							key.innerHTML += i + " ";

							let field = container.createSpan({ text: "", cls: "ou-properties-field" });
							for (let j in context.frontmatter[i]) {
								field.innerHTML += context.frontmatter[i][j];
							}
							field.innerHTML += " <br>";
						}

						console.log(el);

						codeblock.replaceWith(el);
					}
				}
			}
		});
	}

	onunload() {
	}
}
