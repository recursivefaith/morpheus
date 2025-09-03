import { MorpheusCore } from '..';
import { TFile } from 'obsidian';

/**
 * - Extracts skills from a folder
 * - Extracts actions from each file
 * - Sends to LLM to compare skillPrompt to each action
 * - On success, store the skill in stack of potential actions to use
 * - Send stack of skills to LLM to create a plan of action
 *
 * @param baseClass
 * @returns
 */
export default function mixinSkills(baseClass) {
  return class extends baseClass {
    /**
     * Gets all the skills in settings.
     */
    getSkills() {
      const files = this.app.vault
        .getFiles()
        .filter((file) => file.path.startsWith(this.settings.skillFolder));
      const skills = [];

      // Read all files in each folder
      files.forEach(async (file) => {
        const fileContent = await this.app.vault.read(file);
        console.log(fileContent);
      });
    }
  };
}
