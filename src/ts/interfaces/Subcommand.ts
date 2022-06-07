import {CommandInteraction, WebhookEditMessageOptions, ButtonInteraction, SelectMenuInteraction} from 'discord.js';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
export interface Subcommand {
  data: SlashCommandSubcommandBuilder;
  run: (
    interaction: CommandInteraction | ButtonInteraction | SelectMenuInteraction
  ) => Promise<void | string | WebhookEditMessageOptions>;
}
