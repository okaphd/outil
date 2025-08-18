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
								let text = context.frontmatter[i][j];
								const link = [...text.matchAll(new RegExp("(?<=\\[\\[).*(?=\\]\\])", "gm"))][0];
								console.log(link);

								if (link) {
									if (link[0]) {
										text = `<a data-href="${link[0]}" href="${link[0]}" class="internal-link" target="_blank" rel="noopener nofollow">${link[0]}</a>`;
									}
								}
								field.innerHTML += text;
							}
							field.innerHTML += " <br>";
						}

						codeblock.replaceWith(el);
					}
				}
			}
		});
	}

	onunload() {
	}
}
