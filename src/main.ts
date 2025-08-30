import { Plugin } from 'obsidian';
// import { Settings, DEFAULT_SETTINGS, SettingsTab } from './settings.ts';
import { toHTML, internalLink, getChildren, create } from './utils.ts';

export default class Utils extends Plugin {
	// settings: Settings;

	async onload() {
		// await this.loadSettings();

		this.registerMarkdownPostProcessor((element, context) => {
			for (let codeblock of element.findAll('code')) {
				if (codeblock.innerText === "%PROPERTIES") {
					let el = codeblock.createSpan({ cls: "ou-properties" });

					for (let i in context.frontmatter) {
						if (i == "cover") { // create image
							create(el, "", `<br><img src="${context.frontmatter[i]}" width="400">`)
							continue;
						}

						let key = i.replace("imdb", "IMDb");
						let fields = "";
						if (Array.isArray(context.frontmatter[i])) {
							for (let j in context.frontmatter[i]) {
								fields += toHTML(context.frontmatter[i][j]) + ", ";
							}
							fields = fields.substring(0, fields.length-2);
						} else if (context.frontmatter[i] != null) {
							fields += toHTML(context.frontmatter[i]);
						}

						create(el, `ou-properties-key`, `<strong>${key}</strong>`)
						create(el, `ou-properties-field`, `${fields} <br>`)
					}

					codeblock.replaceWith(el);
				} else if (codeblock.innerText === "%CHILDREN") {
					let info = [];

					getChildren(this.app.workspace.getActiveFile()).forEach((child) => {
						let date = "-";

						const fm = this.app.metadataCache.getFileCache(child).frontmatter;
						if (fm && fm.date) {
							date = fm.date;
						}

						info.push([child.basename, date]);
					});

					if (info.length == 0) {
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

					for (const c of info) {
						row = body.createEl("tr");
						let t = row.createEl("td", {text: ""});
						t.innerHTML = internalLink(c[0], c[0].replaceAll(this.app.workspace.getActiveFile().basename, "").trim());
						row.createEl("td", {text: c[1]});
					}

					codeblock.replaceWith(el);
				}
			}
		});

		// this.addSettingTab(new SettingsTab(this.app, this));
	}

	// async loadSettings() {
	// 	this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	// }
	//
	// async saveSettings() {
	// 	await this.saveData(this.settings);
	// 	this.loadSettings();
	// }

	onunload() {
	}

}
