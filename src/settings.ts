import { PluginSettingTab, Setting } from 'obsidian'

export interface Settings {
  propertiesStyle: string;
}

export const DEFAULT_SETTINGS: Partial<Settings> = {
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
