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
							let field = container.createSpan({ text: "", cls: "ou-properties-field" });
							key.innerHTML += i;

							if (Array.isArray(context.frontmatter[i])) {
								for (let j in context.frontmatter[i]) {
									field.innerHTML += this.toHTML(context.frontmatter[i][j]);
								}
							} else {
								field.innerHTML += this.toHTML(context.frontmatter[i]);
							}
							field.innerHTML += " <br>";
						}

						codeblock.replaceWith(el);
					} else if (text === "%CHILDREN") {
						let el = codeblock.createDiv({cls: "el-table"});
						let table = el.createEl("table");

						let thead = table.createEl("thead")
						let tr = thead.createEl("tr")
						tr.createEl("th", {text: "Note"});
						tr.createEl("th", {text: "Date Created"});

						let tbody = table.createEl("tbody")

						tr = tbody.createEl("tr");
						let t = tr.createEl("td", {text: ""});
						t.innerHTML = this.toHTML("[[High-Level Programming Languages]]");
						tr.createEl("td", {text: "2025-08-18"});

						codeblock.replaceWith(el);
					}
				}
			}
		});
	}

	onunload() {
	}

	toHTML(input: string) {
		let text = input;
		const link = [...text.matchAll(new RegExp("(?<=\\[\\[).*(?=\\]\\])", "gm"))][0];

		if (link && link[0]) {
			text = `<a data-href="${link[0]}" href="${link[0]}" class="internal-link" target="_blank" rel="noopener nofollow">${link[0]}</a>`;
		}

		return text;
	}
}
