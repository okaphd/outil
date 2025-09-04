import { Plugin } from 'obsidian';
import { Settings, DEFAULT_SETTINGS, SettingsTab } from './settings.ts';
import { toHTML, internalLink, getChildren, create, parseDate } from './utils.ts';

export default class Utils extends Plugin {
	settings: Settings;
	replacees: Map<string, string> = new Map();
	imageProperties: string[] = [];
	omittedProperties: string[] = [];

	async onload() {
		await this.loadSettings();

		this.registerMarkdownPostProcessor((element, context) => {
			for (let codeblock of element.findAll('code')) {
				if (codeblock.innerText === "%PROPERTIES") {
					let el = codeblock.createSpan({ cls: "ou-properties" });

					for (let i in context.frontmatter) {
						if (this.omittedProperties.contains(i)) {
							continue
						} else if (this.imageProperties.contains(i)) {
							create(el, "", `<br><img src="${context.frontmatter[i]}" width="400">`)
							continue;
						}

						let allTags = false;

						let key = i;
						for (const k of this.replacees.keys()) {
							key = key.replaceAll(k, this.replacees.get(k));
						}

						let fields = "";
						if (Array.isArray(context.frontmatter[i])) {
							for (let j in context.frontmatter[i]) {
								const field = context.frontmatter[i][j];
								let s = toHTML(field) + ", ";

								if (i == "tags" && !field.startsWith("#")) {
									s = `${toHTML('#' + field)}, `;
								}

								fields += s;
							}
							fields = fields.substring(0, fields.length-2);
						} else if (context.frontmatter[i] != null) {
							let s = toHTML(context.frontmatter[i]);

							if (i.contains("date")) {
								s = parseDate(s);
							}

							fields += s;
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
					row.createEl("th", {text: "Children"});
					// row.createEl("th", {text: "Date"});

					let body = table.createEl("tbody")

					for (const c of info) {
						row = body.createEl("tr");
						let t = row.createEl("td", { text: "" });
						t.innerHTML = internalLink(c[0]);
						// row.createEl("td", { text: parseDate(c[1]) });
					}

					codeblock.replaceWith(el);
				} else if (codeblock.innerText === "%CHILDREN_TEXT") {
					let children = getChildren(this.app.workspace.getActiveFile()).reverse();

					if (children.length == 0) {
						codeblock.remove();
						return;
					}

					let el = codeblock.createSpan({ cls: "ou-properties" });

					let childrenHTML = "";
					children.forEach(c => {
						childrenHTML += internalLink(c.basename) + ", ";
					});
					childrenHTML = childrenHTML.substring(0, childrenHTML.length-2);

					create(el, `ou-properties-key`, `<strong>Children</strong>`)
					create(el, `ou-properties-field`, `${childrenHTML} <br>`)

					codeblock.replaceWith(el);
				}
			}
		});

		this.addSettingTab(new SettingsTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

		this.replacees.clear();
		this.settings.replacees.replaceAll("; ", ";").replaceAll(": ", ":").split(";").forEach((a) => {
			if (a.trim() == "")
				return;

			const split = a.split(":");
			this.replacees.set(split[0], split[1]);
		});

		this.imageProperties = [];
		this.settings.imageProperties.replaceAll("; ", ";").split(";").forEach((a) => {
			this.imageProperties.push(a);
		});

		this.omittedProperties = [];
		this.settings.omittedProperties.replaceAll("; ", ";").split(";").forEach((a) => {
			this.omittedProperties.push(a);
		});
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.loadSettings();
	}

	onunload() {
	}

}
