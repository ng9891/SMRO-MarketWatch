import {Command} from '../interfaces/Command';
import {SlashCommandBuilder} from '@discordjs/builders';

export const ping: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  run: async (interaction) => {
    await interaction.deferReply();
    const {user} = interaction;

    console.log(user);
    interaction.editReply('Pong!');
  },
};

/*
export const oneHundred: Command = {
  data: new SlashCommandBuilder()
    .setName("100")
    .setDescription("Check in for the 100 Days of Code challenge.")
    .addStringOption((option) =>
      option
        .setName("embed-id")
        .setDescription("ID of the message to edit.")
        .setRequired(true)
    ),
  run: async (interaction) => {
    await interaction.deferReply();
    const { user } = interaction;
    const text = interaction.options.getString("message", true);
  },
};
*/
