import { App, PluginSettingTab, Setting } from 'obsidian'
import {FileSuggest} from '../theme/FileSuggester'
import {FolderSuggest} from '../theme/FolderSuggester'
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
			.setName('🔑 Google Gemini API key')
			.setDesc('Grab one at: https://makersuite.google.com/app/apikey')
			.addText(text => text
				.setPlaceholder('Enter your key')
				.setValue(this.plugin.settings.geminiAPI)
				.onChange(async (value) => {
					this.plugin.settings.geminiAPI = value;
					await this.plugin.saveSettings();
				}));
    
    
    new Setting(this.containerEl)
      .setName('⚙️ Select System Prompt file')
      .setDesc('Choose a file for the global system prompt, which is used to set the default voice and behavior')
      .addSearch(searchComponent => {
        new FileSuggest(this.app, searchComponent.inputEl);
        searchComponent.setPlaceholder('Type to search for a file...')
          .setValue(this.plugin.settings.systemPrompt)
          .onChange(async (value) => {
            // The 'value' will be the file path selected by the user from the dropdown
            this.plugin.settings.systemPrompt = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(this.containerEl)
      .setName('🧰 Select Skill Prompt file')
      .setDesc('Choose a file for the global skill prompt, which is used to select skills to use')
      .addSearch(searchComponent => {
        new FileSuggest(this.app, searchComponent.inputEl);
        searchComponent.setPlaceholder('Type to search for a file...')
          .setValue(this.plugin.settings.skillPrompt)
          .onChange(async (value) => {
            // The 'value' will be the file path selected by the user from the dropdown
            this.plugin.settings.skillPrompt = value;
            await this.plugin.saveSettings();
          });
      });


    new Setting(this.containerEl)
      .setName('🗺️ Select Planning Prompt file')
      .setDesc('Choose a file for the global planning prompt, which is used to create a plan of action')
      .addSearch(searchComponent => {
        new FileSuggest(this.app, searchComponent.inputEl);
        searchComponent.setPlaceholder('Type to search for a file...')
          .setValue(this.plugin.settings.planningPrompt)
          .onChange(async (value) => {
            // The 'value' will be the file path selected by the user from the dropdown
            this.plugin.settings.planningPrompt = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(this.containerEl)
      .setName('📂 Select Skill Folder')
      .setDesc('Choose the default folder for skills')
      .addSearch(searchComponent => {
        new FolderSuggest(this.app, searchComponent.inputEl);
        searchComponent.setPlaceholder('Type to search for a folder...')
          .setValue(this.plugin.settings.skillFolder)
          .onChange(async (value) => {
            // The 'value' will be the Folder path selected by the user from the dropdown
            this.plugin.settings.skillFolder = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
