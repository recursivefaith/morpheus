import { App, PluginSettingTab, Setting } from 'obsidian'
import {HeleniteCore} from '../../main'


export default class HeleniteSettingsTab extends PluginSettingTab {
	plugin: HeleniteCore;

	constructor(app: App, plugin: HeleniteCore) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Google Gemini API key')
			.setDesc('Grab one at: https://makersuite.google.com/app/apikey')
			.addText(text => text
				.setPlaceholder('Enter your key')
				.setValue(this.plugin.settings.geminiAPI)
				.onChange(async (value) => {
					this.plugin.settings.geminiAPI = value;
					await this.plugin.saveSettings();
				}));
	}
}
