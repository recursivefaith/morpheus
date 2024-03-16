import { App, PluginSettingTab, Setting } from 'obsidian'
import {MorpheusCore} from '../../main'


export default class MorpheusSettingsTab extends PluginSettingTab {
	plugin: MorpheusCore;

	constructor(app: App, plugin: MorpheusCore) {
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
