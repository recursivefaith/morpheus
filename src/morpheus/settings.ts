import { App, PluginSettingTab, Setting } from 'obsidian'
import {FileSuggest} from '../theme/FileSuggester'
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

    new Setting(this.containerEl)
      .setName('Select Configuration File')
      .setDesc('Choose a file for configuration')
      .addSearch(searchComponent => {
        new FileSuggest(this.app, searchComponent.inputEl);
        searchComponent.setPlaceholder('Type to search for a file...')
          .setValue(this.plugin.settings.selectedFilePath)
          .onChange(async (value) => {
            // The 'value' will be the file path selected by the user from the dropdown
            this.plugin.settings.selectedFilePath = value;
            await this.plugin.saveSettings();
          });
      });
	}
}
