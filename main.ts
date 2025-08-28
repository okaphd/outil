import { Plugin, PluginSettingTab, Setting } from 'obsidian';

interface Settings {
  propertiesStyle: string;
}

const DEFAULT_SETTINGS: Partial<Settings> = {
	propertiesStyle: "Default",
};

export class SettingsTab extends PluginSettingTab {
	plugin: Utils;

	constructor(app: App, plugin: Utils) {
    super(app, plugin);
    this.plugin = plugin;
  }

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
		 .setName("Properties Style")
     .addDropdown((dropdown) =>
        dropdown
          .addOption('1', 'Default')
          .addOption('2', 'Dataview')
          .setValue(this.plugin.settings.propertiesStyle)
          .onChange(async (value) => {
             this.plugin.settings.propertiesStyle = value;
             await this.plugin.saveSettings();
          })
		);
	}

}

function toHTML(input: string) {
	const link = [...input.matchAll(new RegExp("(?<=\\[\\[).*(?=\\]\\])", "gm"))][0];

	if (link && link[0]) {
		return toLink(link[0]);
	}

	const tag = [...input.matchAll(new RegExp("(?<=\\#).*", "gm"))][0];
	if (tag && tag[0]) {
		return `<a href="#${tag[0]}" class="tag" target="_blank" rel="noopener nofollow">#${tag[0]}</a>`
	}

	return input;
}

function toLink(link: string, display: string = link) {
	return `<a data-href="${link}" href="${link}" class="internal-link" target="_blank" rel="noopener nofollow">${display}</a>`;
}

function getChildren(file: TFile) {
	let children: TFile[] = [];
	this.app.vault.getMarkdownFiles().forEach((f: TFile) => {
		const fm = this.app.metadataCache.getFileCache(f).frontmatter
		if (fm && fm.parents && fm.parents.contains("[[" + file.basename + "]]")) {
			children.push(f);
		}
	});
	return children;
}

export default class Utils extends Plugin {
	settings: Settings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownPostProcessor((element, context) => {
			const codeblocks = element.findAll('code');

			for (let codeblock of codeblocks) {
				const text = codeblock.innerText.trim();
				if (text[0] === '%') {
					if (text === "%PROPERTIES") {
						let el = codeblock.createSpan({ cls: "ou-properties" });

						const cls_suffix = this.settings.propertiesStyle == 2 ? "" : "-djs";

						for (let i in context.frontmatter) {
							if (i == "cover") {
								let img = el.createSpan({ text: "" });
								img.innerHTML = `<br><img src="${context.frontmatter[i]}" width="400">`;
								continue;
							}

							let container =    el.createSpan({ text: "", cls: "ou-properties-container" + cls_suffix });
							let key =   container.createSpan({ text: "", cls: "ou-properties-key" + cls_suffix       });
							let field = container.createSpan({ text: "", cls: "ou-properties-field" + cls_suffix     });
							const text = i.replace("imdb", "IMDb");
							key.innerHTML += "<strong>" + text + "</strong>";

							if (Array.isArray(context.frontmatter[i])) {
								for (let j in context.frontmatter[i]) {
									field.innerHTML += toHTML(context.frontmatter[i][j]) + ", ";
								}
								field.innerHTML = field.innerHTML.substring(0, field.innerHTML.length-2);
							} else if (context.frontmatter[i] != null) {
								field.innerHTML += toHTML(context.frontmatter[i]);
							}
							console.log(field.innerHTML);
							field.innerHTML += " <br>";
						}

						codeblock.replaceWith(el);
					} else if (text === "%CHILDREN") {
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
							t.innerHTML = toLink(c[0], c[0].replaceAll(this.app.workspace.getActiveFile().basename, "").trim());
							row.createEl("td", {text: c[1]});
						}

						codeblock.replaceWith(el);
					}
				}
			}
		});

		this.addSettingTab(new SettingsTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.loadSettings();
	}

	onunload() {
	}

}
