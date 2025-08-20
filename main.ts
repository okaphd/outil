import { Plugin } from 'obsidian';

function toHTML(input: string) {
	let text = input;
	const link = [...text.matchAll(new RegExp("(?<=\\[\\[).*(?=\\]\\])", "gm"))][0];

	if (link && link[0]) {
		text = `<a data-href="${link[0]}" href="${link[0]}" class="internal-link" target="_blank" rel="noopener nofollow">${link[0]}</a>`;
	}

	const tag = [...text.matchAll(new RegExp("(?<=\\#).*", "gm"))][0];
	if (tag && tag[0]) {
		text = `<a href="#${tag[0]}" class="tag" target="_blank" rel="noopener nofollow">#${tag[0]}</a>`
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
						let children = [];

						this.app.vault.getMarkdownFiles().forEach((tfile) => {
							let date = "-";

							const fm = this.app.metadataCache.getFileCache(tfile).frontmatter
							if (fm && fm.parents) {
								if (fm.date) {
									date = fm.date;
								}
								if (fm.parents.contains("[[" + this.app.workspace.getActiveFile().basename + "]]")) {
									children.push([tfile.basename, date]);
								}
							}
						});

						if (children.length == 0) {
							codeblock.remove();
							return;
						}

						const el = codeblock.createDiv({cls: "el-table"});
						let table = el.createEl("table");

						let header = table.createEl("thead")
						let row = header.createEl("tr")
						row.createEl("th", {text: "Note"});
						row.createEl("th", {text: "Date"});

						let body = table.createEl("tbody")

						for (const c of children) {
							row = body.createEl("tr");
							let t = row.createEl("td", {text: ""});
							t.innerHTML = toHTML("[[" + c[0] + "]]");
							row.createEl("td", {text: c[1]});
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
