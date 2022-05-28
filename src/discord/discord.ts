import {Client, MessagePayload, TextChannel} from 'discord.js';
import intent from './IntentOptions';
import {onInteraction} from './events/onInteraction';
import {onReady} from './events/onReady';
import {text} from 'stream/consumers';

export const BOT = new Client({intents: intent});

export const deployDiscordBot = async (token: string) => {
  BOT.on('ready', async () => await onReady(BOT));
  BOT.on('interactionCreate', async (interaction) => await onInteraction(interaction));

  await BOT.login(token);
};

export const sendMsgBot = async (msg: string | MessagePayload, channelID: string) => {
  const channel = BOT.channels.cache.get(channelID);
  if (!channel) throw new Error('Failed to get channel,');
  if (channel.type !== 'GUILD_TEXT') throw new Error('Channel is not a text channel,');
  const textChannel = channel as TextChannel;
  await textChannel.send(msg);
};
