import {Client} from 'discord.js';
import {Routes} from 'discord-api-types/v9';
import {REST} from '@discordjs/rest';
import CommandList from '../commands/_CommandList';

// Deploy Commands
export const onReady = async (BOT: Client) => {
  const rest = new REST({version: '9'}).setToken(process.env.DISCORD_TOKEN as string);

  const commandData = CommandList.map((command) => command.data.toJSON());

  await rest.put(
    Routes.applicationGuildCommands(BOT.user?.id || 'missing id', process.env.DISCORD_GUILD_ID as string),
    {body: commandData}
  );
  
  console.log("SMRO-MarketWatch Bot is ready!");
};
