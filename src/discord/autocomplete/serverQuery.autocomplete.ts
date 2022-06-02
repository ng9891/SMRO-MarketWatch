import {AutocompleteInteraction} from 'discord.js';
import {ServerName} from '../../ts/types/ServerName';
export const serverQuery = async (interaction: AutocompleteInteraction) => {
  const focusedValue = interaction.options.getFocused() as string;
  const choices = [
    {name: 'Helheim', value: 'HEL' as ServerName},
    {name: 'Niffleheim', value: 'NIF' as ServerName},
  ];

  const filtered = choices.filter((choice) => choice.name.toLowerCase().startsWith(focusedValue.toLowerCase()));

  await interaction.respond(filtered.map((choice) => ({name: choice.name, value: choice.value})));
};
