import { PluginSettingTab, Setting } from 'obsidian'

export interface Settings {
  displayNames: string;
	imageProperties: string;
	omittedProperties: string;
}

export const DEFAULT_SETTINGS: Partial<Settings> = {
	displayNames: "imdb: IMDb",
	imageProperties: "cover",
	omittedProperties: "dont display",
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
			.setName("Display names")
			.setDesc("Replace property names via a key:value pair")
			.addText((text) => {
				text
					.setPlaceholder("imdb: IMDb; release date: Released; ...")
					.setValue(this.plugin.settings.displayNames)
					.onChange(async (value) => {
						this.plugin.settings.displayNames = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Image Properties")
			.setDesc("These properties are rendered as images")
			.addText((text) => {
				text
					.setPlaceholder("cover; image; ...")
					.setValue(this.plugin.settings.imageProperties)
					.onChange(async (value) => {
						this.plugin.settings.imageProperties = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Omitted Properties")
			.addText((text) => {
				text
					.setPlaceholder("tags; meta; ...")
					.setValue(this.plugin.settings.omittedProperties)
					.onChange(async (value) => {
						this.plugin.settings.omittedProperties = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
