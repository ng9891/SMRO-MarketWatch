import {Client} from 'discord.js';
import dotenv from 'dotenv';
dotenv.config({path: './conf/.env'});
import intent from './IntentOptions';
import {onInteraction} from './events/onInteraction';
import {onReady} from './events/onReady';

(async () => {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token) return console.error('No DISCORD_TOKEN found');
  if (!clientId) return console.error('No DISCORD_CLIENT_ID found');
  if (!guildId) return console.error('No DISCORD_GUILD_ID found');

  const BOT = new Client({intents: intent});

  BOT.on('ready', async () => await onReady(BOT));
  BOT.on('interactionCreate', async (interaction) => await onInteraction(interaction));

  await BOT.login(token);
})();
