import dotenv from 'dotenv';
import {deployDiscordBot} from './discord/discord';

dotenv.config({path: './conf/.env'});

(() => {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;
  const maxThreshold = process.env.MAX_THRESHOLD;
  const itemURL = process.env.ITEM_URL;
  const thumbURL = process.env.THUMBNAIL_URL;
  const maxListSize = process.env.MAX_LIST_SIZE;
  const recurr = process.env.DEFAULT_RECURRANCE_MINUTES;

  if (!token) return console.error('No DISCORD_TOKEN found');
  if (!clientId) return console.error('No DISCORD_CLIENT_ID found');
  if (!guildId) return console.error('No DISCORD_GUILD_ID found');
  if (!maxThreshold) return console.error('No MAX_THRESHOLD found');
  if (!itemURL) return console.error('No ITEM_URL found');
  if (!thumbURL) return console.error('No THUMBNAIL_URL found');
  if (!maxListSize) return console.error('No MAX_LIST_SIZE found');
  if (!recurr) return console.error('No DEFAULT_RECURRANCE_MINUTES found');

  deployDiscordBot(token);
})();