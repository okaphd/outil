import { Plugin } from 'obsidian';

function toHTML(input: string) {
	let text = input;
	const link = [...text.matchAll(new RegExp("(?<=\\[\\[).*(?=\\]\\])", "gm"))][0];

	if (link && link[0]) {
		text = `<a data-href="${link[0]}" href="${link[0]}" class="internal-link" target="_blank" rel="noopener nofollow">${link[0]}</a>`;
	}
	return text;
}

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
									field.innerHTML += toHTML(context.frontmatter[i][j]);
								}
							} else {
								field.innerHTML += toHTML(context.frontmatter[i]);
							}
							field.innerHTML += " <br>";
						}

						codeblock.replaceWith(el);
					} else if (text === "%CHILDREN") {
						const children = this.app.vault.getMarkdownFiles().filter((tfile) => {
							const fm = this.app.metadataCache.getFileCache(tfile).frontmatter
							if (fm) {
								if (fm.parents) {
									return fm.parents.contains("[[" + this.app.workspace.getActiveFile().basename + "]]");
								}
							}
							return false;
						});

						if (children.length == 0) {
							codeblock.remove();
							return;
						}

						const el = codeblock.createDiv({cls: "el-table"});
						let table = el.createEl("table");

						let header = table.createEl("thead")
						let row = header.createEl("tr")
						row.createEl("th", {text: "Children"});
						row.createEl("th", {text: "Date"});

						let body = table.createEl("tbody")

						for (const c of children) {
							row = body.createEl("tr");
							let t = row.createEl("td", {text: ""});
							t.innerHTML = toHTML("[[" + c.basename + "]]");
							const fm = this.app.metadataCache.getFileCache(c).frontmatter;
							let date_text = "-";
							if (fm) {
								if (fm.date) {
									date_text = fm.date;
								}
							}
							row.createEl("td", {text: date_text});
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
