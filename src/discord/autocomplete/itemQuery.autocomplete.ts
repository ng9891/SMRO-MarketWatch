import {AutocompleteInteraction} from 'discord.js';
import {ItemChoice} from '../../ts/types/ItemChoice';
import {promises as fs} from 'fs';
import path from 'path';

export const itemQuery = async (interaction: AutocompleteInteraction) => {
  const data = await fs.readFile(path.resolve(__dirname, '../../assets/iteminfo.json'), 'utf8');
  const choices = JSON.parse(data) as ItemChoice[];

  const focusedValue = interaction.options.getFocused() as string;

  const isNum = !focusedValue || isNaN(Number(focusedValue)) || focusedValue.startsWith('+') ? false : true;
  const filtered = choices
    .filter((choice) => {
      if (isNum) return choice.id.toString().startsWith(focusedValue);
      return choice.name.toLowerCase().includes(focusedValue.toLowerCase());
    })
    .slice(0, 25);

  await interaction.respond(
    filtered.map((choice) => ({name: `${choice.id} - ${choice.name}`, value: `${choice.id}=${choice.name}`}))
  );
};
