import {Client} from 'discord.js';
import intent from './IntentOptions';
import {onInteraction} from './events/onInteraction';
import {onReady} from './events/onReady';

export const deployDiscordBot = async (token: string) => {
  const BOT = new Client({intents: intent});

  BOT.on('ready', async () => await onReady(BOT));
  BOT.on('interactionCreate', async (interaction) => await onInteraction(interaction));

  await BOT.login(token);
};
