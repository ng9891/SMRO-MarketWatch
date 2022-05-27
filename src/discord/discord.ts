import {Client} from 'discord.js';
import intent from './IntentOptions';
import {onInteraction} from './events/onInteraction';
import {onReady} from './events/onReady';

export const BOT = new Client({intents: intent});

export const deployDiscordBot = async (token: string) => {

  BOT.on('ready', async () => await onReady(BOT));
  BOT.on('interactionCreate', async (interaction) => await onInteraction(interaction));

  await BOT.login(token);
};
