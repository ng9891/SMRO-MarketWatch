import {AutocompleteInteraction} from 'discord.js';
export const serverQuery = async (interaction: AutocompleteInteraction) => {
  const focusedValue = interaction.options.getFocused() as string;
  const choices = [
    {name: 'Helheim', value: 'HEL'},
    {name: 'Niffleheim', value: 'NIF'},
  ];

  const filtered = choices.filter((choice) => choice.name.startsWith(focusedValue));

  await interaction.respond(filtered.map((choice) => ({name: choice.name, value: choice.value})));
};
