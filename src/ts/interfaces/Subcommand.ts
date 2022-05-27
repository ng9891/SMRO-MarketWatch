import {CommandInteraction, WebhookEditMessageOptions} from 'discord.js';
import {SlashCommandSubcommandBuilder} from '@discordjs/builders';
export interface Subcommand {
  data: SlashCommandSubcommandBuilder;
  run: (interaction: CommandInteraction) => Promise<void | string | WebhookEditMessageOptions>;
}
